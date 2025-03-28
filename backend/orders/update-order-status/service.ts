import { query } from "#root/shared/database/drizzle/db";
import { order, orderItem } from "#root/shared/database/drizzle/schema";
import { Effect } from "effect";
import { z } from "zod";
import type { ClientSession } from "#root/backend/auth/shared/entities";
import { ServerError } from "#root/shared/error/server";
import { and, eq, inArray } from "drizzle-orm";

export const updateOrderStatusSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum([
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ]),
});

export const updateOrderStatus = (
  input: z.infer<typeof updateOrderStatusSchema>,
  session?: ClientSession
) =>
  Effect.gen(function* ($) {
    if (!session) {
      return yield* $(
        Effect.fail(
          new ServerError({
            tag: "Unauthorized",
            message: "You must be logged in to update order status",
            statusCode: 401,
            clientMessage: "You must be logged in to update order status",
          })
        )
      );
    }

    const { orderId, status } = input;
    const isAdmin = session.role === "admin";
    const isVendor = session.role === "vendor";

    if (!isAdmin && !isVendor) {
      return yield* $(
        Effect.fail(
          new ServerError({
            tag: "Forbidden",
            message: "Only admins and vendors can update order status",
            statusCode: 403,
            clientMessage: "You don't have permission to update order status",
          })
        )
      );
    }

    return yield* $(
      query(async (db) => {
        return await db.transaction(async (tx) => {
          const orderData = await tx
            .select({ id: order.id })
            .from(order)
            .where(eq(order.id, orderId))
            .execute();

          if (!orderData || orderData.length === 0) {
            throw new ServerError({
              tag: "OrderNotFound",
              message: `Order with ID ${orderId} not found`,
              statusCode: 404,
              clientMessage: "Order not found",
            });
          }

          if (isVendor && session.vendorId) {
            const vendorItems = await tx
              .select({ id: orderItem.id })
              .from(orderItem)
              .where(
                and(
                  eq(orderItem.orderId, orderId),
                  eq(orderItem.vendorId, session.vendorId)
                )
              )
              .execute();

            if (!vendorItems || vendorItems.length === 0) {
              throw new ServerError({
                tag: "Forbidden",
                message: "You don't have items in this order",
                statusCode: 403,
                clientMessage: "You don't have permission to update this order",
              });
            }
          }

          const updateResult = await tx
            .update(order)
            .set({ status })
            .where(eq(order.id, orderId))
            .returning();

          if (!updateResult || updateResult.length === 0) {
            throw new ServerError({
              tag: "UpdateFailed",
              message: "Failed to update order status",
              statusCode: 500,
              clientMessage: "Failed to update order status. Please try again.",
            });
          }

          return updateResult[0];
        });
      })
    );
  });
