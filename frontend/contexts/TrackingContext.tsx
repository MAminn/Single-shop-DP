import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
  type ReactNode,
} from "react";
import { v7 } from "uuid";
import { usePageContext } from "vike-react/usePageContext";
import {
  TrackingEventName,
  type TrackingEvent,
  type EcommerceEventData,
  type PixelConfig,
  type CustomTrackingEventConfig,
} from "#root/shared/types/pixel-tracking";
import { trackingEventBus } from "#root/shared/utils/tracking-event-bus";
import { getSessionId } from "#root/shared/utils/session-id";
import { ensureMetaCookies } from "#root/shared/utils/meta-cookies";
import {
  getTrackingUserData,
  saveCustomerIdentity,
} from "#root/shared/utils/customer-identity";
import { trpc } from "#root/shared/trpc/client";
import { PixelAdapterRegistry } from "#root/frontend/pixel-adapters/registry";
import { createAdapterForPlatform } from "#root/frontend/pixel-adapters/factory";
import { CustomEventTriggerManager } from "#root/frontend/tracking/custom-event-triggers";
import { EngagementTracker } from "#root/frontend/pixel-adapters/engagement-tracker";

// ─── UTM Parsing ────────────────────────────────────────────────────────────

interface UtmParams {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
}

function parseUtmParams(): UtmParams {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const utm: UtmParams = {};
  const src = params.get("utm_source");
  const med = params.get("utm_medium");
  const camp = params.get("utm_campaign");
  const term = params.get("utm_term");
  const content = params.get("utm_content");
  if (src) utm.utmSource = src;
  if (med) utm.utmMedium = med;
  if (camp) utm.utmCampaign = camp;
  if (term) utm.utmTerm = term;
  if (content) utm.utmContent = content;
  return utm;
}

// ─── Context Types ──────────────────────────────────────────────────────────

interface TrackingContextValue {
  trackEvent: (
    eventName: TrackingEventName | string,
    data?: {
      ecommerce?: EcommerceEventData;
      customProperties?: Record<string, unknown>;
    },
  ) => void;
  sessionId: string;
}

const TrackingContext = createContext<TrackingContextValue | undefined>(
  undefined,
);

// ─── Provider ───────────────────────────────────────────────────────────────

