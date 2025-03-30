import type { ClientSession } from "#root/backend/auth/shared/entities";
import { query } from "#root/shared/database/drizzle/db.js";
import { user, vendor } from "#root/shared/database/drizzle/schema.js";
import { ServerError } from "#root/shared/error/server";
import { desc, eq, ilike, inArray, or } from "drizzle-orm";
import { Effect } from "effect";
import { z } from "zod";

export const viewVendorsSchema = z.object({
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
  statuses: z
    .array(z.enum(["pending", "active", "inactive", "suspended", "rejected"]))
    .optional()
    .catch([]),
  search: z.string().max(255).optional(),
});

export const viewVendors = (
  input: z.infer<typeof viewVendorsSchema>,
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

    return yield* $(
      query(async (db) => {
        const preparedQuery = db
          .select({
            id: vendor.id,
            name: vendor.name,
            createdAt: vendor.createdAt,
            status: vendor.status,
            ownerEmail: user.email,
            ownerName: user.name,
          })
          .from(vendor)
          .leftJoin(user, eq(vendor.id, user.vendorId))
          .limit(input.limit ?? 10)
          .offset(input.offset ?? 0)
          .orderBy(desc(vendor.createdAt))
          .$dynamic();

        if (input.statuses && input.statuses.length > 0) {
          preparedQuery.where(inArray(vendor.status, input.statuses));
        }

        if (input.search) {
          preparedQuery.where(
            or(
              ilike(vendor.name, `%${input.search}%`),
              ilike(user.email, `%${input.search}%`),
              ilike(user.name, `%${input.search}%`)
            )
          );
        }

        return await preparedQuery.execute();
      })
    );
  });

export type ViewVendorsResult = Effect.Effect.Success<
  Awaited<ReturnType<typeof viewVendors>>
>;
