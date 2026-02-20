import type { OnPageTransitionEndAsync } from "vike/types";
import { trackingEventBus } from "#root/shared/utils/tracking-event-bus";
import { TrackingEventName } from "#root/shared/types/pixel-tracking";
import { getSessionId } from "#root/shared/utils/session-id";
import { v7 } from "uuid";

export const onPageTransitionEnd: OnPageTransitionEndAsync = async (
  pageContext
) => {
  // Removed page transition animation for performance optimization

  // Force refresh dashboard page when navigating to it
  if (pageContext.urlPathname === "/dashboard") {
    // Small delay to ensure the page is mounted before refreshing content
    setTimeout(() => {
      window.location.reload();
    }, 20);
  }

  // Emit page_viewed on every SPA navigation
  trackingEventBus.emit({
    eventId: v7(),
    eventName: TrackingEventName.PAGE_VIEWED,
    timestamp: Date.now(),
    pageUrl: window.location.href,
    referrer: document.referrer || undefined,
    sessionId: getSessionId(),
  });
};
