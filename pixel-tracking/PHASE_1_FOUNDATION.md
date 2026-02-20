# Phase 1: Foundation — Event Bus, Types, Schema & Test Infrastructure

> **Goal:** Build the core plumbing — standardized event types, database tables for pixel configs and event storage, the client-side event bus context, and test infrastructure.

---

## Prerequisites

- Docker running (PostgreSQL accessible)
- `pnpm install` completed
- Existing system working (`pnpm dev` boots without errors)

---

## Task 1.1: Set Up Test Infrastructure

**Why first:** Every subsequent task needs tests to verify it doesn't break existing code.

### Files to create:
- `vitest.config.ts` — Root vitest config with `#root` alias resolution
- `package.json` — Add `"test"` and `"test:watch"` scripts
- `tests/setup.ts` — Global test setup (env vars, mocks)
- `tests/existing-system.test.ts` — Baseline test that imports key modules to ensure they compile

### Acceptance criteria:
- [ ] `pnpm test` runs and passes
- [ ] Baseline test proves existing modules are importable
- [ ] `npx tsc --noEmit` passes

---

## Task 1.2: Define Standardized Event Types

**Why:** The event taxonomy is the contract between frontend, backend, and all pixel adapters. Must be defined first.

### Files to create:
- `shared/types/pixel-tracking.ts`

### Types to define:

```typescript
// Standard e-commerce events (superset of all platforms)
enum TrackingEventName {
  PAGE_VIEWED = "page_viewed",
  PRODUCT_VIEWED = "product_viewed",
  PRODUCT_LIST_VIEWED = "product_list_viewed",
  PRODUCT_ADDED_TO_CART = "product_added_to_cart",
  PRODUCT_REMOVED_FROM_CART = "product_removed_from_cart",
  CART_VIEWED = "cart_viewed",
  CHECKOUT_STARTED = "checkout_started",
  CHECKOUT_SHIPPING_SUBMITTED = "checkout_shipping_submitted",
  CHECKOUT_PAYMENT_SUBMITTED = "checkout_payment_submitted",
  CHECKOUT_COMPLETED = "checkout_completed",
  SEARCH_SUBMITTED = "search_submitted",
  REGISTRATION_COMPLETED = "registration_completed",
  LOGIN_COMPLETED = "login_completed",
  PROMO_CODE_APPLIED = "promo_code_applied",
  // Custom / advanced
  COLLECTION_VIEWED = "collection_viewed",
  PROMOTION_VIEWED = "promotion_viewed",
  PROMOTION_CLICKED = "promotion_clicked",
  NEWSLETTER_SUBSCRIBED = "newsletter_subscribed",
  CUSTOM_EVENT = "custom_event",
}

// Pixel platform identifiers
enum PixelPlatform {
  META = "meta",
  GOOGLE_GA4 = "google_ga4",
  TIKTOK = "tiktok",
  SNAPCHAT = "snapchat",
  PINTEREST = "pinterest",
  CUSTOM = "custom",
}

// Tracking event payload shape
interface TrackingEvent {
  eventId: string;           // UUID for deduplication across client+server
  eventName: TrackingEventName | string;
  timestamp: number;         // Unix ms
  pageUrl: string;
  referrer?: string;
  sessionId: string;
  userId?: string;
  // UTM parameters
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  // E-commerce data
  ecommerce?: EcommerceEventData;
  // Custom properties
  customProperties?: Record<string, unknown>;
}

interface EcommerceEventData {
  currency?: string;
  value?: number;
  items?: TrackingProductItem[];
  transactionId?: string;
  tax?: number;
  shipping?: number;
  coupon?: string;
  searchQuery?: string;
}

interface TrackingProductItem {
  itemId: string;
  itemName: string;
  price?: number;
  quantity?: number;
  category?: string;
  brand?: string;
  variant?: string;
}

// Pixel configuration (stored in DB, managed in dashboard)
interface PixelConfig {
  id: string;
  platform: PixelPlatform;
  pixelId: string;
  accessToken?: string;       // For server-side APIs (encrypted in DB)
  enabled: boolean;
  enableClientSide: boolean;
  enableServerSide: boolean;
  consentRequired: boolean;
  consentCategory?: "analytics" | "marketing" | "custom";
  settings?: Record<string, unknown>;  // Platform-specific config
}

// Event name mapping per platform
interface PlatformEventMapping {
  [TrackingEventName.PAGE_VIEWED]: string;
  [TrackingEventName.PRODUCT_VIEWED]: string;
  // ... etc
}
```

### Platform event name mappings to document:

