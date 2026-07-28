import { query } from "#root/shared/database/drizzle/db";
import {
  order,
  orderItem,
  orderLog,
  product,
  user,
} from "#root/shared/database/drizzle/schema";
import { ServerError } from "#root/shared/error/server";
import { and, eq, sql } from "drizzle-orm";
import { Effect } from "effect";
import { z } from "zod";
import type { ClientSession } from "#root/backend/auth/shared/entities";

export const editOrderSchema = z.object({
  orderId: z.string().uuid(),
  // Quantity to set for each existing order item. Setting quantity to 0
  // removes the item from the order and fully restores its stock.
  items: z
    .array(
      z.object({
        orderItemId: z.string().uuid(),
        quantity: z.number().int().min(0).max(1000),
      }),
    )
    .min(1),
});

export const editOrder = (
  input: z.infer<typeof editOrderSchema>,
  session?: ClientSession,
) =>
  Effect.gen(function* ($) {
    if (!session || session.role !== "admin") {
      return yield* $(
        Effect.fail(
          new ServerError({
            tag: "Forbidden",
            message: "Admin access required",
            statusCode: 403,
            clientMessage: "Admin access required",
          }),
        ),
      );
    }

    const { orderId, items } = input;

    return yield* $(
      query(async (db) => {
        return await db.transaction(async (tx) => {
          const existingOrder = await tx
            .select({
              id: order.id,
              status: order.status,
              shipping: order.shipping,
              tax: order.tax,
              discount: order.discount,
            })
            .from(order)
            .where(eq(order.id, orderId))
            .execute();

          if (!existingOrder || existingOrder.length === 0) {
            throw new ServerError({
              tag: "OrderNotFound",
              message: `Order with ID ${orderId} not found`,
              statusCode: 404,
              clientMessage: "Order not found",
            });
          }

          const existingItems = await tx
            .select({
              id: orderItem.id,
              productId: orderItem.productId,
              quantity: orderItem.quantity,
              price: orderItem.price,
              discountPrice: orderItem.discountPrice,
            })
            .from(orderItem)
            .where(eq(orderItem.orderId, orderId))
            .execute();

          const existingById = new Map(existingItems.map((it) => [it.id, it]));

          for (const change of items) {
            const existing = existingById.get(change.orderItemId);
            if (!existing) {
              throw new ServerError({
                tag: "OrderItemNotFound",
                message: `Order item ${change.orderItemId} not found on this order`,
                statusCode: 404,
                clientMessage: "One of the items on this order could not be found",
              });
            }

            const delta = change.quantity - existing.quantity;
            if (delta === 0) continue;

            if (delta > 0) {
              // Increasing quantity — make sure enough stock exists.
              const productRow = await tx
                .select({ stock: product.stock })
                .from(product)
                .where(eq(product.id, existing.productId))
                .execute();

              const availableStock = productRow[0]?.stock ?? 0;
              if (availableStock < delta) {
                throw new ServerError({
                  tag: "InsufficientStock",
                  message: `Not enough stock to increase quantity (available: ${availableStock}, requested increase: ${delta})`,
                  statusCode: 400,
                  clientMessage: `Not enough stock available to increase this item's quantity (only ${availableStock} left).`,
                });
              }

              await tx
                .update(product)
                .set({ stock: sql`${product.stock} - ${delta}` })
                .where(eq(product.id, existing.productId));
            } else {
              // Decreasing (or removing) — release the difference back to stock.
              await tx
                .update(product)
                .set({ stock: sql`${product.stock} + ${-delta}` })
                .where(eq(product.id, existing.productId));
            }

            if (change.quantity === 0) {
              await tx.delete(orderItem).where(eq(orderItem.id, existing.id));
            } else {
              await tx
                .update(orderItem)
                .set({ quantity: change.quantity })
                .where(eq(orderItem.id, existing.id));
            }
          }

          // Recompute totals from the updated line items. Shipping/tax/
          // discount are left as originally applied — this is a quantity
          // correction, not a full re-checkout.
          const refreshedItems = await tx
            .select({
              quantity: orderItem.quantity,
              price: orderItem.price,
              discountPrice: orderItem.discountPrice,
            })
            .from(orderItem)
            .where(eq(orderItem.orderId, orderId))
            .execute();

          if (refreshedItems.length === 0) {
            throw new ServerError({
              tag: "OrderWouldBeEmpty",
              message: "An order must have at least one item",
              statusCode: 400,
              clientMessage: "An order can't be edited down to zero items — cancel or delete it instead.",
            });
          }

          const subtotal = refreshedItems.reduce((acc, item) => {
            const effectivePrice = item.discountPrice
              ? Number.parseFloat(item.discountPrice.toString())
              : Number.parseFloat(item.price.toString());
            return acc + effectivePrice * item.quantity;
          }, 0);

          const shipping = Number.parseFloat(
            existingOrder[0]?.shipping?.toString() ?? "0",
          );
          const tax = Number.parseFloat(
            existingOrder[0]?.tax?.toString() ?? "0",
          );
          const discount = Number.parseFloat(
            existingOrder[0]?.discount?.toString() ?? "0",
          );
          const total = Math.max(0, subtotal + shipping + tax - discount);

          const updatedOrder = await tx
            .update(order)
            .set({
              subtotal: subtotal.toFixed(2),
              total: total.toFixed(2),
              updatedAt: new Date(),
            })
            .where(eq(order.id, orderId))
            .returning();

          const userData = await tx
            .select({ id: user.id })
            .from(user)
            .where(eq(user.email, session.email))
            .execute();

          await tx.insert(orderLog).values({
            orderId,
            userId: userData[0]?.id,
            action: "items_edited",
            oldStatus: existingOrder[0]?.status,
            newStatus: existingOrder[0]?.status,
            note: `Order items edited by ${session.role}`,
          });

          return updatedOrder[0];
        });
      }),
    );
  });
