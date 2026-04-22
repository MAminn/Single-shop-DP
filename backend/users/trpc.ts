import { adminProcedure, publicProcedure, router } from "#root/shared/trpc/server";
import { z } from "zod";
import { eq, desc, ilike, or, count } from "drizzle-orm";
import { user, order, orderItem } from "#root/shared/database/drizzle/schema";

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
    .input(z.object({ id: z.string().uuid() }))
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
});
