/**
 * Ensure Meta's first-party browser cookies (_fbp / _fbc) exist before any
 * tracking event fires.
 *
 * Meta's fbevents.js normally creates _fbp itself, but it loads async — events
 * fired at page load (scroll_depth, PageView, product impressions) reach our
 * server before the cookie exists and go to CAPI with no browser ID. Creating
 * the cookie up-front, in Meta's own format, fixes that; fbevents.js reuses an
 * existing _fbp instead of replacing it.
 */

const NINETY_DAYS_SECONDS = 60 * 60 * 24 * 90;

function readCookie(name: string): string | undefined {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1] ?? "") : undefined;
}

function writeCookie(name: string, value: string): void {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${NINETY_DAYS_SECONDS}; Path=/; SameSite=Lax${secure}`;
}

export function ensureMetaCookies(): void {
  if (typeof document === "undefined" || typeof window === "undefined") return;

  try {
    if (!readCookie("_fbp")) {
      const random = Math.floor(Math.random() * 1e10);
      writeCookie("_fbp", `fb.1.${Date.now()}.${random}`);
    }

    const fbclid = new URLSearchParams(window.location.search).get("fbclid");
    if (fbclid) {
      const existing = readCookie("_fbc");
      // Only (re)write when the click id is new — keep the original click time.
      if (!existing || !existing.endsWith(`.${fbclid}`)) {
        writeCookie("_fbc", `fb.1.${Date.now()}.${fbclid}`);
      }
    }
  } catch {
    /* cookies blocked — nothing to do */
  }
}
