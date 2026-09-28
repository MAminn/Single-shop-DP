import {
  PixelPlatform,
  TrackingEventName,
  PLATFORM_EVENT_MAP,
  type PixelConfig,
  type TrackingEvent,
  type TrackingProductItem,
} from "#root/shared/types/pixel-tracking";
import { getTrackingUserData } from "#root/shared/utils/customer-identity";
import type { TrackingUserData } from "#root/shared/utils/user-data";
import type { PixelAdapter } from "./types";

/** Map our normalized user data to fbq advanced-matching keys. */
function toAdvancedMatching(u: TrackingUserData): Record<string, string> {
  const map: Record<string, string | undefined> = {
    em: u.email,
    ph: u.phone,
    fn: u.firstName,
    ln: u.lastName,
    ct: u.city,
    st: u.state,
    zp: u.zip,
    country: u.country,
    external_id: u.externalId,
  };
  return Object.fromEntries(
    Object.entries(map).filter(([, v]) => !!v),
  ) as Record<string, string>;
}

// ─── Window augmentation for fbq ────────────────────────────────────────────

declare global {
  interface Window {
    fbq: FbqFunction & { callMethod?: (...args: unknown[]) => void; queue: unknown[] };
    _fbq: Window["fbq"];
  }
}

type FbqFunction = (
  command: string,
  eventNameOrPixelId: string,
  params?: Record<string, unknown>,
  options?: Record<string, unknown>,
) => void;

// ─── Meta-specific parameter builder ────────────────────────────────────────

function buildMetaParams(event: TrackingEvent): Record<string, unknown> {
  const params: Record<string, unknown> = {};
  const ecom = event.ecommerce;
  if (!ecom) return params;

  if (ecom.value !== undefined) params.value = ecom.value;
  if (ecom.currency) params.currency = ecom.currency;
  if (ecom.searchQuery) params.search_string = ecom.searchQuery;

  if (ecom.items && ecom.items.length > 0) {
    params.content_ids = ecom.items.map((i: TrackingProductItem) => i.itemId);
    params.contents = ecom.items.map((i: TrackingProductItem) => ({
      id: i.itemId,
      quantity: i.quantity ?? 1,
    }));
    params.content_type = "product";

    // Use the first item's category/name as top-level fields (Meta convention)
    const first = ecom.items[0];
    if (first?.category) params.content_category = first.category;
    if (first?.itemName) params.content_name = first.itemName;

    // num_items = sum of all item quantities (or count if no quantities)
    params.num_items = ecom.items.reduce(
      (sum: number, i: TrackingProductItem) => sum + (i.quantity ?? 1),
      0,
    );
  }

  return params;
}

// ─── Meta Pixel Adapter ─────────────────────────────────────────────────────

const META_EVENT_MAP = PLATFORM_EVENT_MAP[PixelPlatform.META];

export class MetaPixelAdapter implements PixelAdapter {
  readonly platform = PixelPlatform.META;

  private loaded = false;
  private enabled = false;
  private pixelId = "";
  private scriptElement: HTMLScriptElement | null = null;
  private lastMatchKey: string | null = null;
  private hasInitialized = false;

  initialize(config: PixelConfig): void {
    if (typeof window === "undefined") return;
    this.pixelId = config.pixelId;
    this.enabled = config.enabled;

    // Inject Meta's fbevents.js snippet
    this.injectSdk();

    // Init the pixel (with advanced matching data when we already know the
    // visitor — Meta hashes these client-side)
    this.applyAdvancedMatching(getTrackingUserData());

    this.loaded = true;
  }

  /**
   * Set advanced matching data, initializing the pixel on the first call
   * only. Re-calling `fbq('init', pixelId, ...)` for an already-initialized
   * pixel ID triggers Meta's "Duplicate Pixel ID" warning and was silently
   * suppressing standard conversion events (AddToCart, InitiateCheckout,
   * Purchase) that followed it — confirmed via Meta's own diagnostics.
   * Meta's documented way to update matching data afterward is
   * `fbq('set', 'userData', ...)`, which doesn't re-initialize anything.
   */
  private applyAdvancedMatching(userData: TrackingUserData): void {
    const am = toAdvancedMatching(userData);
    const key = JSON.stringify(am);
    if (this.lastMatchKey === key) return;
    this.lastMatchKey = key;

    if (!this.hasInitialized) {
      this.hasInitialized = true;
      if (Object.keys(am).length > 0) {
        window.fbq("init", this.pixelId, am);
      } else {
        window.fbq("init", this.pixelId);
      }
      return;
    }

    if (Object.keys(am).length > 0) {
      window.fbq("set", "userData", am);
    }
  }

