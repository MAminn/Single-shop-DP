import { query } from "#root/shared/database/drizzle/db";
import {
  order,
  orderItem,
  product,
  trackingEvent,
  trackingEventDelivery,
  pixelConfig,
} from "#root/shared/database/drizzle/schema";
import {
  count,
  countDistinct,
  desc,
  eq,
  gte,
  sql,
  sum,
  and,
  max,
} from "drizzle-orm";
import { Effect } from "effect";

// ─── Overview metrics ───────────────────────────────────────────────────────

export const getOverviewMetrics = () =>
  Effect.gen(function* () {
    return yield* query(async (db) => {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Order count (all statuses, all-time)
      const [orderCount] = await db
        .select({ total: count() })
        .from(order)
        .execute();

      // Revenue from non-cancelled orders (all-time)
      const [revenueTotals] = await db
        .select({
          orderCount: count(),
          totalRevenue: sum(order.total),
        })
        .from(order)
        .where(sql`${order.status} != 'cancelled'`)
        .execute();

      // Order count (all statuses, last 7 days)
      const [orderCount7d] = await db
        .select({ total: count() })
        .from(order)
        .where(gte(order.createdAt, sevenDaysAgo))
        .execute();

      // Revenue from non-cancelled orders (last 7 days)
      const [revenueTotals7d] = await db
        .select({
          totalRevenue: sum(order.total),
        })
        .from(order)
        .where(
          and(
            sql`${order.status} != 'cancelled'`,
            gte(order.createdAt, sevenDaysAgo),
          ),
        )
        .execute();

      // Average order value = revenue / non-cancelled order count
      const nonCancelledCount = revenueTotals?.orderCount ?? 0;
      const totalRevenue = Number(revenueTotals?.totalRevenue ?? 0);
      const avgOrderValue =
        nonCancelledCount > 0 ? totalRevenue / nonCancelledCount : 0;

      // Total products (exclude soft-deleted)
      const [productCount] = await db
        .select({ total: count() })
        .from(product)
        .where(eq(product.deleted, false))
        .execute();

      return {
        totalOrders: orderCount?.total ?? 0,
        totalRevenue,
        avgOrderValue: Math.round(avgOrderValue * 100) / 100,
        totalOrders7d: orderCount7d?.total ?? 0,
        totalRevenue7d: Number(revenueTotals7d?.totalRevenue ?? 0),
        totalProducts: productCount?.total ?? 0,
      };
    });
  });

// ─── Conversion funnel from tracking events (last 30 days) ──────────────────

export const getConversionFunnel = () =>
  Effect.gen(function* () {
    return yield* query(async (db) => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const funnelEvents = [
        "page_viewed",
        "product_viewed",
        "product_added_to_cart",
        "checkout_started",
        "checkout_completed",
      ] as const;

      const counts = await db
        .select({
          eventName: trackingEvent.eventName,
          total: count(),
          uniqueSessions: countDistinct(trackingEvent.sessionId),
        })
        .from(trackingEvent)
        .where(
          and(
            gte(trackingEvent.createdAt, thirtyDaysAgo),
            sql`${trackingEvent.eventName} IN (${sql.join(
              funnelEvents.map((e) => sql`${e}`),
              sql`, `,
            )})`,
          ),
        )
        .groupBy(trackingEvent.eventName)
        .execute();

      // Map to ordered funnel stages
      const countMap = new Map(
        counts.map((c) => [
          c.eventName,
          { total: c.total, uniqueSessions: c.uniqueSessions },
        ]),
      );

      return funnelEvents.map((eventName) => ({
        eventName,
        total: countMap.get(eventName)?.total ?? 0,
        uniqueSessions: countMap.get(eventName)?.uniqueSessions ?? 0,
      }));
    });
  });

// ─── Event type breakdown (last 30 days) ────────────────────────────────────

export const getEventBreakdown = () =>
  Effect.gen(function* () {
    return yield* query(async (db) => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const rows = await db
        .select({
          eventName: trackingEvent.eventName,
          total: count(),
          uniqueSessions: countDistinct(trackingEvent.sessionId),
        })
        .from(trackingEvent)
        .where(gte(trackingEvent.createdAt, thirtyDaysAgo))
        .groupBy(trackingEvent.eventName)
        .orderBy(desc(count()))
        .execute();

      // Totals
      const [totals] = await db
        .select({
          totalEvents: count(),
          totalSessions: countDistinct(trackingEvent.sessionId),
        })
        .from(trackingEvent)
        .where(gte(trackingEvent.createdAt, thirtyDaysAgo))
        .execute();

      return {
        events: rows,
        totalEvents: totals?.totalEvents ?? 0,
        totalSessions: totals?.totalSessions ?? 0,
      };
    });
  });

