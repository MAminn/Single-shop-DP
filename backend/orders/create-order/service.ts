import { query } from "#root/shared/database/drizzle/db";
import {
  order,
  orderItem,
  product,
  user,
  vendor,
  type orderStatus,
  promoCode,
} from "#root/shared/database/drizzle/schema";
import { and, eq, inArray } from "drizzle-orm";
import { Effect } from "effect";
import { z } from "zod";
import type { ClientSession } from "#root/backend/auth/shared/entities";
import { ServerError } from "#root/shared/error/server";
import { EmailService, renderEmailTemplate } from "#root/shared/email/service";
import { NewOrderEmailTemplate } from "./email-template";
import axios from "axios";
import { validatePromoCode } from "#root/backend/promo-codes/validate-promo-code/validate-promo-code";

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
  shippingState: z.string().optional().nullable(),
  shippingPostalCode: z.string().optional().nullable(),
  shippingCountry: z.string().optional().nullable(),
  items: z.array(OrderItemSchema).min(1),
  notes: z.string().optional(),
  promoCodeId: z.string().uuid().optional(),
});

// Manually define the insert type matching the schema's nullability
type OrderInsertData = {
  userId: string | null;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string | null;
  shippingPostalCode: string | null;
  shippingCountry: string | null;
  subtotal: string;
  shipping: string;
  tax: string;
  total: string;
  status: (typeof orderStatus.enumValues)[number]; // Use enum values type
  notes: string | null;
  promoCodeId: string | null;
  discount: string | null;
  fincartStatus: string | null;
  fincartSubStatus: string | null;
  fincartTrackingNumber: string | null;
  fincartRejectionReason: string | null;
  fincartSupportNote: string | null;
  fincartReturnTrackingNumber: string | null;
  fincartStatusUpdatedDate: Date | null; // Use Date | null for timestamp
  fincartWebhookData: Record<string, unknown> | null; // More specific type for jsonb
  // createdAt is handled by DB default
  updatedAt: Date | null; // Use Date | null for timestamp
};

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
  notes: string | null | undefined;
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
    const FINCART_MERCHANT_LOCATION = process.env.FINCART_MERCHANT_LOCATION;
    const FINCART_PICKUP_ID = process.env.FINCART_PICKUP_ID;

    console.log(
      `Sending order to Fincart at: ${FINCART_API_URL}/merchant/app/s2s`
    );
    console.log(`Using merchant location ID: "${FINCART_MERCHANT_LOCATION}"`);
    console.log(`Using pickup ID: "${FINCART_PICKUP_ID}"`);

    if (!FINCART_API_KEY) {
      console.error("FINCART_API_KEY is not set in the environment variables");
      return { success: false, error: "API Key not configured" };
    }

    if (!FINCART_MERCHANT_LOCATION) {
      console.warn("FINCART_MERCHANT_LOCATION is not set, using default value");
    }

    // Construct the API URL for creating orders
    const fincartOrdersEndpoint = `${FINCART_API_URL}/merchant/app/s2s`;

    // Format the data according to Fincart's API requirements
    const payload = {
      merchant_location:
        FINCART_MERCHANT_LOCATION || "67115a8c16713e3eaec19384", // Use merchant_location field name
      _id: FINCART_MERCHANT_LOCATION || "67115a8c16713e3eaec19384",
      city: orderData.shippingCity,
      location: FINCART_MERCHANT_LOCATION || "67115a8c16713e3eaec19384",
      zone: `${orderData.shippingState} - ${orderData.shippingCity}`,
      customer_name: orderData.customerName,
      customer_address: orderData.shippingAddress,
      customer_phone: orderData.customerPhone,
      customer_email: orderData.customerEmail,
      customer_backup_phone: orderData.customerPhone,
      customer_landmark: `Near ${orderData.shippingCity} Center`,
      ref_id: orderData.id.substring(0, 24), // Limit length to match their format
      pickup_id: FINCART_PICKUP_ID || "67115a8c16713e3eaec19384",
      id_default: true,
      desc: `Order #${orderData.id.substring(0, 8)} from ${orderData.customerName}`,
      no_items: orderData.items.reduce(
        (total, item) => total + item.quantity,
        0
      ),
      weight: orderData.items.length > 0 ? orderData.items.length * 0.5 : 1,
      note:
        orderData.notes ||
        `Order for ${orderData.customerName} in ${orderData.shippingCity}`,
      open_shipment_allowed: false,
      cod: Number.parseFloat(orderData.total.toString()),
      country: "EG",
      merchant_id: FINCART_MERCHANT_LOCATION || "67115a8c16713e3eaec19384", // Add merchant_id field
      coordinates: "30.049683060160454, 31.333328930893973",
      merchant_address: "43 Al Gahez, St, Nasr City, Cairo Governorate 4441452",
      items: orderData.items.map((item) => ({
        name: item.name || "Product",
        quantity: item.quantity,
        price: Number.parseFloat(item.price.toString()),
      })),
    };

    // For debugging, log the exact payload that will be sent
    console.log(
      "Payload being sent to Fincart:",
      JSON.stringify(payload, null, 2)
    );

    // Send the data to Fincart
    const response = await axios.post(fincartOrdersEndpoint, payload, {
      headers: {
        Authorization: FINCART_API_KEY, // Use the API key directly without any formatting
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

    // Log the full response for debugging
    console.log("Full Fincart API response:", {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
    });

    // Check if the response indicates success
    if (response.data && response.data.status === "success") {
      console.log("Order sent to Fincart successfully:", response.data);
      return { success: true, data: response.data };
    }

    console.error("Fincart API returned an error:", response.data);
    return {
      success: false,
      error: response.data?.msg || "Unknown error from Fincart API",
    };
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
              discountPrice: product.discountPrice,
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

            // Use discount price if available
            const priceToUse = productData.discountPrice
              ? Number.parseFloat(productData.discountPrice.toString())
              : Number.parseFloat(productData.price.toString());

            return acc + priceToUse * item.quantity;
          }, 0);

          const shipping = 5;
          const taxRate = 0.05;

          // Check if a promo code is applied
          let discount = 0;
          let promoCodeData = null;

          if (input.promoCodeId) {
            // Get the promo code first to get its code
            promoCodeData = await tx
              .select()
              .from(promoCode)
              .where(eq(promoCode.id, input.promoCodeId))
              .then((res) => res[0]);

            if (promoCodeData) {
              // Convert cart items to the format expected by validatePromoCode
              const cartItems = input.items
                .map((item) => {
                  const productData = products.find(
                    (p) => p.id === item.productId
                  );
                  if (!productData) return null;
                  return {
                    id: item.productId,
                    quantity: item.quantity,
                    price: Number.parseFloat(productData.price.toString()),
                  };
                })
                .filter(
                  (
                    item
                  ): item is { id: string; quantity: number; price: number } =>
                    item !== null
                );

              try {
                // Validate the promo code synchronously from the database directly
                // Instead of trying to use Effect.runPromise inside a transaction
                if (
                  // Current date is between start and end dates (or they're null)
                  (!promoCodeData.startDate ||
                    promoCodeData.startDate <= new Date()) &&
                  (!promoCodeData.endDate ||
                    promoCodeData.endDate >= new Date()) &&
                  // Code is active
                  (promoCodeData.status === "active" ||
                    promoCodeData.status === "scheduled") &&
                  // Usage limits are not exceeded
                  (promoCodeData.usageLimit === null ||
                    promoCodeData.usedCount < promoCodeData.usageLimit) &&
                  // Minimum purchase amount is met
                  (promoCodeData.minPurchaseAmount === null ||
                    Number(promoCodeData.minPurchaseAmount) <= subtotal)
                ) {
                  // Calculate discount based on validated promo code
                  if (promoCodeData.discountType === "percentage") {
                    discount =
                      subtotal * (Number(promoCodeData.discountValue) / 100);
                  } else if (promoCodeData.discountType === "fixed_amount") {
                    discount = Number(promoCodeData.discountValue);
                    // Make sure discount doesn't exceed subtotal
                    if (discount > subtotal) {
                      discount = subtotal;
                    }
                  }

                  // Increment used count for the promo code
                  await tx
                    .update(promoCode)
                    .set({
                      usedCount: promoCodeData.usedCount + 1,
                      // If this was the last use, set status to exhausted
                      status:
                        promoCodeData.usageLimit !== null &&
                        promoCodeData.usedCount + 1 >= promoCodeData.usageLimit
                          ? "exhausted"
                          : promoCodeData.status,
                    })
                    .where(eq(promoCode.id, promoCodeData.id));
                } else {
                  throw new ServerError({
                    tag: "PromoCodeValidationFailed",
                    statusCode: 400,
                    clientMessage:
                      "This promo code is not valid or has expired",
                  });
                }
              } catch (error) {
                console.error("Promo code validation failed:", error);
                throw new ServerError({
                  tag: "PromoCodeValidationFailed",
                  statusCode: 400,
                  clientMessage:
                    error instanceof ServerError
                      ? error.clientMessage
                      : "Invalid promo code",
                });
              }
            }
          }

          const discountedSubtotal = subtotal - discount;
          const tax = discountedSubtotal * taxRate;
          // Ensure shipping is included in the total
          const total = discountedSubtotal + shipping + tax;

          // Only include fields directly provided or calculated
          const insertData = {
            userId: userId,
            customerName: input.customerName,
            customerEmail: input.customerEmail,
            customerPhone: input.customerPhone,
            shippingAddress: input.shippingAddress,
            shippingCity: input.shippingCity,
            shippingState: input.shippingState,
            shippingPostalCode: input.shippingPostalCode,
            shippingCountry: input.shippingCountry,
            subtotal: subtotal.toString(),
            discount: discount > 0 ? discount.toString() : null,
            promoCodeId: input.promoCodeId || null,
            shipping: shipping.toString(),
            tax: tax.toString(),
            total: total.toString(),
            notes: input.notes,
          };

          const definedInsertData = Object.fromEntries(
            Object.entries(insertData).filter(([_, v]) => v !== undefined)
          );

          const newOrdersInsert = await tx
            .insert(order)
            // @ts-ignore - Drizzle's insert type inference seems incorrect for nullable fields here
            .values(definedInsertData)
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
                  discountPrice: productData.discountPrice?.toString() || null,
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
            discountPrice: i.discountPrice
              ? Number.parseFloat(i.discountPrice)
              : undefined,
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
