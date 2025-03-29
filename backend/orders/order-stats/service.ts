import type { ClientSession } from "#root/backend/auth/shared/entities";
import { query } from "#root/shared/database/drizzle/db";
import { order, orderItem } from "#root/shared/database/drizzle/schema";
import { ServerError } from "#root/shared/error/server";
import { and, count, eq, inArray } from "drizzle-orm";
import { Effect } from "effect";
import { z } from "zod";

export const getOrderStatsSchema = z.object({
  vendorId: z.string().optional(),
});

export interface OrderStats {
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

function normalizeCount(rows: { count: number }[]): number {
  return rows[0]?.count ?? 0;
}

export const getOrderStats = (
  input: z.infer<typeof getOrderStatsSchema>,
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

    return yield* $(
      query(async (db) => {
        let orderIds: string[] | undefined;

        // If we're filtering by vendor, first get all order IDs for this vendor
        if (targetVendorId) {
          const orderItemsResult = await db
            .select({ orderId: orderItem.orderId })
            .from(orderItem)
            .where(eq(orderItem.vendorId, targetVendorId));

          orderIds = [...new Set(orderItemsResult.map((item) => item.orderId))];

          // If no orders found, return zeros
          if (orderIds.length === 0) {
            return {
              pending: 0,
              processing: 0,
              shipped: 0,
              delivered: 0,
              cancelled: 0,
            };
          }
        }

        // Base filter condition
        const baseCondition = orderIds
          ? inArray(order.id, orderIds)
          : undefined;

        // Get pending orders count
        const pendingCount = await db
          .select({ count: count() })
          .from(order)
          .where(
            baseCondition
              ? and(baseCondition, eq(order.status, "pending"))
              : eq(order.status, "pending")
          )
          .then(normalizeCount);

        // Get processing orders count
        const processingCount = await db
          .select({ count: count() })
          .from(order)
          .where(
            baseCondition
              ? and(baseCondition, eq(order.status, "processing"))
              : eq(order.status, "processing")
          )
          .then(normalizeCount);

        // Get shipped orders count
        const shippedCount = await db
          .select({ count: count() })
          .from(order)
          .where(
            baseCondition
              ? and(baseCondition, eq(order.status, "shipped"))
              : eq(order.status, "shipped")
          )
          .then(normalizeCount);

        // Get delivered orders count
        const deliveredCount = await db
          .select({ count: count() })
          .from(order)
          .where(
            baseCondition
              ? and(baseCondition, eq(order.status, "delivered"))
              : eq(order.status, "delivered")
          )
          .then(normalizeCount);

        // Get cancelled orders count
        const cancelledCount = await db
          .select({ count: count() })
          .from(order)
          .where(
            baseCondition
              ? and(baseCondition, eq(order.status, "cancelled"))
              : eq(order.status, "cancelled")
          )
          .then(normalizeCount);

        // Return order stats
        const orderStats: OrderStats = {
          pending: pendingCount,
          processing: processingCount,
          shipped: shippedCount,
          delivered: deliveredCount,
          cancelled: cancelledCount,
        };

        return orderStats;
      })
    );
  });
