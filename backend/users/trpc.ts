import { adminProcedure, publicProcedure, router } from "#root/shared/trpc/server";
import { z } from "zod";
import { eq, and, desc, ilike, or, count } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";
import { user, order, orderItem, account, session } from "#root/shared/database/drizzle/schema";
import { auth } from "#root/backend/auth/auth.server.js";
import { TRPCError } from "@trpc/server";

export const usersRouter = router({
  /** Admin-only: list all registered users with pagination */
  list: adminProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const db = ctx.db;
      const { limit, offset, search } = input;

      const where = search
        ? or(
            ilike(user.name, `%${search}%`),
            ilike(user.email, `%${search}%`),
            ilike(user.phone, `%${search}%`),
          )
        : undefined;

      const [rows, totalRows] = await Promise.all([
        db
          .select({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            emailVerified: user.emailVerified,
            createdAt: user.createdAt,
          })
          .from(user)
          .where(where)
          .orderBy(desc(user.createdAt))
          .limit(limit)
          .offset(offset),
        db
          .select({ total: count() })
          .from(user)
          .where(where),
      ]);

      return {
        success: true as const,
        result: {
          users: rows,
          total: totalRows[0]?.total ?? 0,
        },
      };
    }),

  /** Admin-only: get a single user with their full order history */
  getById: adminProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const db = ctx.db;

      const userRows = await db
        .select()
        .from(user)
        .where(eq(user.id, input.id))
        .limit(1);

      const userRow = userRows[0];
      if (!userRow) return { success: false as const, error: "User not found" };

      const orders = await db
        .select()
        .from(order)
        .where(eq(order.userId, input.id))
        .orderBy(desc(order.createdAt));

      const orderIds = orders.map((o) => o.id);

      let items: (typeof orderItem.$inferSelect)[] = [];
      if (orderIds.length > 0) {
        // Fetch order items for all orders
        const { inArray } = await import("drizzle-orm");
        items = await db
          .select()
          .from(orderItem)
          .where(inArray(orderItem.orderId, orderIds));
      }

      const itemsByOrder = items.reduce<Record<string, typeof items>>((acc, item) => {
        (acc[item.orderId] ??= []).push(item);
        return acc;
      }, {});

      return {
        success: true as const,
        result: {
          ...userRow,
          orders: orders.map((o) => ({
            ...o,
            items: itemsByOrder[o.id] ?? [],
          })),
        },
      };
    }),

  /** Admin-only: create a new user */
  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Invalid email"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        phone: z.string().default(""),
        role: z.enum(["admin", "vendor", "user"]).default("user"),
        emailVerified: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = ctx.db;

      // Check email uniqueness
      const existing = await db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.email, input.email.toLowerCase()))
        .limit(1);

      if (existing.length > 0) {
        throw new TRPCError({ code: "CONFLICT", message: "Email already in use" });
      }

      // Create user via better-auth API
      const result = await auth.api.signUpEmail({
        body: {
          email: input.email,
          password: input.password,
          name: input.name,
          phone: input.phone,
        },
        asResponse: false,
      }).catch((err: unknown) => {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: err instanceof Error ? err.message : "Failed to create user",
        });
      });

      if (!result?.user?.id) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create user" });
      }

      // Set role and emailVerified
      await db
        .update(user)
        .set({
          role: input.role,
          emailVerified: input.emailVerified,
          phone: input.phone,
          updatedAt: new Date(),
        })
        .where(eq(user.id, result.user.id));

      return { success: true as const, result: { id: result.user.id } };
    }),

  /** Admin-only: update a user's profile details */
  update: adminProcedure
    .input(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        role: z.enum(["admin", "vendor", "user"]).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = ctx.db;
      const { id, ...fields } = input;

      const existing = await db.select({ id: user.id }).from(user).where(eq(user.id, id)).limit(1);
      if (!existing.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      await db
        .update(user)
        .set({ ...fields, updatedAt: new Date() })
        .where(eq(user.id, id));

      return { success: true as const };
    }),

  /** Admin-only: delete a user and cascade their sessions */
  delete: adminProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const db = ctx.db;

      const existing = await db.select({ id: user.id }).from(user).where(eq(user.id, input.id)).limit(1);
      if (!existing.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      // Delete sessions and account rows first (cascade not always reliable for better-auth tables)
      await db.delete(session).where(eq(session.userId, input.id));
      await db.delete(account).where(eq(account.userId, input.id));
      await db.delete(user).where(eq(user.id, input.id));

      return { success: true as const };
    }),

  /** Admin-only: set email verification status */
  setVerified: adminProcedure
    .input(z.object({ id: z.string().min(1), verified: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(user)
        .set({ emailVerified: input.verified, updatedAt: new Date() })
        .where(eq(user.id, input.id));
      return { success: true as const };
    }),

  /** Admin-only: admin sets a new password for a user */
  adminSetPassword: adminProcedure
    .input(
      z.object({
        id: z.string().min(1),
        newPassword: z.string().min(8, "Password must be at least 8 characters"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = ctx.db;

      const userRow = await db
        .select({ id: user.id, email: user.email })
        .from(user)
        .where(eq(user.id, input.id))
        .limit(1);

      if (!userRow.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      const hashedPassword = await hashPassword(input.newPassword);

      // Upsert: update existing credential account, or insert one if missing
      // (covers old users who have no account row yet — admin resets their password
      // which creates the account row so they can log in with the new password).
      const existingAccount = await ctx.db
        .select({ id: account.id })
        .from(account)
        .where(and(eq(account.userId, input.id), eq(account.providerId, "credential")))
        .limit(1);

      if (existingAccount.length > 0 && existingAccount[0]) {
        await ctx.db
          .update(account)
          .set({ password: hashedPassword, updatedAt: new Date() })
          .where(eq(account.id, existingAccount[0].id));
      } else {
        const targetUser = userRow[0]!;
        await ctx.db.insert(account).values({
          id: crypto.randomUUID(),
          accountId: targetUser.email,
          providerId: "credential",
          userId: input.id,
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      return { success: true as const };
    }),

  /** Admin-only: get all user emails in one shot (for broadcast targeting) */
  getAllEmails: adminProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select({ email: user.email })
      .from(user)
      .orderBy(user.email);
    return { success: true as const, result: { emails: rows.map((r) => r.email) } };
  }),

  /** Admin-only: ban/unban a user */
  setBanned: adminProcedure
    .input(z.object({ id: z.string().min(1), banned: z.boolean(), reason: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(user)
        .set({
          banned: input.banned,
          banReason: input.banned ? (input.reason ?? null) : null,
          updatedAt: new Date(),
        })
        .where(eq(user.id, input.id));
      return { success: true as const };
    }),
});
