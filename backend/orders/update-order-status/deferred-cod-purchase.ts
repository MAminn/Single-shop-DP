import { v7 } from "uuid";
import { orderItem } from "#root/shared/database/drizzle/schema";
import type { DatabaseClient } from "#root/shared/database/drizzle/db";
import { eq } from "drizzle-orm";
import { TrackingEventName, type TrackingEvent } from "#root/shared/types/pixel-tracking";
import { STORE_CURRENCY } from "#root/shared/config/branding";
import { toAbsoluteUrl } from "#root/shared/config/site-url";
import { processTrackingBeacon } from "#root/backend/pixel-tracking/delivery-pipeline";
import type { ServerContext } from "#root/server/routes/track";

/**
 * Relay a Purchase event to the ad platforms for a COD order, but only once
 * it has left "pending" — i.e. a human has actually looked at it and chosen
 * to fulfill it, rather than cancel it as spam/fraud. COD checkout never
 * fires the client-side pixel (see pages/order-confirmation/+Page.tsx), so
 * this is the *only* Purchase signal these orders ever produce. Nothing here
 * fabricates data: fields not truly known at this point (client IP, browser
 * user agent, fbp/fbc) are simply omitted rather than guessed.
 *
 * Never throws — best-effort, logged by the caller.
 */
export async function sendDeferredCodPurchaseEvent(
  db: DatabaseClient,
  order: {
    id: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingCountry: string;
    total: string;
  },
): Promise<void> {
  const items = await db
    .select({
      productId: orderItem.productId,
      name: orderItem.name,
      price: orderItem.price,
      quantity: orderItem.quantity,
    })
    .from(orderItem)
    .where(eq(orderItem.orderId, order.id))
    .execute();

  const [firstName, ...rest] = order.customerName.trim().split(/\s+/);
  const lastName = rest.length > 0 ? rest.join(" ") : undefined;

  const event: TrackingEvent = {
    eventId: v7(),
    eventName: TrackingEventName.CHECKOUT_COMPLETED,
    timestamp: Date.now(),
    pageUrl: toAbsoluteUrl(`/order-confirmation?id=${order.id}`),
    sessionId: order.id,
    userData: {
      email: order.customerEmail,
      phone: order.customerPhone,
      firstName,
      lastName,
      country: order.shippingCountry,
      externalId: order.id,
    },
    ecommerce: {
      currency: STORE_CURRENCY,
      value: Number(order.total),
      transactionId: order.id,
      items: items.map((item) => ({
        itemId: item.productId,
        itemName: item.name,
        price: Number(item.price),
        quantity: item.quantity,
      })),
    },
  };

  // No live request to extract IP/UA/cookies from — this fires from an admin
  // action, not a page load. Server adapters already skip fields that are
  // empty/falsy, so this degrades gracefully to whatever identifiers
  // (email/phone/external_id) we do have.
  const serverContext: ServerContext = { ip: "", ipHash: "", userAgent: "" };

  await processTrackingBeacon([event], serverContext, db);
}
