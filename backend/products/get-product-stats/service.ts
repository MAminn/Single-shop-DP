import type { ClientSession } from "#root/backend/auth/shared/entities";
import { query } from "#root/shared/database/drizzle/db";
import { product } from "#root/shared/database/drizzle/schema";
import { ServerError } from "#root/shared/error/server";
import { and, count, eq, gt, lte } from "drizzle-orm";
import { Effect } from "effect";
import { z } from "zod";
import { checkVendorStatus } from "#root/backend/vendor/utils/check-vendor-status";

export const getProductStatsSchema = z.object({
  vendorId: z.string().optional(),
  lowStockThreshold: z.number().default(5), // Low stock threshold
});

export interface ProductStats {
  total: number;
  outOfStock: number;
  lowStock: number;
  newThisWeek: number;
}

function normalizeCount(rows: { count: number }[]): number {
  return rows[0]?.count ?? 0;
}

export const getProductStats = (
  input: z.infer<typeof getProductStatsSchema>,
  session?: ClientSession
) =>
  Effect.gen(function* ($) {
    // Check for authorization
    if (!session) {
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

    // If vendorId is provided, make sure the user is authorized to view it
    if (
      input.vendorId &&
      session.role !== "admin" &&
      session.vendorId !== input.vendorId
    ) {
      return yield* $(
        Effect.fail(
          new ServerError({
            tag: "Forbidden",
            statusCode: 403,
            clientMessage: "You do not have permission to view this data",
          })
        )
      );
    }

    // If user is vendor, use their vendorId
    const targetVendorId =
      input.vendorId ||
      (session.role === "vendor" ? session.vendorId : undefined);

    // Check vendor status if user is a vendor
    if (session.role === "vendor" && targetVendorId) {
      yield* $(checkVendorStatus(targetVendorId, session, "view product statistics"));
    }

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return yield* $(
      query(async (db) => {
        // Base filter condition - either filter by vendor or get all products (admin only)
        const baseCondition = targetVendorId
          ? eq(product.vendorId, targetVendorId)
          : undefined;

        // Get total products count
        const totalCount = await db
          .select({ count: count() })
          .from(product)
          .where(baseCondition || undefined)
          .then(normalizeCount);

        // Get out of stock products count
        const outOfStockCount = await db
          .select({ count: count() })
          .from(product)
          .where(
            baseCondition
              ? and(baseCondition, eq(product.stock, 0))
              : eq(product.stock, 0)
          )
          .then(normalizeCount);

        // Get low stock products count
        const lowStockCount = await db
          .select({ count: count() })
          .from(product)
          .where(
            baseCondition
              ? and(
                  baseCondition,
                  and(
                    gt(product.stock, 0),
                    lte(product.stock, input.lowStockThreshold)
                  )
                )
              : and(
                  gt(product.stock, 0),
                  lte(product.stock, input.lowStockThreshold)
                )
          )
          .then(normalizeCount);

        // Get new products count (created in the last 7 days)
        const newProductsCount = await db
          .select({ count: count() })
          .from(product)
          .where(
            baseCondition
              ? and(baseCondition, gt(product.createdAt, oneWeekAgo))
              : gt(product.createdAt, oneWeekAgo)
          )
          .then(normalizeCount);

        // Return product stats
        const productStats: ProductStats = {
          total: totalCount,
          outOfStock: outOfStockCount,
          lowStock: lowStockCount,
          newThisWeek: newProductsCount,
        };

        return productStats;
      })
    );
  });
