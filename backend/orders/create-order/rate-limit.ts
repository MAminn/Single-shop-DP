/**
 * Per-IP order creation limiter.
 *
 * Real customers place at most a couple of orders per visit; there is no
 * legitimate reason for the same IP to create many orders in a short window.
 * Same in-memory sliding-window approach as server/routes/track.ts's beacon
 * limiter, just with limits sized for checkout instead of analytics beacons.
 */
const ORDER_RATE_LIMIT_MAX = 5;
const ORDER_RATE_LIMIT_WINDOW_MS = 10 * 60_000; // 10 minutes

const orderRateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function isOrderRateLimited(ip: string | undefined | null): boolean {
  if (!ip) return false;
  const now = Date.now();
  const entry = orderRateLimitMap.get(ip);

  if (!entry || now >= entry.resetAt) {
    orderRateLimitMap.set(ip, {
      count: 1,
      resetAt: now + ORDER_RATE_LIMIT_WINDOW_MS,
    });
    return false;
  }

  entry.count += 1;
  return entry.count > ORDER_RATE_LIMIT_MAX;
}

export { ORDER_RATE_LIMIT_MAX, ORDER_RATE_LIMIT_WINDOW_MS };