  destroy(): void {
    // Remove injected script element
    if (this.scriptElement?.parentNode) {
      this.scriptElement.parentNode.removeChild(this.scriptElement);
      this.scriptElement = null;
    }
    this.loaded = false;
    this.enabled = false;
  }

  trackEvent(event: TrackingEvent): void {
    if (!this.loaded || !this.enabled) return;
    if (typeof window === "undefined" || typeof window.fbq !== "function") return;

    const send = () => {
      if (event.userData) this.applyAdvancedMatching(event.userData);

      const metaEventName = META_EVENT_MAP[event.eventName as TrackingEventName];
      const params = buildMetaParams(event);

      // Attach eventId for server-side deduplication (Conversions API Phase 3)
      const options: Record<string, unknown> = { eventID: event.eventId };

      if (metaEventName) {
        // Standard Meta event
        window.fbq("track", metaEventName, params, options);
      } else {
        // Custom event — use trackCustom
        window.fbq("trackCustom", event.eventName, params, options);
      }
    };

    // fbq's own stub queues calls made before fbevents.js finishes loading
    // (fbq.callMethod is unset until then) and processes them as a batch
    // once it attaches. Live-tested: standard conversion events (AddToCart,
    // Purchase) with currency data sent through that queued-batch path can
    // silently fail to reach the network — Meta logs an "Invalid parameter
    // format for currency" diagnostic and the event never fires — while the
    // exact same event sent after the real script has attached works fine.
    // Deferring on our own side instead of relying on fbq's stub sidesteps
    // that entirely.
    // TEMP DEBUG — remove after diagnosing missing AddToCart/Checkout events
    console.log("[PIXEL DEBUG] trackEvent", {
      eventName: event.eventName,
      hasCallMethod: !!window.fbq.callMethod,
      queueLength: window.fbq.queue?.length,
    });

    if (window.fbq.callMethod) {
      send();
      // TEMP DEBUG — remove after diagnosing missing AddToCart/Checkout events
      console.log("[PIXEL DEBUG] sent immediately", event.eventName);
    } else {
      let attempts = 0;
      const poll = () => {
        if (!this.loaded) return; // destroyed while waiting
        attempts++;
        if (window.fbq.callMethod) {
          send();
          // TEMP DEBUG — remove after diagnosing missing AddToCart/Checkout events
          console.log("[PIXEL DEBUG] sent after polling", event.eventName, "attempts:", attempts);
        } else if (attempts > 100) {
          // TEMP DEBUG — remove after diagnosing missing AddToCart/Checkout events
          console.error("[PIXEL DEBUG] gave up polling for callMethod", event.eventName);
        } else {
          setTimeout(poll, 100);
        }
      };
      poll();
    }
  }

  isLoaded(): boolean {
    return this.loaded;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  // ── Private ───────────────────────────────────────────────────────────────

  private injectSdk(): void {
    // Standard Meta Pixel initialization (adapted from their snippet)
    // Only inject if fbq doesn't already exist
    if (typeof window.fbq === "function") return;

    const queue: unknown[] = [];
    const fbq: Window["fbq"] = Object.assign(
      (...args: unknown[]) => {
        if (fbq.callMethod) {
          fbq.callMethod(...args);
        } else {
          fbq.queue.push(args);
        }
      },
      { callMethod: undefined as ((...a: unknown[]) => void) | undefined, queue },
    );

    window.fbq = fbq;
    window._fbq = fbq;

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    this.scriptElement = script;

    const firstScript = document.getElementsByTagName("script")[0];
    if (firstScript?.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      document.head.appendChild(script);
    }
  }
}
