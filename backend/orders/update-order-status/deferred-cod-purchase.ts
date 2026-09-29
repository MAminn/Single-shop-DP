import { v7 } from "uuid";
import { orderItem } from "#root/shared/database/drizzle/schema";
import type { DatabaseClient } from "#root/shared/database/drizzle/db";
import { eq } from "drizzle-orm";
import { TrackingEventName, type TrackingEvent } from "#root/shared/types/pixel-tracking";
import { STORE_CURRENCY } from "#root/shared/config/branding";
import { toAbsoluteUrl } from "#root/shared/config/site-url";
import { processTrackingBeacon } from "#root/backend/pixel-tracking/delivery-pipeline";
import { hashIp, type ServerContext } from "#root/server/routes/track";

/**
 * Relay a Purchase event to the ad platforms for a COD order, but only once
 * it has left "pending" — i.e. a human has actually looked at it and chosen
 * to fulfill it, rather than cancel it as spam/fraud. COD checkout never
 * fires the client-side pixel (see pages/order-confirmation/+Page.tsx), so
 * this is the *only* Purchase signal these orders ever produce. This event
 * fires from an admin action, not a live page load, so IP/UA/fbp/fbc are
 * pulled from what was captured on the real checkout request (order.checkout*
 * columns, set in create-order/service.ts) rather than fabricated here.
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
    checkoutFbp: string | null;
    checkoutFbc: string | null;
    checkoutIp: string | null;
    checkoutUserAgent: string | null;
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

  // No live request here — this fires from an admin action, not a page
  // load — so IP/UA/fbp/fbc come from what checkout captured at order-creation
  // time. Server adapters already skip fields that are empty/falsy, so this
  // still degrades gracefully to whatever identifiers we do have if checkout
  // didn't capture them (e.g. orders placed before this column existed).
  const ip = order.checkoutIp ?? "";
  const serverContext: ServerContext = {
    ip,
    ipHash: ip ? hashIp(ip) : "",
    userAgent: order.checkoutUserAgent ?? "",
    fbp: order.checkoutFbp ?? undefined,
    fbc: order.checkoutFbc ?? undefined,
  };

  await processTrackingBeacon([event], serverContext, db);
}