// ─── Platform delivery health ───────────────────────────────────────────────

export const getPlatformHealth = () =>
  Effect.gen(function* () {
    return yield* query(async (db) => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      // Get configured pixel platforms
      const configs = await db
        .select({
          platform: pixelConfig.platform,
          enabled: pixelConfig.enabled,
        })
        .from(pixelConfig)
        .execute();

      // Delivery stats per platform (last 7 days)
      const deliveryStats = await db
        .select({
          platform: trackingEventDelivery.platform,
          sent: trackingEventDelivery.sent,
          total: count(),
        })
        .from(trackingEventDelivery)
        .where(gte(trackingEventDelivery.createdAt, sevenDaysAgo))
        .groupBy(trackingEventDelivery.platform, trackingEventDelivery.sent)
        .execute();

      // Last event per platform
      const lastEvents = await db
        .select({
          platform: trackingEventDelivery.platform,
          lastEvent: max(trackingEventDelivery.createdAt),
        })
        .from(trackingEventDelivery)
        .groupBy(trackingEventDelivery.platform)
        .execute();

      // Build platform health map
      const platformMap = new Map<
        string,
        { success: number; failed: number; lastEvent: Date | null }
      >();

      for (const row of deliveryStats) {
        if (!row.platform) continue;
        const existing = platformMap.get(row.platform) ?? {
          success: 0,
          failed: 0,
          lastEvent: null,
        };
        if (row.sent) {
          existing.success = row.total;
        } else {
          existing.failed = row.total;
        }
        platformMap.set(row.platform, existing);
      }

      for (const row of lastEvents) {
        if (!row.platform) continue;
        const existing = platformMap.get(row.platform) ?? {
          success: 0,
          failed: 0,
          lastEvent: null,
        };
        existing.lastEvent = row.lastEvent;
        platformMap.set(row.platform, existing);
      }

      // Include configured platforms even if they have no delivery data
      for (const cfg of configs) {
        if (!platformMap.has(cfg.platform)) {
          platformMap.set(cfg.platform, {
            success: 0,
            failed: 0,
            lastEvent: null,
          });
        }
      }

      return Array.from(platformMap.entries()).map(([platform, data]) => {
        const total = data.success + data.failed;
        const successRate = total > 0 ? (data.success / total) * 100 : 0;
        const status: "healthy" | "degraded" | "down" | "no_data" =
          total === 0
            ? "no_data"
            : successRate >= 99
              ? "healthy"
              : successRate >= 90
                ? "degraded"
                : "down";

        return {
          platform,
          enabled:
            configs.find((c) => c.platform === platform)?.enabled ?? false,
          successRate: Math.round(successRate * 10) / 10,
          successCount: data.success,
          failedCount: data.failed,
          lastEventAt: data.lastEvent?.toISOString() ?? null,
          status,
        };
      });
    });
  });

// ─── Top products by tracking events (most viewed / most carted) ────────────

export const getTopTrackedProducts = () =>
  Effect.gen(function* () {
    return yield* query(async (db) => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      // Most viewed products (from product_viewed events, reading productId from eventData)
      const mostViewed = await db
        .select({
          productId: sql<string>`${trackingEvent.eventData}->>'productId'`,
          productName: sql<string>`${trackingEvent.eventData}->>'productName'`,
          viewCount: count(),
        })
        .from(trackingEvent)
        .where(
          and(
            eq(trackingEvent.eventName, "product_viewed"),
            gte(trackingEvent.createdAt, thirtyDaysAgo),
            sql`${trackingEvent.eventData}->>'productId' IS NOT NULL`,
          ),
        )
        .groupBy(
          sql`${trackingEvent.eventData}->>'productId'`,
          sql`${trackingEvent.eventData}->>'productName'`,
        )
        .orderBy(desc(count()))
        .limit(5)
        .execute();

      // Most added to cart
      const mostCarted = await db
        .select({
          productId: sql<string>`${trackingEvent.eventData}->>'productId'`,
          productName: sql<string>`${trackingEvent.eventData}->>'productName'`,
          cartCount: count(),
        })
        .from(trackingEvent)
        .where(
          and(
            eq(trackingEvent.eventName, "product_added_to_cart"),
            gte(trackingEvent.createdAt, thirtyDaysAgo),
            sql`${trackingEvent.eventData}->>'productId' IS NOT NULL`,
          ),
        )
        .groupBy(
          sql`${trackingEvent.eventData}->>'productId'`,
          sql`${trackingEvent.eventData}->>'productName'`,
        )
        .orderBy(desc(count()))
        .limit(5)
        .execute();

      return { mostViewed, mostCarted };
    });
  });