| Our Event | Meta `fbq()` | Google `gtag()` | TikTok `ttq` | Snapchat | Pinterest |
|-----------|-------------|-----------------|--------------|----------|-----------|
| `page_viewed` | `PageView` | `page_view` | `Pageview` | `PAGE_VIEW` | `pagevisit` |
| `product_viewed` | `ViewContent` | `view_item` | `ViewContent` | `VIEW_CONTENT` | `pagevisit` |
| `product_added_to_cart` | `AddToCart` | `add_to_cart` | `AddToCart` | `ADD_CART` | `addtocart` |
| `cart_viewed` | `ViewContent` | `view_cart` | `ViewContent` | `VIEW_CONTENT` | `pagevisit` |
| `checkout_started` | `InitiateCheckout` | `begin_checkout` | `InitiateCheckout` | `START_CHECKOUT` | `checkout` |
| `checkout_payment_submitted` | `AddPaymentInfo` | `add_payment_info` | `AddPaymentInfo` | `ADD_BILLING` | `checkout` |
| `checkout_completed` | `Purchase` | `purchase` | `CompletePayment` | `PURCHASE` | `checkout` |
| `search_submitted` | `Search` | `search` | `Search` | `SEARCH` | `search` |
| `registration_completed` | `CompleteRegistration` | `sign_up` | `CompleteRegistration` | `SIGN_UP` | `signup` |

### Acceptance criteria:
- [ ] All types exported from `shared/types/pixel-tracking.ts`
- [ ] Event name mapping table is part of the types (as a const map)
- [ ] `npx tsc --noEmit` passes
- [ ] Test file verifies types are importable

---

## Task 1.3: Database Schema — Pixel Config & Tracking Events Tables

**Why:** We need persistent storage for pixel configurations (admin manages) and event logs (our first-party data).

### Files to modify:
- `shared/database/drizzle/schema.ts` — Append new tables at the bottom

### Tables to add:

#### `pixel_config` table
```
- id: UUIDv7 PK
- merchantId: UUID NOT NULL (for single-shop, there's one merchant)
- platform: pixelPlatformEnum NOT NULL
- pixelId: TEXT NOT NULL (the platform's pixel/measurement ID)
- accessToken: TEXT (encrypted, for server-side APIs)
- enabled: BOOLEAN DEFAULT true
- enableClientSide: BOOLEAN DEFAULT true
- enableServerSide: BOOLEAN DEFAULT false
- consentRequired: BOOLEAN DEFAULT false
- consentCategory: TEXT (analytics | marketing | custom)
- settings: JSONB (platform-specific config)
- createdAt: TIMESTAMPTZ NOT NULL DEFAULT NOW()
- updatedAt: TIMESTAMPTZ
```

#### `tracking_event` table (append-only log)
```
- id: UUIDv7 PK
- sessionId: TEXT NOT NULL
- userId: UUID (nullable FK to user, onDelete set null)
- eventName: TEXT NOT NULL
- eventId: TEXT NOT NULL (client-generated UUID for dedup)
- eventData: JSONB NOT NULL (full TrackingEvent payload)
- pageUrl: TEXT
- referrer: TEXT
- utmSource: TEXT
- utmMedium: TEXT
- utmCampaign: TEXT
- userAgent: TEXT
- ipHash: TEXT (SHA-256 hashed, never raw IP)
- deviceType: TEXT
- createdAt: TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

#### `tracking_event_delivery` table (tracks which pixels received each event)
```
- id: UUIDv7 PK
- trackingEventId: UUID NOT NULL FK to tracking_event (cascade)
- platform: pixelPlatformEnum NOT NULL
- sent: BOOLEAN DEFAULT false
- sentAt: TIMESTAMPTZ
- platformEventId: TEXT (ID returned by the platform)
- error: TEXT
- createdAt: TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

### After schema changes:
1. `pnpm drizzle:generate`
2. `pnpm drizzle:migrate`
3. Verify migration applied cleanly

### Acceptance criteria:
- [ ] Migration generates and applies without errors
- [ ] Tables appear in the database
- [ ] `npx tsc --noEmit` passes
- [ ] Test verifies schema exports are correct

---

## Task 1.4: Backend Module — Pixel Tracking tRPC Router

**Why:** The backend needs endpoints to receive tracking events and manage pixel configs.

### Files to create:

```
backend/pixel-tracking/
  trpc.ts                          ← Domain router
  track-event/
    trpc.ts                        ← Public procedure (POST event from client beacon)
    service.ts                     ← Event storage logic (Effect-TS)
  pixel-config/
    trpc.ts                        ← Admin procedures (CRUD pixel configurations)
    service.ts                     ← Config management logic
```

