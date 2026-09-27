/**
 * Customer identity ("user data") helpers for ad-platform matching.
 *
 * Pure functions, safe on both client and server. Normalization follows Meta's
 * Customer Information Parameters spec (lowercase, trimmed, phone in E.164
 * digits, etc.) — hashing is done separately, server-side only.
 */

export interface TrackingUserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  zip?: string;
  /** ISO-3166 alpha-2, lowercase (e.g. "eg") */
  country?: string;
  /** Stable first-party visitor/customer ID */
  externalId?: string;
}

/** Store is Egypt-based: numbers like 01012345678 → 201012345678. */
const DEFAULT_COUNTRY_CALLING_CODE = "20";
const DEFAULT_COUNTRY = "eg";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const COUNTRY_NAME_TO_ISO: Record<string, string> = {
  egypt: "eg",
  "united arab emirates": "ae",
  uae: "ae",
  "saudi arabia": "sa",
  ksa: "sa",
  kuwait: "kw",
  qatar: "qa",
  bahrain: "bh",
  oman: "om",
  jordan: "jo",
  "united states": "us",
  usa: "us",
  "united kingdom": "gb",
  uk: "gb",
};

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeEmail(value: unknown): string | undefined {
  const v = clean(value).toLowerCase();
  return EMAIL_RE.test(v) ? v : undefined;
}

export function normalizePhone(value: unknown): string | undefined {
  let digits = clean(value).replace(/\D/g, "");
  if (!digits) return undefined;
  if (digits.startsWith("00")) digits = digits.slice(2);
  else if (digits.startsWith("0")) {
    digits = DEFAULT_COUNTRY_CALLING_CODE + digits.slice(1);
  }
  return digits.length >= 8 && digits.length <= 15 ? digits : undefined;
}

export function normalizeName(value: unknown): string | undefined {
  const v = clean(value)
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
  return v || undefined;
}

/** City / state: lowercase letters only, no spaces or punctuation. */
export function normalizePlace(value: unknown): string | undefined {
  const v = clean(value)
    .toLowerCase()
    .replace(/[^\p{L}\p{M}]/gu, "");
  return v || undefined;
}

export function normalizeZip(value: unknown): string | undefined {
  const v = clean(value).toLowerCase().replace(/[\s-]/g, "");
  return v || undefined;
}

export function normalizeCountry(value: unknown): string | undefined {
  const v = clean(value).toLowerCase();
  if (!v) return undefined;
  if (v.length === 2) return v;
  return COUNTRY_NAME_TO_ISO[v];
}

/** Split "Ahmed Mohamed Ali" → first "ahmed", last "mohamed ali". */
export function splitFullName(fullName: unknown): {
  firstName?: string;
  lastName?: string;
} {
  const parts = clean(fullName).split(/\s+/).filter(Boolean);
  if (parts.length === 0) return {};
  return {
    firstName: parts[0],
    lastName: parts.length > 1 ? parts.slice(1).join(" ") : undefined,
  };
}

/** Normalize every field; drops anything invalid/empty. Idempotent. */
export function normalizeUserData(raw: TrackingUserData): TrackingUserData {
  const out: TrackingUserData = {
    email: normalizeEmail(raw.email),
    phone: normalizePhone(raw.phone),
    firstName: normalizeName(raw.firstName),
    lastName: normalizeName(raw.lastName),
    city: normalizePlace(raw.city),
    state: normalizePlace(raw.state),
    zip: normalizeZip(raw.zip),
    country: normalizeCountry(raw.country),
    externalId: clean(raw.externalId) || undefined,
  };
  for (const key of Object.keys(out) as (keyof TrackingUserData)[]) {
    if (!out[key]) delete out[key];
  }
  return out;
}

export { DEFAULT_COUNTRY };
