import type { ClientSession } from "#root/backend/auth/shared/entities";
import { query } from "#root/shared/database/drizzle/db";
import { order, orderItem } from "#root/shared/database/drizzle/schema";
import { ServerError } from "#root/shared/error/server";
import { eq, sql, sum, inArray } from "drizzle-orm";
import { Effect } from "effect";
import { z } from "zod";
import { checkVendorStatus } from "#root/backend/vendor/utils/check-vendor-status";

export const getTotalRevenueSchema = z.object({
  vendorId: z.string().optional(),
});

interface OrderData {
  id: string;
  subtotal: unknown;
  total: unknown;
}

interface OrderItemData {
  orderId: string;
  itemTotal: unknown;
  vendorId?: string;
}

export const getTotalRevenue = (
  input: z.infer<typeof getTotalRevenueSchema>,
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
      yield* $(checkVendorStatus(targetVendorId, session, "view revenue data"));
    }

    return yield* $(
      query(async (db) => {
        // For admin with no vendor filter, simply sum up all order totals
        if (!targetVendorId) {
          const result = await db
            .select({
              totalRevenue: sum(order.total),
            })
            .from(order);

          return Number(result[0]?.totalRevenue || 0);
        }

        // For vendor-specific data, we need to:
        // 1. Find all orders where this vendor has items
        // 2. For each order, calculate the vendor's proportion of the total
        // 3. Sum up these proportional totals

        // First, get all orderItems for this vendor
        const vendorOrderItems = await db
          .select({
            orderId: orderItem.orderId,
            itemTotal: sql<number>`${orderItem.price} * ${orderItem.quantity}`,
          })
          .from(orderItem)
          .where(eq(orderItem.vendorId, targetVendorId));

        if (vendorOrderItems.length === 0) {
          return 0;
        }

        // Get unique order IDs
        const orderIds = [
          ...new Set(vendorOrderItems.map((item) => item.orderId)),
        ];

        // Get full orders data
        const orders = await db
          .select({
            id: order.id,
            subtotal: order.subtotal,
            total: order.total,
          })
          .from(order)
          .where(inArray(order.id, orderIds));

        // For each order, get all items to calculate vendor's proportion
        const allOrderItems = await db
          .select({
            orderId: orderItem.orderId,
            itemTotal: sql<number>`${orderItem.price} * ${orderItem.quantity}`,
            vendorId: orderItem.vendorId,
          })
          .from(orderItem)
          .where(inArray(orderItem.orderId, orderIds));

        // Calculate total revenue with proportional taxes and fees
        let totalRevenue = 0;

        // Group items by order
        const itemsByOrder: Record<string, OrderItemData[]> = {};
        for (const item of allOrderItems) {
          if (!itemsByOrder[item.orderId]) {
            itemsByOrder[item.orderId] = [];
          }
          (itemsByOrder[item.orderId] as OrderItemData[]).push(item);
        }

        // Calculate revenue for each order
        for (const orderId of orderIds) {
          const orderData = orders.find((o) => o.id === orderId);
          if (!orderData) continue;

          const orderItems = itemsByOrder[orderId] || [];
          const orderSubtotal = Number(orderData.subtotal || 0);
          const orderTotal = Number(orderData.total || 0);

          // Calculate vendor's items total for this order
          const vendorItemsTotal = vendorOrderItems
            .filter((item) => item.orderId === orderId)
            .reduce((sum, item) => sum + Number(item.itemTotal || 0), 0);

          // Calculate all items total for this order
          const allItemsTotal = orderItems.reduce(
            (sum, item) => sum + Number(item.itemTotal || 0),
            0
          );

          // Calculate vendor's proportion of the order
          const vendorProportion =
            allItemsTotal > 0 ? vendorItemsTotal / allItemsTotal : 0;

          // Calculate extras (tax, shipping, etc.) as the difference between total and subtotal
          const extras = orderTotal - orderSubtotal;

          // Add vendor's revenue from this order (items + proportional extras)
          totalRevenue += vendorItemsTotal + extras * vendorProportion;
        }

        return totalRevenue;
      })
    );
  });