### Procedures:

| Procedure | Auth Level | Input | Description |
|-----------|-----------|-------|-------------|
| `pixelTracking.trackEvent` | `publicProcedure` | `TrackingEvent` (Zod) | Receives events from the client beacon, stores in `tracking_event` |
| `pixelTracking.config.list` | `adminProcedure` | None | List all pixel configs for the merchant |
| `pixelTracking.config.get` | `adminProcedure` | `{ id: string }` | Get single pixel config |
| `pixelTracking.config.create` | `adminProcedure` | `PixelConfigInput` (Zod) | Create new pixel config |
| `pixelTracking.config.update` | `adminProcedure` | `PixelConfigUpdate` (Zod) | Update pixel config |
| `pixelTracking.config.delete` | `adminProcedure` | `{ id: string }` | Delete pixel config |
| `pixelTracking.config.test` | `adminProcedure` | `{ id: string }` | Fire a test event to the platform |

### Register in router:
Add `pixelTracking: pixelTrackingRouter` to `shared/trpc/router.ts`.

### Acceptance criteria:
- [ ] All procedures compile
- [ ] Router registered in `appRouter`
- [ ] `npx tsc --noEmit` passes
- [ ] Integration test: `trackEvent` stores event in DB
- [ ] Integration test: config CRUD works

---

## Task 1.5: Client-Side Event Bus & TrackingContext

**Why:** The frontend needs a centralized event bus that all components can emit events to, and all pixel adapters can subscribe to.

### Files to create:
- `frontend/contexts/TrackingContext.tsx` — Provider + hook
- `shared/utils/tracking-event-bus.ts` — Platform-agnostic event bus (pub/sub)
- `shared/utils/session-id.ts` — Generate/persist session ID (localStorage)

### TrackingContext responsibilities:
1. Generate and persist a `sessionId` in localStorage
2. Capture UTM parameters from the URL on first load
3. Expose `trackEvent(eventName, data?)` method to all components
4. When `trackEvent` is called:
   - Construct a full `TrackingEvent` object (auto-fill pageUrl, sessionId, timestamp, eventId)
   - Publish to the event bus (for client-side pixel adapters, Phase 2)
   - Send to `POST /api/track` beacon endpoint (for server-side processing, Phase 3)
   - For now (Phase 1): just log to console in dev mode + store locally

### Integration in layout:
Add `<TrackingProvider>` to `layouts/LayoutDefault.tsx`, wrapping inside `TemplateProvider`.

### Acceptance criteria:
- [ ] `useTracking()` hook works in any component
- [ ] `trackEvent()` constructs a valid `TrackingEvent`
- [ ] Session ID persists across page reloads
- [ ] UTM params captured from URL
- [ ] `npx tsc --noEmit` passes
- [ ] Test: TrackingContext renders without crashing

---

## Task 1.6: Wire Page View Tracking

**Why:** Quick win — automatically track `page_viewed` on every navigation.

### Files to modify:
- `pages/+onPageTransitionEnd.ts` — Call `trackEvent('page_viewed')` on SPA navigation
- `pages/index/+Page.tsx` — Emit `page_viewed` on initial SSR load (via useEffect)

### Implementation notes:
- For the SPA transition hook: we need to access the TrackingContext. Since `+onPageTransitionEnd` runs outside React, we'll use the event bus directly (imported as a module singleton).
- For initial page load: use `useEffect` in the layout or page component.

### Acceptance criteria:
- [ ] `page_viewed` event fires on initial load
- [ ] `page_viewed` event fires on every SPA navigation
- [ ] Events have correct `pageUrl` and `referrer`
- [ ] `npx tsc --noEmit` passes
- [ ] Test: page_viewed event shape is correct

---

## Phase 1 Completion Checklist

- [ ] vitest configured and `pnpm test` works
- [ ] `shared/types/pixel-tracking.ts` — all types defined
- [ ] `pixel_config` table in DB
- [ ] `tracking_event` table in DB
- [ ] `tracking_event_delivery` table in DB
- [ ] `backend/pixel-tracking/` module with all procedures
- [ ] `pixelTracking` router registered in `appRouter`
- [ ] `TrackingContext` + `useTracking()` hook working
- [ ] Event bus singleton working
- [ ] `page_viewed` auto-tracking working
- [ ] All integration tests passing
- [ ] `npx tsc --noEmit` → zero errors
- [ ] Existing system still works (no regression)
