import { query } from "#root/shared/database/drizzle/db";
import {
  order,
  orderItem,
  vendor,
  user,
} from "#root/shared/database/drizzle/schema";
import { and, desc, eq, inArray, type SQL } from "drizzle-orm";
import { Effect } from "effect";
import { z } from "zod";
import type { ClientSession } from "#root/backend/auth/shared/entities";
import { ServerError } from "#root/shared/error/server";

export const viewOrdersSchema = z.object({
  limit: z.number().min(1).max(100).optional().default(10),
  offset: z.number().min(0).optional().default(0),
  status: z
    .enum(["pending", "processing", "shipped", "delivered", "cancelled"])
    .optional(),
});

export const viewOrders = (
  input: z.infer<typeof viewOrdersSchema>,
  session?: ClientSession
) =>
  Effect.gen(function* ($) {
    if (!session) {
      return yield* $(
        Effect.fail(
          new ServerError({
            tag: "Unauthorized",
            message: "You must be logged in to view orders",
            statusCode: 401,
            clientMessage: "You must be logged in to view orders",
          })
        )
      );
    }

    const { limit, offset, status } = input;
    const isAdmin = session.role === "admin";
    const isVendor = session.role === "vendor";

    return yield* $(
      query(async (db) => {
        return await db.transaction(async (tx) => {
          const conditions: SQL<unknown>[] = [];

          if (status) {
            conditions.push(eq(order.status, status));
          }

          if (isVendor && session.vendorId) {
            const vendorOrderItems = await tx
              .select({ orderId: orderItem.orderId })
              .from(orderItem)
              .where(eq(orderItem.vendorId, session.vendorId))
              .execute();

            const vendorOrderIds = vendorOrderItems.map((item) => item.orderId);
            if (vendorOrderIds.length === 0) {
              return [];
            }

            conditions.push(inArray(order.id, vendorOrderIds));
          }

          if (!isAdmin && !isVendor) {
            const userResult = await tx
              .select({ id: user.id })
              .from(user)
              .where(eq(user.email, session.email))
              .execute();

            if (userResult.length === 0 || !userResult[0]?.id) {
              return [];
            }

            conditions.push(eq(order.userId, userResult[0].id));
          }

          const orders = await tx
            .select({
              id: order.id,
              customerName: order.customerName,
              customerEmail: order.customerEmail,
              customerPhone: order.customerPhone,
              shippingAddress: order.shippingAddress,
              shippingCity: order.shippingCity,
              shippingState: order.shippingState,
              shippingPostalCode: order.shippingPostalCode,
              shippingCountry: order.shippingCountry,
              subtotal: order.subtotal,
              shipping: order.shipping,
              tax: order.tax,
              discount: order.discount,
              promoCodeId: order.promoCodeId,
              total: order.total,
              status: order.status,
              notes: order.notes,
              createdAt: order.createdAt,
              updatedAt: order.updatedAt,
            })
            .from(order)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(desc(order.createdAt))
            .limit(limit)
            .offset(offset)
            .execute();

          const ordersWithItems = await Promise.all(
            orders.map(async (orderData) => {
              const items = await tx
                .select({
                  id: orderItem.id,
                  productId: orderItem.productId,
                  vendorId: orderItem.vendorId,
                  quantity: orderItem.quantity,
                  price: orderItem.price,
                  discountPrice: orderItem.discountPrice,
                  name: orderItem.name,
                })
                .from(orderItem)
                .where(
                  isVendor && session.vendorId
                    ? and(
                        eq(orderItem.orderId, orderData.id),
                        eq(orderItem.vendorId, session.vendorId)
                      )
                    : eq(orderItem.orderId, orderData.id)
                )
                .execute();

              const vendorIds = Array.from(
                new Set(items.map((item) => item.vendorId))
              ).filter(Boolean);

              const vendors =
                vendorIds.length > 0
                  ? await tx
                      .select({ id: vendor.id, name: vendor.name })
                      .from(vendor)
                      .where(inArray(vendor.id, vendorIds))
                      .execute()
                  : [];

              const itemsWithVendor = items.map((item) => ({
                ...item,
                vendorName:
                  vendors.find((v) => v.id === item.vendorId)?.name ||
                  "Unknown Vendor",
              }));

              return {
                ...orderData,
                items: itemsWithVendor,
              };
            })
          );

          return ordersWithItems;
        });
      })
    );
  });
