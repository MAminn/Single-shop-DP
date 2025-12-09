import type { ClientSession } from "#root/backend/auth/shared/entities";
import { query } from "#root/shared/database/drizzle/db";
import {
  orderItem,
  product,
  vendor,
} from "#root/shared/database/drizzle/schema";
import { ServerError } from "#root/shared/error/server";
import { and, count, desc, eq, sql, sum } from "drizzle-orm";
import { Effect } from "effect";
import { z } from "zod";
import { checkVendorStatus } from "#root/backend/vendor/utils/check-vendor-status";

export const getTopSellingSchema = z.object({
  vendorId: z.string().optional(),
  limit: z.number().min(1).default(5),
});

export interface TopSellingProduct {
  id: string;
  name: string;
  price: number;
  sold: number;
  revenue: number;
  vendorName?: string;
}

export const getTopSelling = (
  input: z.infer<typeof getTopSellingSchema>,
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
      yield* $(checkVendorStatus(targetVendorId, session, "view top selling products"));
    }

    return yield* $(
      query(async (db) => {
        // Base query to get sales data
        const baseQuery = db
          .select({
            id: product.id,
            name: product.name,
            price: product.price,
            sold: sum(orderItem.quantity),
            revenue: sql<number>`sum(${orderItem.price} * ${orderItem.quantity})`,
            vendorId: orderItem.vendorId,
            vendorName: vendor.name,
          })
          .from(orderItem)
          .innerJoin(product, eq(orderItem.productId, product.id))
          .innerJoin(vendor, eq(orderItem.vendorId, vendor.id))
          .groupBy(
            product.id,
            product.name,
            product.price,
            orderItem.vendorId,
            vendor.name
          )
          .orderBy(desc(sql`sum(${orderItem.quantity})`))
          .limit(input.limit);

        // Add vendor filter if needed
        const results = targetVendorId
          ? await baseQuery.where(eq(orderItem.vendorId, targetVendorId))
          : await baseQuery;

        // Format results
        return results.map((item) => ({
          id: item.id,
          name: item.name,
          price: Number(item.price),
          sold: Number(item.sold || 0),
          revenue: Number(item.revenue || 0),
          vendorName: item.vendorName,
        }));
      })
    );
  });
