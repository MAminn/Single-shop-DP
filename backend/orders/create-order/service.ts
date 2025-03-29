import { query } from "#root/shared/database/drizzle/db";
import {
  order,
  orderItem,
  product,
  user,
  vendor,
} from "#root/shared/database/drizzle/schema";
import { and, eq, inArray } from "drizzle-orm";
import { Effect } from "effect";
import { z } from "zod";
import type { ClientSession } from "#root/backend/auth/shared/entities";
import { ServerError } from "#root/shared/error/server";
import { EmailService, renderEmailTemplate } from "#root/shared/email/service";
import { NewOrderEmailTemplate } from "./email-template";

const OrderItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().min(1),
});

export const createOrderSchema = z.object({
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(1),
  shippingAddress: z.string().min(1),
  shippingCity: z.string().min(1),
  shippingState: z.string().min(1),
  shippingPostalCode: z.string().min(1),
  shippingCountry: z.string().min(1),
  items: z.array(OrderItemSchema).min(1),
  notes: z.string().optional(),
});

export const createOrder = (
  input: z.infer<typeof createOrderSchema>,
  session?: ClientSession
) =>
  Effect.gen(function* ($) {
    // We no longer require a session for ordering
    const result = yield* $(
      query(async (db) => {
        return await db.transaction(async (tx) => {
          // Get user ID if the user is logged in, otherwise set to null
          let userId = null;
          if (session) {
            const userData = await tx
              .select({ id: user.id })
              .from(user)
              .where(eq(user.email, session.email))
              .execute();

            if (userData && userData.length > 0 && userData[0]?.id) {
              userId = userData[0].id;
            }
          }

          const productIds = input.items.map((item) => item.productId);

          const products = await tx
            .select({
              id: product.id,
              price: product.price,
              vendorId: product.vendorId,
              name: product.name,
              stock: product.stock,
              vendorName: vendor.name,
            })
            .from(product)
            .leftJoin(vendor, eq(product.vendorId, vendor.id))
            .where(inArray(product.id, productIds))
            .execute();

          if (!products || products.length === 0) {
            throw new ServerError({
              tag: "ProductNotFound",
              message: "No products found for this order",
              statusCode: 404,
              clientMessage: "Products not found",
            });
          }

          for (const item of input.items) {
            const productData = products.find((p) => p.id === item.productId);
            if (!productData) {
              throw new ServerError({
                tag: "ProductNotFound",
                message: `Product with ID ${item.productId} not found`,
                statusCode: 404,
                clientMessage: "Some products in your order could not be found",
              });
            }

            if (productData.stock < item.quantity) {
              throw new ServerError({
                tag: "InsufficientStock",
                message: `Insufficient stock for product ${productData.name}`,
                statusCode: 400,
                clientMessage: `Sorry, there's not enough stock available for ${productData.name}`,
              });
            }
          }

          const subtotal = input.items.reduce((acc, item) => {
            const productData = products.find((p) => p.id === item.productId);
            if (!productData) return acc;
            return (
              acc +
              Number.parseFloat(productData.price.toString()) * item.quantity
            );
          }, 0);

          const shipping = 10;
          const taxRate = 0.1;
          const tax = subtotal * taxRate;
          const total = subtotal + shipping + tax;

          const newOrdersInsert = await tx
            .insert(order)
            .values({
              userId, // Can be null for guest orders
              customerName: input.customerName,
              customerEmail: input.customerEmail,
              customerPhone: input.customerPhone,
              shippingAddress: input.shippingAddress,
              shippingCity: input.shippingCity,
              shippingState: input.shippingState,
              shippingPostalCode: input.shippingPostalCode,
              shippingCountry: input.shippingCountry,
              subtotal: subtotal.toString(),
              shipping: shipping.toString(),
              tax: tax.toString(),
              total: total.toString(),
              status: "pending",
              notes: input.notes || null,
            })
            .returning();

          if (!newOrdersInsert || newOrdersInsert.length === 0) {
            throw new ServerError({
              tag: "OrderCreationFailed",
              message: "Failed to create order",
              statusCode: 500,
              clientMessage: "Failed to create order. Please try again.",
            });
          }

          const newOrder = newOrdersInsert[0];
          if (!newOrder || !newOrder.id) {
            throw new ServerError({
              tag: "OrderCreationFailed",
              message: "Failed to create order - missing ID",
              statusCode: 500,
              clientMessage: "Failed to create order. Please try again.",
            });
          }

          const orderItems = await Promise.all(
            input.items.map(async (item) => {
              const productData = products.find((p) => p.id === item.productId);
              if (!productData) {
                throw new ServerError({
                  tag: "ProductNotFound",
                  message: `Product with ID ${item.productId} not found`,
                  statusCode: 404,
                  clientMessage:
                    "Some products in your order could not be found",
                });
              }

              await tx
                .update(product)
                .set({
                  stock: productData.stock - item.quantity,
                })
                .where(eq(product.id, item.productId));

              const orderItemInsert = await tx
                .insert(orderItem)
                .values({
                  orderId: newOrder.id,
                  productId: item.productId,
                  vendorId: productData.vendorId,
                  quantity: item.quantity,
                  price: productData.price.toString(),
                  name: productData.name,
                  vendorName: productData.vendorName,
                })
                .returning();

              if (!orderItemInsert[0]) {
                throw new ServerError({
                  tag: "OrderItemCreationFailed",
                  message: "Failed to create order item",
                  statusCode: 500,
                  clientMessage:
                    "Failed to create order item. Please try again.",
                });
              }

              return orderItemInsert[0];
            })
          );

          return {
            ...newOrder,
            items: orderItems,
          };
        });
      })
    );

    const emailService = yield* $(EmailService);

    const emailTemplate = yield* $(
      renderEmailTemplate(
        NewOrderEmailTemplate({
          items: result.items.map((i) => ({
            name: i.name ?? "-",
            quantity: i.quantity ?? 0,
            price: i.price ? Number.parseFloat(i.price) : 0,
            vendorName: i.vendorName ?? undefined,
          })),
          shippingFees: Number.parseFloat(result.shipping),
          subTotal: Number.parseFloat(result.subtotal),
          tax: Number.parseFloat(result.tax),
          total: Number.parseFloat(result.total),
          address: result.shippingAddress,
          city: result.shippingCity,
          state: result.shippingState,
          country: result.shippingCountry,
          postalCode: result.shippingPostalCode,
          customerName: result.customerName,
          customerEmail: result.customerEmail,
          customerPhone: result.customerPhone,
        })
      )
    );

    const admins = yield* $(
      query(
        async (db) => await db.select().from(user).where(eq(user.role, "admin"))
      )
    );

    const vendors = yield* $(
      query(
        async (db) =>
          await db
            .select()
            .from(user)
            .where(
              and(
                eq(user.role, "vendor"),
                inArray(
                  user.vendorId,
                  result.items.map((i) => i.vendorId)
                )
              )
            )
      )
    );

    yield* $(
      emailService.sendEmail(
        input.customerEmail,
        "Lebsy Order Confirmation",
        emailTemplate
      )
    );

    for (const admin of admins) {
      yield* $(
        emailService.sendEmail(admin.email, "New Order Received", emailTemplate)
      );
    }

    for (const vendor of vendors) {
      yield* $(
        emailService.sendEmail(
          vendor.email,
          "New Order Received",
          emailTemplate
        )
      );
    }

    return result;
  });