export function TrackingProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState<string>("");
  const utmRef = useRef<UtmParams>({});
  const pageContext = usePageContext();
  const lastPathnameRef = useRef<string | null>(null);

  // Initialize session ID and UTM params once
  useEffect(() => {
    // Must run before any event fires so _fbp/_fbc ride along on every beacon.
    ensureMetaCookies();
    setSessionId(getSessionId());
    utmRef.current = parseUtmParams();
  }, []);

  // ── Pixel Adapter Wiring ────────────────────────────────────────────────
  const registryRef = useRef<PixelAdapterRegistry | null>(null);
  const hasFiredInitialPageView = useRef(false);
  const trackEventRef = useRef<
    (
      eventName: TrackingEventName | string,
      data?: {
        ecommerce?: EcommerceEventData;
        customProperties?: Record<string, unknown>;
      },
    ) => void
  >(() => {});

  // ── Custom Event Triggers ──────────────────────────────────────────────
  const customTriggerRef = useRef<CustomEventTriggerManager | null>(null);

  // ── Engagement Tracker ─────────────────────────────────────────────────
  const engagementRef = useRef<EngagementTracker | null>(null);

  // ── Beacon Buffer ──────────────────────────────────────────────────────
  const eventBufferRef = useRef<TrackingEvent[]>([]);
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Flush all buffered events to the beacon endpoint via fetch. */
  const flushBuffer = useCallback(() => {
    if (typeof window === "undefined") return;
    const buffer = eventBufferRef.current;
    if (buffer.length === 0) return;

    const batch = [...buffer];
    eventBufferRef.current = [];

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events: batch }),
      keepalive: true, // ensures delivery even during navigation
      credentials: "same-origin", // send first-party cookies (_ga, _fbp, etc.)
    }).catch(() => {
      // Silent — fire-and-forget
    });
  }, []);

  /** Add an event to the buffer; auto-flush after 250ms debounce. */
  const bufferEvent = useCallback(
    (event: TrackingEvent) => {
      eventBufferRef.current.push(event);
      if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
      flushTimerRef.current = setTimeout(flushBuffer, 250);
    },
    [flushBuffer],
  );

  // ── Visibility change: sendBeacon for guaranteed delivery ──────────────
  useEffect(() => {
    if (typeof document === "undefined") return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        const buffer = eventBufferRef.current;
        if (buffer.length === 0) return;

        // Clear the debounce timer so we don't double-send
        if (flushTimerRef.current) {
          clearTimeout(flushTimerRef.current);
          flushTimerRef.current = null;
        }

        const payload = JSON.stringify({ events: [...buffer] });
        eventBufferRef.current = [];

        // navigator.sendBeacon is guaranteed to fire even on page unload
        if (typeof navigator !== "undefined" && navigator.sendBeacon) {
          navigator.sendBeacon(
            "/api/track",
            new Blob([payload], { type: "application/json" }),
          );
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      // Flush any remaining events on unmount
      if (flushTimerRef.current) {
        clearTimeout(flushTimerRef.current);
        flushTimerRef.current = null;
      }
      if (eventBufferRef.current.length > 0) {
        const payload = JSON.stringify({
          events: [...eventBufferRef.current],
        });
        eventBufferRef.current = [];
        if (typeof navigator !== "undefined" && navigator.sendBeacon) {
          navigator.sendBeacon(
            "/api/track",
            new Blob([payload], { type: "application/json" }),
          );
        }
      }
    };
  }, []);

  const trackEvent = useCallback(
    (
      eventName: TrackingEventName | string,
      data?: {
        ecommerce?: EcommerceEventData;
        customProperties?: Record<string, unknown>;
      },
    ) => {
      const event: TrackingEvent = {
        eventId: v7(),
        eventName,
        timestamp: Date.now(),
        pageUrl: typeof window !== "undefined" ? window.location.href : "",
        referrer:
          typeof document !== "undefined" ? document.referrer : undefined,
        sessionId: sessionId || getSessionId(),
        userData: getTrackingUserData(),
        ...utmRef.current,
        ecommerce: data?.ecommerce,
        customProperties: data?.customProperties,
      };

      // Emit to the event bus — adapters receive via broadcastEvent subscription
      trackingEventBus.emit(event);

      // Buffer event for server-side beacon relay
      bufferEvent(event);

      // Dev logging
      if (
        typeof window !== "undefined" &&
        window.location.hostname === "localhost"
      ) {
        console.debug("[Tracking]", event.eventName, event);
      }
    },
    [sessionId, bufferEvent],
  );
  trackEventRef.current = trackEvent;

  useEffect(() => {
    // Only run client-side
    if (typeof window === "undefined") return;

    let cancelled = false;
    const registry = new PixelAdapterRegistry();
    registryRef.current = registry;

    const fireInitialPageView = () => {
      if (hasFiredInitialPageView.current) return;
      hasFiredInitialPageView.current = true;
      trackEventRef.current(TrackingEventName.PAGE_VIEWED);
    };

    // The ad/analytics SDKs (fbevents, gtag, Clarity, …) are ~800ms of main-
    // thread script time and ~600KB on the wire. Loading them at startup
    // competes with the hero image and blocks input, so hold them until the
    // visitor first interacts — or 4s after the page has loaded — and queue
    // any events fired meanwhile so nothing is lost. The server-side (CAPI)
    // copy of each event is sent immediately regardless.
    //
    // Exception: /checkout and /order-confirmation boot immediately, no
    // defer. Stripe/Paymob redirect back to /order-confirmation as a hard
    // browser navigation (this provider remounts fresh), and that page fires
    // Purchase right on mount — if the visitor leaves before the 4s timer or
    // an interaction, the queued Purchase is dropped for good. This is the
    // one event set we can't afford to lose to a speed optimization.
    const criticalRoutes = ["/checkout", "/order-confirmation"];
    const isCriticalRoute = criticalRoutes.some((route) =>
      pageContext.urlPathname?.startsWith(route),
    );
    let sdkReady = false;
    const queued: TrackingEvent[] = [];
    let pendingConfigs: PixelConfig[] | null = null;
    let detachTriggers: (() => void) | null = null;

    const bootAdapters = () => {
      if (cancelled || sdkReady || !pendingConfigs) return;
      detachTriggers?.();
      detachTriggers = null;
      for (const config of pendingConfigs) {
        const adapter = createAdapterForPlatform(config.platform);
        if (adapter) {
          adapter.initialize(config);
          registry.register(adapter);
        }
      }
      sdkReady = true;
      for (const event of queued.splice(0)) registry.broadcastEvent(event);
    };

    const scheduleBoot = () => {
      const events = ["pointerdown", "keydown", "scroll", "touchstart"] as const;
      let timer: ReturnType<typeof setTimeout> | undefined;
      const trigger = () => bootAdapters();
      const arm = () => {
        timer = setTimeout(trigger, 4000);
      };
      for (const name of events) {
        window.addEventListener(name, trigger, { once: true, passive: true });
      }
      if (document.readyState === "complete") arm();
      else window.addEventListener("load", arm, { once: true });
      detachTriggers = () => {
        if (timer) clearTimeout(timer);
        for (const name of events) window.removeEventListener(name, trigger);
        window.removeEventListener("load", arm);
      };
    };

    // Subscribe before any event can fire so early events are queued, not lost
    const unsubscribe = trackingEventBus.subscribe((event) => {
      if (sdkReady) registry.broadcastEvent(event);
      else queued.push(event);
    });

    // Fetch enabled client-side configs, then boot adapters lazily
    trpc.pixelTracking.config.listActive
      .query()
      .then((result) => {
        if (cancelled) return;
        if (result.success) {
          pendingConfigs = result.result as PixelConfig[];
          if (isCriticalRoute) {
            bootAdapters();
          } else {
            scheduleBoot();
          }
        }

        fireInitialPageView();
      })
      .catch(() => {
        // Pixel config fetch failed — gracefully degrade, no pixels fire
        if (
          typeof window !== "undefined" &&
          window.location.hostname === "localhost"
        ) {
          console.debug("[Tracking] Failed to fetch pixel configs");
        }
        if (!cancelled) {
          fireInitialPageView();
        }
      });

    return () => {
      cancelled = true;
      detachTriggers?.();
      unsubscribe();
      registry.destroyAll();
      registryRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;
    const manager = new CustomEventTriggerManager(
      (eventName, customProperties) => {
        trackEventRef.current(eventName, { customProperties });
      },
    );
    customTriggerRef.current = manager;

    // Fetch active custom event configs
    trpc.pixelTracking.customEvents.listActive
      .query()
      .then((result) => {
        if (cancelled) return;
        if (!result.success) return;
        const configs = result.result as CustomTrackingEventConfig[];
        manager.loadConfigs(configs);
      })
      .catch(() => {
        if (
          typeof window !== "undefined" &&
          window.location.hostname === "localhost"
        ) {
          console.debug("[Tracking] Failed to fetch custom event configs");
        }
      });

    // Listen for test events from the dashboard
    const handleTestEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.eventName) {
        trackEventRef.current(detail.eventName, {
          customProperties: detail.eventData ?? {},
        });
      }
    };
    window.addEventListener("tracking:custom-event-test", handleTestEvent);

    return () => {
      cancelled = true;
      window.removeEventListener("tracking:custom-event-test", handleTestEvent);
      manager.destroyAll();
      customTriggerRef.current = null;
    };
  }, []);

  // ── Engagement Tracker Initialization ──────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Create once. Depending on `trackEvent` here would rebuild the tracker
    // (and wipe its fired-threshold memory) when the session id populates,
    // re-firing scroll_depth / time_on_page events.
    const tracker = new EngagementTracker((eventName, customProperties) => {
      trackEventRef.current(eventName, { customProperties });
    });
    engagementRef.current = tracker;
    tracker.start();

    return () => {
      tracker.destroy();
      engagementRef.current = null;
    };
  }, []);

  // Reset per-page engagement state (scroll-depth sentinels, product
  // impression tracking) on Vike client-side navigation. Without this the
  // tracker created above lives for the whole SPA session: its scroll
  // sentinels stay pinned to the first page's height and its product
  // MutationObserver just keeps accumulating watched state across every
  // page the visitor ever navigates to.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const pathname = pageContext.urlPathname;
    if (lastPathnameRef.current === null) {
      // Initial mount — the tracker-creation effect above already called
      // start() for this first page.
      lastPathnameRef.current = pathname;
      return;
    }
    if (lastPathnameRef.current === pathname) return;
    lastPathnameRef.current = pathname;
    engagementRef.current?.onPageChange();
  }, [pageContext.urlPathname]);

  // Remember email / phone as soon as a visitor types them into any form
  // (checkout, popup, newsletter, login) so later events can be matched.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const handleFocusOut = (e: FocusEvent) => {
      const el = e.target;
      if (!(el instanceof HTMLInputElement) || !el.value) return;
      const hint = `${el.type} ${el.name} ${el.autocomplete}`.toLowerCase();
      if (el.type === "email" || /email/.test(hint)) {
        saveCustomerIdentity({ email: el.value });
      } else if (el.type === "tel" || /phone|mobile/.test(hint)) {
        saveCustomerIdentity({ phone: el.value });
      }
    };
    document.addEventListener("focusout", handleFocusOut);
    return () => document.removeEventListener("focusout", handleFocusOut);
  }, []);

  const value = useMemo<TrackingContextValue>(
    () => ({ trackEvent, sessionId }),
    [trackEvent, sessionId],
  );

  return (
    <TrackingContext.Provider value={value}>
      {children}
    </TrackingContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useTracking(): TrackingContextValue {
  const context = useContext(TrackingContext);
  if (!context) {
    throw new Error("useTracking must be used within a TrackingProvider");
  }
  return context;
}
