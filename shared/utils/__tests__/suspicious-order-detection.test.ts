import { describe, it, expect } from "vitest";
import {
  detectSuspiciousSignals,
  isOrderSuspicious,
} from "../suspicious-order-detection";

function order(overrides: Partial<{
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}>) {
  return {
    customerName: "John Smith",
    customerEmail: "john.smith@gmail.com",
    customerPhone: "01012345678",
    ...overrides,
  };
}

describe("detectSuspiciousSignals / isOrderSuspicious", () => {
  it("flags the motivating real-world case (jumbled name + jumbled email)", () => {
    const reasons = detectSuspiciousSignals(
      order({
        customerName: "hidoashiodahisnod",
        customerEmail: "ashdjiasjiodAI@email.com",
      }),
    );
    expect(reasons.length).toBeGreaterThanOrEqual(2);
    expect(isOrderSuspicious(reasons)).toBe(true);
  });

  it("does not flag a normal English name + matching email", () => {
    const reasons = detectSuspiciousSignals(order({}));
    expect(isOrderSuspicious(reasons)).toBe(false);
  });

  it("does not flag a normal Arabic name + unrelated webmail alias", () => {
    // Real customer, common pattern: Arabic name, generic/webmail-style email
    // that has nothing to do with the name. Must not be flagged just for that.
    const reasons = detectSuspiciousSignals(
      order({
        customerName: "أحمد محمد علي",
        customerEmail: "shopper2024@gmail.com",
      }),
    );
    expect(isOrderSuspicious(reasons)).toBe(false);
  });

  it("does not flag a genuine short single-word name alone", () => {
    const reasons = detectSuspiciousSignals(
      order({ customerName: "Cher", customerEmail: "cher.fan@gmail.com" }),
    );
    expect(isOrderSuspicious(reasons)).toBe(false);
  });

  it("flags an obvious keyboard-mash email even with a normal name", () => {
    const reasons = detectSuspiciousSignals(
      order({ customerEmail: "asdfghjkl@email.com", customerName: "aaaaaa" }),
    );
    expect(reasons.length).toBeGreaterThanOrEqual(2);
    expect(isOrderSuspicious(reasons)).toBe(true);
  });

  it("does not flag a long compound Arabic-transliterated single name alone", () => {
    // A real (if unusual) single-word compound name should not, by itself,
    // reach the 2-signal threshold via the length escalation + mash check.
    const reasons = detectSuspiciousSignals(
      order({ customerName: "Abdelrahman", customerEmail: "abdo@gmail.com" }),
    );
    expect(isOrderSuspicious(reasons)).toBe(false);
  });
});
