import { getSessionId } from "#root/shared/utils/session-id";
import {
  DEFAULT_COUNTRY,
  normalizeUserData,
  type TrackingUserData,
} from "#root/shared/utils/user-data";

const IDENTITY_KEY = "tracking_customer_identity";

type StoredIdentity = Omit<TrackingUserData, "externalId">;

function readStored(): StoredIdentity {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(IDENTITY_KEY);
    return raw ? (JSON.parse(raw) as StoredIdentity) : {};
  } catch {
    return {};
  }
}

/**
 * Merge new customer details into the persisted identity (localStorage), so
 * every later event — on any page, in any session — carries them. Existing
 * values are only overwritten by valid new ones.
 */
export function saveCustomerIdentity(partial: StoredIdentity): void {
  if (typeof window === "undefined") return;
  const incoming = normalizeUserData(partial);
  delete incoming.externalId;
  if (Object.keys(incoming).length === 0) return;
  try {
    const merged = { ...readStored(), ...incoming };
    window.localStorage.setItem(IDENTITY_KEY, JSON.stringify(merged));
  } catch {
    /* localStorage unavailable — best-effort */
  }
}

/**
 * Normalized user data for the current visitor: whatever we know about them
 * plus a stable external ID (the persistent visitor id) and a default country.
 */
export function getTrackingUserData(): TrackingUserData {
  const stored = readStored();
  return normalizeUserData({
    ...stored,
    country: stored.country ?? DEFAULT_COUNTRY,
    externalId: getSessionId(),
  });
}
