import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { isOrderRateLimited, ORDER_RATE_LIMIT_MAX } from "../rate-limit";

describe("isOrderRateLimited", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests under the limit", () => {
    const ip = "1.1.1.1";
    for (let i = 0; i < ORDER_RATE_LIMIT_MAX; i++) {
      expect(isOrderRateLimited(ip)).toBe(false);
    }
  });

  it("blocks once the limit is exceeded within the window", () => {
    const ip = "2.2.2.2";
    for (let i = 0; i < ORDER_RATE_LIMIT_MAX; i++) {
      isOrderRateLimited(ip);
    }
    expect(isOrderRateLimited(ip)).toBe(true);
  });

  it("resets after the window elapses", () => {
    const ip = "3.3.3.3";
    for (let i = 0; i < ORDER_RATE_LIMIT_MAX; i++) {
      isOrderRateLimited(ip);
    }
    expect(isOrderRateLimited(ip)).toBe(true);

    vi.advanceTimersByTime(10 * 60_000 + 1);
    expect(isOrderRateLimited(ip)).toBe(false);
  });

  it("tracks each IP independently", () => {
    const a = "4.4.4.4";
    const b = "5.5.5.5";
    for (let i = 0; i < ORDER_RATE_LIMIT_MAX; i++) {
      isOrderRateLimited(a);
    }
    expect(isOrderRateLimited(a)).toBe(true);
    expect(isOrderRateLimited(b)).toBe(false);
  });

  it("never blocks when no IP is available", () => {
    for (let i = 0; i < ORDER_RATE_LIMIT_MAX + 5; i++) {
      expect(isOrderRateLimited(undefined)).toBe(false);
    }
  });
});
