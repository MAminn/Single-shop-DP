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
import axios from "axios";

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

// Function to send order data to Fincart
interface FincartOrderData {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingCountry: string;
  shippingPostalCode: string;
  subtotal: string | number;
  shipping: string | number;
  tax: string | number;
  total: string | number;
  items: Array<{
    name?: string;
    quantity: number;
    price: string | number;
  }>;
}

interface FincartResponse {
  success: boolean;
  data?: Record<string, unknown>;
  error?: unknown;
}

const sendOrderToFincart = async (
  orderData: FincartOrderData
): Promise<FincartResponse> => {
  try {
    const FINCART_API_URL = process.env.FINCART_API_URL;
    const FINCART_API_KEY = process.env.FINCART_API_KEY;

    console.log(
      `Sending order to Fincart at: ${FINCART_API_URL}/merchant/app/s2s`
    );

    if (!FINCART_API_KEY) {
      console.error("FINCART_API_KEY is not set in the environment variables");
      return { success: false, error: "API Key not configured" };
    }

    // Construct the API URL for creating orders
    const fincartOrdersEndpoint = `${FINCART_API_URL}/merchant/app/s2s`;

    // Format the data according to Fincart's API requirements
    const payload = {
      city: orderData.shippingCity,
      zone: `${orderData.shippingState} - ${orderData.shippingCity}`,
      customer_name: orderData.customerName,
      customer_address: orderData.shippingAddress,
      customer_phone: orderData.customerPhone,
      customer_email: orderData.customerEmail,
      items: orderData.items.map((item) => ({
        name: item.name || "Product",
        quantity: item.quantity,
        price: Number.parseFloat(item.price.toString()),
      })),
      reference_id: orderData.id,
      payment_method: "cod",
      shipping_amount: Number.parseFloat(orderData.shipping.toString()),
      total: Number.parseFloat(orderData.total.toString()),
      webhook_url: `${process.env.PUBLIC_ORIGIN}/api/webhooks/fincart`,
    };

    console.log(
      "Payload being sent to Fincart:",
      JSON.stringify(payload, null, 2)
    );

    // Send the data to Fincart
    const response = await axios.post(fincartOrdersEndpoint, payload, {
      headers: {
        Authorization: FINCART_API_KEY,
        "Content-Type": "application/json",
      },
      // Set a timeout to prevent long-running requests
      timeout: 10000,
    });

    // Check if the response is HTML (which would indicate we're hitting a website not an API)
    const contentType =
      response?.headers && "content-type" in response.headers
        ? response.headers["content-type"]
        : null;
    if (
      contentType &&
      typeof contentType === "string" &&
      contentType.includes("text/html")
    ) {
      console.error(
        "Received HTML response from Fincart API. This indicates the URL is incorrect and points to a webpage, not an API endpoint."
      );
      return {
        success: false,
        error: "Received HTML instead of JSON. API URL is likely incorrect.",
      };
    }

    console.log("Order sent to Fincart successfully:", response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Failed to send order to Fincart:", error);

    // Provide more detailed error information
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status;
      const responseData = error.response?.data;
      const errorMessage = error.message;

      console.error(`Fincart API error (${statusCode}): ${errorMessage}`);
      if (responseData) {
        console.error("Response data:", responseData);
      }

      return {
        success: false,
        error: {
          statusCode,
          message: errorMessage,
          data: responseData,
        },
      };
    }

    return { success: false, error };
  }
};

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

    // Send emails, but don't let failures block the order creation
    try {
      yield* $(
        emailService.sendEmail(
          input.customerEmail,
          "Lebsy Order Confirmation",
          emailTemplate
        )
      );
    } catch (error) {
      console.error(
        `Failed to send confirmation email to customer ${input.customerEmail}:`,
        error
      );
      // Continue with order creation even if email fails
    }

    // Send admin notifications
    for (const admin of admins) {
      try {
        yield* $(
          emailService.sendEmail(
            admin.email,
            "New Order Received",
            emailTemplate
          )
        );
      } catch (error) {
        console.error(
          `Failed to send notification email to admin ${admin.email}:`,
          error
        );
        // Continue with order creation even if email fails
      }
    }

    // Send vendor notifications
    for (const vendor of vendors) {
      try {
        yield* $(
          emailService.sendEmail(
            vendor.email,
            "New Order Received",
            emailTemplate
          )
        );
      } catch (error) {
        console.error(
          `Failed to send notification email to vendor ${vendor.email}:`,
          error
        );
        // Continue with order creation even if email fails
      }
    }

    // Send order to Fincart
    try {
      // Use Effect to handle the async operation correctly
      yield* $(Effect.promise(() => sendOrderToFincart(result))).pipe(
        Effect.tap((fincartResult) => {
          if (!fincartResult.success) {
            console.error(
              "Failed to send order to Fincart:",
              fincartResult.error
            );
          }
        }),
        Effect.catchAll((error) => {
          console.error("Exception when sending order to Fincart:", error);
          return Effect.succeed(undefined);
        })
      );
    } catch (error) {
      console.error("Exception when sending order to Fincart:", error);
    }

    return result;
  });
