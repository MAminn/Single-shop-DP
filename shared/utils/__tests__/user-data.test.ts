import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  normalizePhone,
  normalizeUserData,
  splitFullName,
} from "#root/shared/utils/user-data";
import { buildUserData } from "#root/backend/pixel-tracking/server-adapters/meta-capi-adapter";
import type { EnrichedTrackingEvent } from "#root/backend/pixel-tracking/event-logger";

const sha = (v: string) => createHash("sha256").update(v).digest("hex");

describe("user-data normalization", () => {
  it("normalizes Egyptian phone numbers to E.164 digits", () => {
    expect(normalizePhone("010 1234 5678")).toBe("201012345678");
    expect(normalizePhone("+20 101 234 5678")).toBe("201012345678");
    expect(normalizePhone("123")).toBeUndefined();
  });

  it("normalizes and drops invalid fields", () => {
    expect(
      normalizeUserData({
        email: "  Foo@Bar.COM ",
        city: "Nasr City",
        country: "Egypt",
        zip: "11 511",
        phone: "nope",
      }),
    ).toEqual({
      email: "foo@bar.com",
      city: "nasrcity",
      country: "eg",
      zip: "11511",
    });
  });

  it("splits full names", () => {
    expect(splitFullName("Ahmed Mohamed Ali")).toEqual({
      firstName: "Ahmed",
      lastName: "Mohamed Ali",
    });
  });
});

describe("Meta CAPI user_data", () => {
  const base = {
    eventId: "e1",
    eventName: "page_viewed",
    timestamp: 1_700_000_000_000,
    pageUrl: "https://shop.test/?fbclid=abc123",
    sessionId: "s1",
    serverContext: { ip: "1.1.1.1", ipHash: "h", userAgent: "UA" },
  } as EnrichedTrackingEvent;

  it("hashes customer fields and derives fbc from fbclid", () => {
    const ud = buildUserData({
      ...base,
      userData: {
        email: "A@b.com",
        phone: "01012345678",
        firstName: "Ahmed",
        externalId: "visitor-1",
      },
    });
    expect(ud.em).toEqual([sha("a@b.com")]);
    expect(ud.ph).toEqual([sha("201012345678")]);
    expect(ud.fn).toEqual([sha("ahmed")]);
    expect(ud.external_id).toEqual([sha("visitor-1")]);
    expect(ud.fbc).toBe("fb.1.1700000000000.abc123");
  });

  it("omits customer fields when unknown", () => {
    const ud = buildUserData(base);
    expect(ud.em).toBeUndefined();
    expect(ud.client_ip_address).toBe("1.1.1.1");
  });
});
