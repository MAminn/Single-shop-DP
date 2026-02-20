# Phase 5: Advanced Features & Competitive Edges

> **Goal:** Implement the features that make our pixel system **better than Shopify's** — custom event builder, scroll/heatmap tracking, multi-touch attribution, consent management, and UTM auto-capture.

> **Depends on:** Phase 4 fully complete.

---

## Task 5.1: Custom Event Builder (Dashboard UI)

**Why (Shopify One-Up #1):** Shopify only supports their predefined standard events. We let the merchant define ANY custom event and auto-fire it across all connected platforms.

### Files to create:
- `pages/dashboard/admin/pixels/custom-events/+Page.tsx` — Custom event builder page
- `components/dashboard/pixels/CustomEventBuilder.tsx` — Visual event builder component
- `components/dashboard/pixels/CustomEventList.tsx` — List of created custom events
- `backend/pixel-tracking/custom-events-service.ts` — CRUD service for custom events

### Database additions:
- New table: `custom_tracking_event` (or add to existing schema)
  - `id` — UUIDv7
  - `name` — Event name (e.g., `loyalty_signup`, `size_guide_opened`)
  - `displayName` — Human-friendly name
  - `description` — What this event means
  - `triggerType` — `manual` | `css_selector` | `url_match` | `time_on_page`
  - `triggerConfig` — JSONB (CSS selector string, URL regex, time threshold, etc.)
  - `eventData` — JSONB (static custom data to attach)
  - `platformMapping` — JSONB (per-platform custom event name overrides)
  - `isActive` — boolean
  - `createdAt`, `updatedAt`

### Builder features:
1. **Event name** — Text input
2. **Trigger type selector:**
   - **Manual:** Only fires via code (developer use)
   - **CSS Selector Click:** Fires when user clicks an element matching selector (e.g., `.size-guide-btn`)
   - **URL Match:** Fires on page load when URL matches pattern
   - **Time on Page:** Fires after N seconds on a page
3. **Custom data fields** — Key-value pairs to attach
4. **Platform name overrides** — Optional per-platform event name (e.g., Meta sees `CustomEvent_LoyaltySignup`)
5. **Preview & test** — Fire test event from builder

### Client-side implementation:
- `TrackingContext` loads custom event configs on mount
- For CSS Selector triggers: sets up `MutationObserver` + click listeners
- For URL Match: checks on each page navigation
- For Time on Page: sets up timers per page
- All fire through the existing event bus → adapters pipeline

### Acceptance criteria:
- [ ] Custom event CRUD in dashboard
- [ ] All 4 trigger types working  
- [ ] Events fire through existing pipeline (client + server)
- [ ] Platform name overrides applied correctly
- [ ] Test button works from builder
- [ ] `npx tsc --noEmit` passes
- [ ] Integration tests for custom event triggers

---

## Task 5.2: Scroll Depth & Engagement Tracking

**Why (Shopify One-Up #2):** Shopify has zero built-in engagement tracking. We provide scroll depth, time on page, and element visibility — data that's gold for retargeting.

### Files to create:
- `frontend/pixel-adapters/engagement-tracker.ts` — Engagement tracking module
- `components/dashboard/pixels/EngagementDashboard.tsx` — Engagement analytics view

### Engagement events to track:

1. **Scroll Depth:**
   - Track when user scrolls past 25%, 50%, 75%, 90% of page
   - Event: `scroll_depth` with `{ depth: 25 | 50 | 75 | 90 }`
   - Uses `IntersectionObserver` with sentinel elements at each threshold
   - Fire once per threshold per page view (don't re-fire on scroll back up)

2. **Time on Page:**
   - Track engaged time (not idle time)
   - Event: `time_on_page` with `{ seconds: N }` at intervals (30s, 60s, 120s, 300s)
   - Pause timer when tab is hidden (`visibilitychange`)
   - Resume when tab returns

3. **Element Visibility (Product Impressions):**
   - Track when product cards enter the viewport
   - Event: `product_impression` with product data
   - Uses `IntersectionObserver` with `threshold: 0.5` (50% visible)
   - Fire once per product per page view
   - Batch impressions (don't fire per-card, collect for 500ms then fire as list)

### Platform integration:
- These events fire through the standard event bus
- Client adapters send them as custom events to each platform
- Server-side receives them via beacon for persistence

### Dashboard widget:
- Average scroll depth per page
- Average engagement time per page
- Product impression heat — which products are seen most but bought least

### Acceptance criteria:
- [ ] Scroll depth tracking at 4 thresholds
- [ ] Engaged time tracking with pause/resume
- [ ] Product impression tracking with batching
- [ ] Dashboard widget with engagement stats
- [ ] `npx tsc --noEmit` passes
- [ ] Tests for observer setup and event firing

---

## Task 5.3: Multi-Touch Attribution Model

**Why (Shopify One-Up #3):** Shopify only shows last-click attribution. We provide first-touch, last-touch, and linear multi-touch — actual useful data.

### Files to create:
- `backend/pixel-tracking/attribution-service.ts` — Attribution calculation
- `components/dashboard/pixels/AttributionDashboard.tsx` — Attribution view

### Database additions:
- New table: `attribution_touchpoint`
  - `id` — UUIDv7
  - `sessionId` — Link to session
  - `userId` — Link to user (if known)
  - `channel` — `organic` | `paid_meta` | `paid_google` | `paid_tiktok` | `paid_snapchat` | `paid_pinterest` | `direct` | `email` | `referral` | `social`
  - `source` — Raw UTM source
  - `medium` — Raw UTM medium
  - `campaign` — Raw UTM campaign
  - `landingPage` — URL
  - `referrer` — Previous URL
  - `clickId` — fbclid, gclid, ttclid, etc.
  - `timestamp`

### Attribution models:

1. **First-Touch:** 100% credit to the first touchpoint that brought the user
2. **Last-Touch:** 100% credit to the last touchpoint before conversion
3. **Linear:** Equal credit split across all touchpoints
4. **Time-Decay (bonus):** More credit to recent touchpoints

### Implementation:
1. Every page load captures UTM params + referrer → stores as touchpoint
2. When a `purchase_completed` event fires:
   - Gather all touchpoints for this user/session
   - Calculate attribution credit per model
   - Store results linked to the order

### Dashboard view:
- Channel performance table (by each attribution model)
- Conversion path visualization (top 10 paths)
- Model comparison (same data, different models side by side)

### Acceptance criteria:
- [ ] Touchpoints captured on every page load with UTM/referrer
- [ ] Three attribution models calculated correctly
- [ ] Results linked to orders
- [ ] Dashboard shows channel performance per model
- [ ] `npx tsc --noEmit` passes
- [ ] Unit tests for attribution calculations

---

## Task 5.4: Consent Management Integration

**Why (Shopify One-Up #4):** Shopify requires a paid third-party app for GDPR consent. We build it in for free.

### Files to create:
- `frontend/components/ConsentBanner.tsx` — Cookie consent banner
- `frontend/contexts/ConsentContext.tsx` — Consent state management
- `backend/pixel-tracking/consent-service.ts` — Consent preference storage

### Database additions:
- New table: `tracking_consent`
  - `id` — UUIDv7
  - `sessionId` — Current session
  - `userId` — If logged in
  - `consentGiven` — boolean (overall consent)
  - `consentCategories` — JSONB `{ analytics: true, marketing: true, functional: true }`
  - `consentMethod` — `banner_accept` | `banner_reject` | `settings_page` | `implied`
  - `ipAddress` — For audit
  - `userAgent` — For audit
  - `timestamp`
  - `expiresAt` — Consent validity (e.g., 12 months)

### Consent categories:
| Category | What it covers | Pixels affected |
|----------|---------------|-----------------|
| **Functional** | Essential tracking (session, cart) | None — always allowed |
| **Analytics** | Page views, scroll depth, engagement | GA4 |
| **Marketing** | Ad pixels, retargeting, conversion tracking | Meta, TikTok, Snapchat, Pinterest |

### Consent flow:
1. On first visit → show consent banner
2. User choices stored in cookie + database
3. TrackingContext checks consent before initializing adapters
4. Only load pixel scripts for consented categories
5. Server-side: only send events to platforms the user consented to
6. Consent can be changed anytime via footer link → settings modal

### Banner UI:
- Clean, minimal banner at bottom of page
- "Accept All" / "Reject All" / "Customize" buttons
- Customize: toggles per category
- Styled to match store theme (inherits template CSS variables)

### Integration with existing tracking:
- `TrackingContext` wraps consent check:
  ```
  if (consent.marketing) → initialize Meta, TikTok, Snapchat, Pinterest
  if (consent.analytics) → initialize GA4
  always → initialize functional (session tracking, cart events for internal use)
  ```

### Acceptance criteria:
- [ ] Consent banner renders on first visit
- [ ] Consent choices persisted to cookie + DB
- [ ] Pixel scripts only load for consented categories
- [ ] Server-side respects consent per-platform
- [ ] Consent log maintained for GDPR audit
- [ ] Settings link in footer to change consent
- [ ] `npx tsc --noEmit` passes
- [ ] Integration test: consent flow end-to-end

---

## Task 5.5: UTM Auto-Capture & Campaign Tracking

**Why (Shopify One-Up #5):** Shopify has zero UTM tracking built in. We auto-capture all UTM params, click IDs, and referrers for every session.

### Files to create:
- `frontend/tracking/utm-capture.ts` — UTM extraction utility
- `backend/pixel-tracking/session-enrichment.ts` — Server-side session enrichment

### UTM parameters to capture:
| Parameter | Example | Storage |
|-----------|---------|---------|
| `utm_source` | `facebook`, `google`, `email` | Cookie + DB |
| `utm_medium` | `cpc`, `social`, `email` | Cookie + DB |
| `utm_campaign` | `spring_sale_2024` | Cookie + DB |
| `utm_term` | `blue widget` | Cookie + DB |
| `utm_content` | `banner_v2` | Cookie + DB |
| `fbclid` | Meta click ID | Cookie + DB |
| `gclid` | Google click ID | Cookie + DB |
| `ttclid` | TikTok click ID | Cookie + DB |
| `ScCid` | Snapchat click ID | Cookie + DB |
| `epik` | Pinterest click ID | Cookie + DB |

### Implementation:

1. **On every page load** (in `TrackingContext` or `+onPageTransitionEnd`):
   - Parse `window.location.search` for UTM params and click IDs
   - If present: store in session cookie (persists across page nav)
   - Store in `attribution_touchpoint` table (Task 5.3)

2. **First-touch vs last-touch cookies:**
   - `_ft_utm` cookie: set only if not already set (first visit)
   - `_lt_utm` cookie: overwritten on every new UTM visit

3. **Auto-attach to events:**
   - Every `TrackingEvent` enriched with current UTM data
   - Server-side: click IDs sent to respective platforms (fbclid → Meta CAPI, gclid → Google MP, etc.)

4. **Dashboard view:**
   - UTM breakdown table (source × medium × campaign → sessions, conversions, revenue)
   - Click ID attribution (which platform clicks convert)

### Acceptance criteria:
- [ ] All UTM params auto-captured from URL
- [ ] All click IDs (fbclid, gclid, ttclid, ScCid, epik) captured
- [ ] Stored in cookies + database
- [ ] First-touch preserved, last-touch updated
- [ ] Events enriched with UTM data
- [ ] Platform-specific click IDs sent to correct APIs
- [ ] Dashboard UTM breakdown table
- [ ] `npx tsc --noEmit` passes
- [ ] Tests for URL parsing and cookie management

---

## Task 5.6: Analytics Dashboard Enhancement

**Why:** Tie everything together — give the merchant one dashboard to see all their marketing performance.

### Files to create/modify:
- `pages/dashboard/admin/analytics/+Page.tsx` — Enhanced analytics page
- `components/dashboard/analytics/OverviewCards.tsx` — Key metrics
- `components/dashboard/analytics/ChannelBreakdown.tsx` — Performance by channel
- `components/dashboard/analytics/ConversionFunnel.tsx` — Visual funnel

### Dashboard sections:

1. **Overview cards:**
   - Total sessions (24h / 7d / 30d)
   - Total pageviews
   - Conversion rate
   - Average order value
   - Revenue by attribution model

2. **Conversion funnel:**
   - page_viewed → product_viewed → added_to_cart → checkout_started → purchase_completed
   - Drop-off % at each stage
   - Visual funnel chart (Recharts)

3. **Channel performance:**
   - Table: Channel | Sessions | Conversions | Revenue | ROAS
   - Filter by attribution model (first/last/linear)
   - Date range picker

4. **Platform health:**
   - Delivery success rate per platform
   - Failed deliveries alert
   - Last event timestamps

### Acceptance criteria:
- [ ] All dashboard sections render with real data
- [ ] Funnel visualization working
- [ ] Channel breakdown switchable by attribution model
- [ ] Platform health monitoring
- [ ] `npx tsc --noEmit` passes
- [ ] Integration test: dashboard renders

---

## Phase 5 Completion Checklist

- [ ] Custom event builder — visual UI + 4 trigger types
- [ ] Scroll depth + engagement tracking
- [ ] Multi-touch attribution (3 models)
- [ ] Consent management — banner + GDPR audit log
- [ ] UTM auto-capture — all params + click IDs
- [ ] Enhanced analytics dashboard — funnel + channels + health
- [ ] All integration tests passing
- [ ] `npx tsc --noEmit` → zero errors
- [ ] Full system works end-to-end: consent → event → client pixel → beacon → server API → persistence → attribution → dashboard
- [ ] Existing system still works (no regression)

---

## Post-Phase 5: Future Considerations (Out of Scope for Now)

- **Webhook forwarding** — Send events to merchant's own endpoints
- **A/B test integration** — Track experiment variants in events
- **Server-side GTM** — Google Tag Manager server-side container
- **Data export** — CSV/JSON export of all tracking data
- **Real-time event stream** — WebSocket feed of live events
- **Anomaly detection** — Alert on unusual traffic patterns or conversion drops
