import type { ClientSession } from "#root/backend/auth/shared/entities.js";
import { query } from "#root/shared/database/drizzle/db.js";
import {
  user,
  vendor,
  vendorLog,
} from "#root/shared/database/drizzle/schema.js";
import { ServerError } from "#root/shared/error/server.js";
import { eq } from "drizzle-orm";
import { Effect } from "effect";
import { Array as EffectArray, Option } from "effect";
import { z } from "zod";

export const approveVendorSchema = z.object({
  id: z.string().uuid(),
});

export const approveVendor = (
  input: z.infer<typeof approveVendorSchema>,
  session?: ClientSession
) =>
  Effect.gen(function* ($) {
    if (!session || session.role !== "admin") {
      return yield* $(
        Effect.fail(
          new ServerError({
            tag: "Unauthorized",
            statusCode: 401,
            clientMessage: "Unauthorized",
          })
        )
      );
    }

    const maybeVendor = yield* $(
      query(async (db) => {
        return await db
          .select({
            id: vendor.id,
            name: vendor.name,
            createdAt: vendor.createdAt,
            status: vendor.status,
            ownerId: user.id,
            ownerEmail: user.email,
            ownerName: user.name,
          })
          .from(vendor)
          .leftJoin(user, eq(vendor.id, user.vendorId))
          .where(eq(vendor.id, input.id));
      }),
      Effect.map(EffectArray.head)
    );

    if (Option.isNone(maybeVendor)) {
      return yield* $(
        Effect.fail(
          new ServerError({
            tag: "VendorNotFound",
            statusCode: 404,
            clientMessage: "Vendor not found",
          })
        )
      );
    }

    const targetVendor = Option.getOrThrow(maybeVendor);

    if (targetVendor.status === "active") {
      return yield* $(
        Effect.fail(
          new ServerError({
            tag: "VendorAlreadyActive",
            statusCode: 400,
            clientMessage: "Vendor already active",
          })
        )
      );
    }

    return yield* $(
      query(async (db) => {
        return await db.transaction(async (tx) => {
          const actionUser = await tx
            .select({
              id: user.id,
            })
            .from(user)
            .where(eq(user.email, session.email))
            .then((data) => data[0]);

          if (!actionUser) {
            throw new Error("User not found");
          }

          const approve = tx
            .update(vendor)
            .set({ status: "active", updatedAt: new Date() })
            .where(eq(vendor.id, targetVendor.id));

          const logApprove = tx.insert(vendorLog).values({
            action: "approved",
            userId: actionUser.id,
            vendorId: targetVendor.id,
          });

          if (targetVendor.ownerId) {
            const verifyVendorEmail = tx
              .update(user)
              .set({ emailVerified: true })
              .where(eq(user.id, targetVendor.ownerId));

            await Promise.all([approve, verifyVendorEmail, logApprove]);
          } else {
            await Promise.all([approve, logApprove]);
          }
        });
      })
    );
  });
