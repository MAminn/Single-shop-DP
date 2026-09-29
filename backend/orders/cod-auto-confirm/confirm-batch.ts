import { order, orderLog } from "#root/shared/database/drizzle/schema";
import type { DatabaseClient } from "#root/shared/database/drizzle/db";
import { and, eq, lt } from "drizzle-orm";
import { sendDeferredCodPurchaseEvent } from "#root/backend/orders/update-order-status/deferred-cod-purchase";

export interface ConfirmedCodOrder {
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
}

/**
 * Moves pending COD orders to "processing" and relays each one's deferred
 * Purchase event (see deferred-cod-purchase.ts — this is the only Purchase
 * signal a COD order ever produces). Shared by two callers that only differ
 * in the age cutoff and the log's attribution:
 *  - the admin "confirm all pending COD orders" bulk action (no cutoff)
 *  - the auto-confirm background worker (cutoff = the configured delay)
 */
export async function confirmPendingCodOrders(
  db: DatabaseClient,
  options: { olderThanMs?: number; actor: string },
): Promise<ConfirmedCodOrder[]> {
  const cutoff = options.olderThanMs
    ? new Date(Date.now() - options.olderThanMs)
    : undefined;

  const confirmed = await db.transaction(async (tx) => {
    const whereClause = cutoff
      ? and(
          eq(order.status, "pending"),
          eq(order.paymentMethod, "cod"),
          lt(order.createdAt, cutoff),
        )
      : and(eq(order.status, "pending"), eq(order.paymentMethod, "cod"));

    const pending = await tx
      .select({
        id: order.id,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        shippingCountry: order.shippingCountry,
        total: order.total,
        checkoutFbp: order.checkoutFbp,
        checkoutFbc: order.checkoutFbc,
        checkoutIp: order.checkoutIp,
        checkoutUserAgent: order.checkoutUserAgent,
      })
      .from(order)
      .where(whereClause)
      .execute();

    if (pending.length === 0) return [];

    await tx.update(order).set({ status: "processing" }).where(whereClause);

    await tx.insert(orderLog).values(
      pending.map((o) => ({
        orderId: o.id,
        userId: null,
        action: "status_changed" as const,
        oldStatus: "pending",
        newStatus: "processing",
        note: `Status changed from pending to processing by ${options.actor}`,
      })),
    );

    return pending;
  });

  // Fired after the transaction commits — these are real network calls to
  // ad platforms and must never hold a DB transaction open.
  for (const confirmedOrder of confirmed) {
    sendDeferredCodPurchaseEvent(db, confirmedOrder).catch((err) => {
      console.error(
        `[Order ${confirmedOrder.id}] Failed to relay deferred COD purchase event:`,
        err,
      );
    });
  }

  return confirmed;
}
