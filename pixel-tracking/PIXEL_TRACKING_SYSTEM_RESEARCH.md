# Pixel & Tracking System Research for Single-shop-DP

> **Date:** February 14, 2026
> **Purpose:** Comprehensive research into implementing a pixel/tracking system comparable to (and exceeding) Shopify's capabilities.

---

## Table of Contents

1. [What You Already Have (Foundation Assets)](#1-what-you-already-have-foundation-assets)
2. [The Major Pixel/Tracking Platforms & Their APIs](#2-the-major-pixeltracking-platforms--their-apis)
3. [How Shopify Does It (The Benchmark)](#3-how-shopify-does-it-the-benchmark)
4. [How to One-Up Shopify](#4-how-to-one-up-shopify)
5. [Concrete Implementation Approaches](#5-concrete-implementation-approaches)
6. [Platform API Summary Table](#6-platform-api-summary-table)
7. [Your Existing Hooks to Leverage](#7-your-existing-hooks-to-leverage)
8. [Recommendation & Phased Rollout](#8-recommendation--phased-rollout)

---

## 1. What You Already Have (Foundation Assets)

The codebase already has surprisingly good scaffolding to build on:

| Asset | Location | Status |
|-------|----------|--------|
| `window.dataLayer` + `window.gtag` types | `pages/+Head.tsx` (lines 5-9) | Declared, not wired |
| `template_analytics` DB table | `shared/database/drizzle/schema.ts` (line 581) | Created, not populated |
| `TemplateAnalytics.tsx` component | `components/template/TemplateAnalytics.tsx` (lines 49-53) | Stub with TODO |
| `auth_log` / `order_log` / `webhook_log` tables | `shared/database/drizzle/schema.ts` (lines 767-833) | Working event-sourcing pattern |
| Page transition hooks | `pages/+onPageTransitionStart.ts`, `pages/+onPageTransitionEnd.ts` | Empty, ready for tracking |
| `CartProvider` context | Wraps all pages | Perfect for cart event hooks |
| `TemplateContext` | Wraps all pages | Perfect for view event hooks |
| Fastify middleware chain | `server/server.ts` | Server-side tracking insertion point |
| Effect-TS service pattern | Throughout backend | Composable tracking service pattern |

---

## 2. The Major Pixel/Tracking Platforms & Their APIs

### A. Meta (Facebook/Instagram) Pixel + Conversions API

**Two channels, used together for redundancy:**

| Channel | Type | How It Works |
|---------|------|-------------|
| **Meta Pixel** (client-side) | JS snippet in `<head>` | Loads `fbevents.js`, calls `fbq('track', 'EventName', {data})` |
| **Conversions API** (server-side) | `POST` to `https://graph.facebook.com/v18.0/{PIXEL_ID}/events` | Send hashed user data + event data from your Fastify/Hono server |

**Requirements:** Pixel ID + Access Token (generated in Meta Events Manager, no app review needed).

**Standard e-commerce events:**

- `PageView` — Every page load
- `ViewContent` — Product page view
- `AddToCart` — Item added to cart
- `InitiateCheckout` — Checkout process started
- `AddPaymentInfo` — Payment info submitted
- `Purchase` — Order completed (most important for ROAS tracking)
- `Search` — Search performed
- `Lead` — Lead form submitted
- `CompleteRegistration` — Account created

**Key advantage of server-side:** Not blocked by ad-blockers, more reliable attribution, can send events up to 72 hours after they happen.

**Deduplication:** Both client and server send the same `event_id`, Meta deduplicates automatically.

**Meta Pixel base code reference:**

```html
<!-- Facebook Pixel Code -->
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '{your-pixel-id-goes-here}');
  fbq('track', 'PageView');
</script>
<noscript>
  <img height="1" width="1" style="display:none"
       src="https://www.facebook.com/tr?id={your-pixel-id-goes-here}&ev=PageView&noscript=1"/>
</noscript>
<!-- End Facebook Pixel Code -->
```

**Server-side Conversions API example:**

```typescript
// POST https://graph.facebook.com/v18.0/{PIXEL_ID}/events
{
  "data": [{
    "event_name": "Purchase",
    "event_time": 1699000000,
    "event_id": "unique-event-id-for-dedup",
    "event_source_url": "https://yourstore.com/checkout/complete",
    "action_source": "website",
    "user_data": {
      "em": ["SHA256-hashed-email"],
      "ph": ["SHA256-hashed-phone"],
      "client_ip_address": "1.2.3.4",
      "client_user_agent": "Mozilla/5.0 ...",
      "fbc": "fb.1.1234567890.AbCdEfG",  // _fbc cookie
      "fbp": "fb.1.1234567890.1234567890" // _fbp cookie
    },
    "custom_data": {
      "currency": "USD",
      "value": 142.52,
      "content_ids": ["SKU_001", "SKU_002"],
      "content_type": "product",
      "num_items": 2
    }
  }],
  "access_token": "YOUR_ACCESS_TOKEN"
}
```

---

### B. Google Analytics 4 (GA4) + Measurement Protocol

**Two channels:**

| Channel | Type | How It Works |
|---------|------|-------------|
| **gtag.js** (client-side) | JS snippet | Uses `gtag('event', 'event_name', {params})` |
| **Measurement Protocol** (server-side) | `POST` to `https://www.google-analytics.com/mp/collect` | Send `client_id` + events as JSON |

**Requirements:** GA4 Measurement ID (`G-XXXXXXX`) + API Secret (generated in GA4 Admin).

**Standard e-commerce events:**

- `view_item_list` — Category/collection page viewed
- `select_item` — Product clicked from a list
- `view_item` — Product detail page viewed
- `add_to_cart` — Item added to cart
- `remove_from_cart` — Item removed from cart
- `view_cart` — Cart page viewed
- `begin_checkout` — Checkout initiated
- `add_shipping_info` — Shipping info submitted
- `add_payment_info` — Payment info submitted
- `purchase` — Order completed
- `refund` — Order refunded
- `view_promotion` — Promo banner seen
- `select_promotion` — Promo banner clicked

**Key insight:** Measurement Protocol is designed to **augment** gtag, not replace it. You need the gtag cookie (`client_id`) to join server events with the browser session.

**Client-side example:**

```javascript
gtag("event", "purchase", {
  transaction_id: "T_12345",
  value: 72.05,
  tax: 3.60,
  shipping: 5.99,
  currency: "USD",
  coupon: "SUMMER_SALE",
  items: [{
    item_id: "SKU_12345",
    item_name: "Stan and Friends Tee",
    item_brand: "Google",
    item_category: "Apparel",
    price: 10.01,
    quantity: 3
  }]
});
```

**Server-side Measurement Protocol example:**

```typescript
// POST https://www.google-analytics.com/mp/collect?measurement_id=G-XXXXXX&api_secret=YOUR_SECRET
{
  "client_id": "client_id_from_gtag_cookie",
  "events": [{
    "name": "purchase",
    "params": {
      "transaction_id": "T_12345",
      "value": 72.05,
      "currency": "USD",
      "items": [{ "item_id": "SKU_12345", "quantity": 3 }]
    }
  }]
}
```

---

### C. TikTok Pixel + Events API 2.0

**Two channels:**

| Channel | Type | Endpoint |
|---------|------|----------|
| **TikTok Pixel** (client-side) | JS snippet | Loads TikTok tracking script |
| **Events API 2.0** (server-side) | `POST` to `https://business-api.tiktok.com/open_api/v1.3/event/track/` | Send hashed PII + event data |

**Requirements:** Pixel Code + Access Token (from TikTok Ads Manager).

**Standard web events:**

- `ViewContent` — Product page viewed
- `ClickButton` — CTA button clicked
- `Search` — Search performed
- `AddToWishlist` — Wishlist action
- `AddToCart` — Cart addition
- `InitiateCheckout` — Checkout started
- `AddPaymentInfo` — Payment info added
- `CompletePayment` — Purchase completed
- `PlaceAnOrder` — Order placed
- `Contact` — Contact form submitted
- `SubmitForm` — Form submission
- `Subscribe` — Newsletter/subscription
- `CompleteRegistration` — Account created

**Special sauce:** TikTok uses `_ttp` cookie and `ttclid` (click ID from ad URLs) for matching. Recommends sending both `email` + `phone` SHA-256 hashed for every event.

**Server-side example:**

```bash
curl --location --request POST \
  'https://business-api.tiktok.com/open_api/v1.3/event/track/' \
  --header 'Access-Token: {{Access-Token}}' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "event_source": "web",
    "event_source_id": "{{PIXEL-CODE}}",
    "data": [{
      "event": "Purchase",
      "event_time": 1687758765,
      "event_id": "12345",
      "user": {
        "external_id": "user_12345678",
        "phone": "SHA256-hashed-phone",
        "email": "SHA256-hashed-email",
        "ip": "123.456.789.1",
        "user_agent": "Mozilla/5.0 ...",
        "locale": "en_US"
      },
      "properties": {
        "currency": "USD",
        "value": 200.0,
        "content_type": "product",
        "contents": [{
          "price": 100.0,
          "quantity": 2,
          "content_id": "12345",
          "content_name": "Product Name",
          "content_category": "Category",
          "brand": "Brand Name"
        }]
      }
    }]
  }'
```

---

### D. Snapchat Pixel + Conversions API

**Endpoint:** `POST https://tr.snapchat.com/v2/conversion` (V3 now available at `/v3/{ID}/events`)

**Requirements:** Pixel ID + Long-lived token (never expires, generated in Business Manager).

**Events:**

- `PURCHASE`, `SAVE`, `START_CHECKOUT`, `ADD_CART`, `VIEW_CONTENT`
- `ADD_BILLING`, `SIGN_UP`, `SEARCH`, `PAGE_VIEW`, `SUBSCRIBE`
- `AD_CLICK`, `AD_VIEW`, `COMPLETE_TUTORIAL`, `LEVEL_COMPLETE`
- `INVITE`, `LOGIN`, `SHARE`, `RESERVE`, `ACHIEVEMENT_UNLOCKED`
- `ADD_TO_WISHLIST`, `SPENT_CREDITS`, `RATE`, `START_TRIAL`, `LIST_VIEW`
- `CUSTOM_EVENT_1` through `CUSTOM_EVENT_5`

**Auth options:**
- Static long-lived tokens (recommended for direct integrations, no expiry, no OAuth)
- OAuth2 flow (for third-party integrations)

**Rate limits:** 1000 QPS with long-lived token, up to 2000 events per batch = 2M events/sec.

**Deduplication:** Uses `client_dedup_id` (48h window) and `transaction_id` (30-day window for purchases).

**Required matching parameters (at least one):**
- `hashed_email`
- `hashed_phone_number`
- `hashed_ip_address` + `user_agent`
- `hashed_mobile_ad_id` (for app advertisers)

**Server-side example:**

```json
{
  "pixel_id": "67d34640-b7a4-42a8-b821-6434d70f08a4",
  "timestamp": "1642815764",
  "event_type": "PURCHASE",
  "event_conversion_type": "WEB",
  "event_tag": "backtoschool",
  "price": "43",
  "currency": "usd",
  "page_url": "https://www.example.com/products/bikes/",
  "item_category": "bikes",
  "item_ids": "sam001",
  "hashed_email": "SHA256-hashed-email",
  "hashed_phone_number": "SHA256-hashed-phone",
  "user_agent": "Mozilla/5.0 ...",
  "hashed_ip_address": "SHA256-hashed-ip"
}
```

---

### E. Pinterest Tag + Conversions API

**Client-side:** Pinterest Tag JS snippet with `pintrk('track', 'event', {data})`.

**Server-side:** `POST https://api.pinterest.com/v5/ad_accounts/{ad_account_id}/events` with hashed user data.

**Events:**

- `pagevisit` — Page viewed
- `viewcategory` — Category page viewed
- `search` — Search performed
- `addtocart` — Cart addition
- `checkout` — Purchase completed
- `watchvideo` — Video watched
- `signup` — Account created
- `lead` — Lead generated
- `custom` — Custom event

**Additional features:**
- Enhanced Match (sending hashed email/phone for better attribution)
- Automatic Enhanced Match (auto-detects form fields on the page)
- Event Quality Score (Pinterest rates your integration quality)

---

## 3. How Shopify Does It (The Benchmark)

Shopify's Web Pixels API is the gold standard to study:

### Architecture

1. **Sandboxed execution:** Pixels run in an iframe sandbox (strict or lax) — isolated from the main storefront code
2. **Standard events bus:** `analytics.subscribe('event_name', callback)` — the storefront emits events, pixels listen
3. **Two pixel types:**
   - **App Pixels** — Created by developers via GraphQL Admin API + `@shopify/web-pixels-extension` package
   - **Custom Pixels** — Created by merchants, code pasted directly in admin UI (simplified API, no `register()` boilerplate)
4. **Standard API properties:**
   - `analytics` — Access to Shopify's customer event API
   - `browser` — Access to browser methods (cookie, localStorage, sessionStorage) that execute in the top frame
   - `init` — Snapshot of page context at render time (cart, customer data)
   - `settings` — JSON settings from the GraphQL Admin API (app pixels only)

### Standard Events List

| Event | Description |
|-------|-------------|
| `page_viewed` | Customer visited a page |
| `product_viewed` | Customer visited a product details page |
| `product_added_to_cart` | Customer added a product to their cart |
| `product_removed_from_cart` | Customer removed a product from their cart |
| `cart_viewed` | Customer visited the cart page |
| `checkout_started` | Customer started checkout |
| `checkout_address_info_submitted` | Customer submitted mailing address |
| `checkout_contact_info_submitted` | Customer submitted a checkout form |
| `checkout_shipping_info_submitted` | Customer chose a shipping rate |
| `payment_info_submitted` | Customer submitted payment information |
| `checkout_completed` | Customer completed a purchase |
| `collection_viewed` | Customer visited a product collection page |
| `search_submitted` | Customer performed a search |
| `alert_displayed` | User encountered an alert message |
| `ui_extension_errored` | An extension failed to render |

**Additional subscription groups:**
- `all_events` — Subscribe to everything
- `all_standard_events` — All standard events
- `all_custom_events` — All custom events
- `all_dom_events` — All DOM-level events

### Custom Events
Merchants can `publish()` their own events, and pixels can `subscribe()` to them.

### What Makes Shopify Special

- The **event bus abstraction** decouples storefront code from tracking code
- One `product_added_to_cart` event gets automatically fanned out to Facebook, Google, TikTok, etc.
- The store owner doesn't touch code to add/remove pixels
- Consent management is built into the pixel system
- Privacy controls per pixel (`analytics`, `marketing`, `custom` categories)

---

## 4. How to One-Up Shopify

Because you own the entire stack (Fastify server, tRPC, database, React frontend), you can do things Shopify literally cannot:

### Edge #1: Server-Side-First Architecture (Hybrid Pixel System)

Shopify's pixels are primarily client-side with optional server-side. You can flip this:

| Feature | Shopify | Your System |
|---------|---------|-------------|
| Client-side tracking | Primary | Secondary (for real-time UX) |
| Server-side tracking | Optional add-on | **Primary** — events fire from tRPC procedures |
| Ad-blocker resilience | Partial (custom pixels get blocked) | **Full** — server events bypass ad-blockers entirely |
| Data accuracy | ~70-85% (cookie/blocker losses) | **~95-100%** for conversion events |

**How:** Every tRPC mutation (`order.create`, `cart.add`, `product.view` via SSR data loaders) can emit a server-side event to Meta/Google/TikTok simultaneously. The client pixel becomes a **fallback** for real-time signals, not the source of truth.

### Edge #2: Unified Event Store (First-Party Data Lake)

Instead of sending events only to third parties, **store every event in your own database first:**

```sql
-- Proposed tracking_event table
CREATE TABLE tracking_event (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES "user"(id),
  event_name TEXT NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}',
  page_url TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  user_agent TEXT,
  ip_hash TEXT,
  device_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Pixel delivery status
  meta_sent BOOLEAN DEFAULT FALSE,
  meta_event_id TEXT,
  google_sent BOOLEAN DEFAULT FALSE,
  tiktok_sent BOOLEAN DEFAULT FALSE,
  snap_sent BOOLEAN DEFAULT FALSE,
  pinterest_sent BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_tracking_event_session ON tracking_event(session_id);
CREATE INDEX idx_tracking_event_user ON tracking_event(user_id);
CREATE INDEX idx_tracking_event_name ON tracking_event(event_name);
CREATE INDEX idx_tracking_event_created ON tracking_event(created_at);
```

This gives you:

- **Your own analytics dashboard** that doesn't depend on Meta/Google
- **Attribution modeling you control** — not Meta's black box
- **Retargeting audience building** from first-party data
- **Funnel analysis** (homepage → product → cart → checkout → purchase) computed from your own data
- **A/B test correlation** — connect template choices to conversion rates (your `template_analytics` table, but actually working)

### Edge #3: Real-Time Event Bus (Like Shopify, But Better)

Create a client-side event bus that:

1. The storefront emits standardized events
2. Each connected pixel adapter consumes them
3. The bus also sends events to your server via a lightweight beacon/`fetch` endpoint
4. Your server fans out to all Conversions APIs

```
User clicks "Add to Cart"
   → CartProvider emits { event: 'add_to_cart', product, quantity, value }
      → MetaPixelAdapter:   fbq('track', 'AddToCart', ...)
      → GoogleAdapter:      gtag('event', 'add_to_cart', ...)
      → TikTokAdapter:      ttq.track('AddToCart', ...)
      → BeaconAdapter:      POST /api/track → server fans out to all Conversions APIs
      → LocalAdapter:       stores in tracking_event table
```

### Edge #4: Pixel Management Dashboard

In your admin dashboard (`/dashboard/admin/`), add a **"Pixels & Tracking"** section where the merchant can:

1. **Connect platforms** by pasting their Pixel ID + Access Token
2. **See which events** are being tracked and their delivery status
3. **Test events** (all platforms have test/validate endpoints)
4. **Manage consent** — toggle which pixel categories need consent
5. **View unified analytics** — your own funnel dashboard + per-platform delivery stats
6. **Custom event builder** — define custom events without code (e.g., "Track when someone scrolls past the hero section")

Shopify requires app installations or code for each pixel. You'd have a **unified native UI**.

### Edge #5: Smart Attribution & Insights

Since you own the data:

- **Multi-touch attribution** — "This customer saw a TikTok ad, then came back via Google, then purchased" — you track the full journey, not just last-click
- **Template performance correlation** — "The Editorial landing template converts 23% better than Classic for mobile users from Instagram ads"
- **Promo code tracking** — correlate promo code usage with traffic sources
- **Heatmap-ready events** — track scroll depth, time-on-section, click coordinates (stuff Shopify doesn't natively do)
- **Customer lifetime value by channel** — "Customers from Meta ads have 2.3x higher LTV than those from TikTok"

---

## 5. Concrete Implementation Approaches

### Approach A: "Quick Win" — Script Injection Model

**Effort:** Low | **Power:** Medium

The simplest path: let the merchant paste pixel scripts into `<head>` via the dashboard (like WordPress does). Store scripts in a `pixel_scripts` DB table, inject them in `pages/+Head.tsx`.

**Pros:**
- Works immediately with any platform
- No API integration needed
- Merchant brings their own pixel code

**Cons:**
- Client-side only
- No server-side events
- No unified tracking
- No ad-blocker resilience
- No first-party data ownership

### Approach B: "Event Bus + Client Adapters" — Shopify Parity

**Effort:** Medium | **Power:** High

Build a client-side `TrackingContext` that wraps the app (like `CartProvider`). Define standard events. Build adapters for Meta, Google, TikTok, Snap, Pinterest. Store pixel configs in DB. Merchant manages via dashboard.

**Pros:**
- Clean architecture, platform-agnostic
- Merchant-friendly dashboard
- Standard event taxonomy
- Easy to add new platforms

**Cons:**
- Still client-side only
- Still vulnerable to ad-blockers
- No server-side conversion reliability

### Approach C: "Hybrid Server+Client Bus" — Shopify+ (RECOMMENDED)

**Effort:** High | **Power:** Maximum

Everything in Approach B, PLUS:

- A `POST /api/track` endpoint that receives events from the client beacon
- Server-side Conversions API integrations for Meta, Google, TikTok, Snap, Pinterest
- A `tracking_event` table for first-party analytics
- Server-side event emission from tRPC procedures (order creation, etc.)
- Deduplication between client and server events using shared `event_id`
- A unified analytics dashboard

**Pros:**
- Maximum data accuracy
- Ad-blocker proof for conversions
- First-party data ownership
- Unique competitive edge
- Can show merchants their own analytics without third-party dependency

**Cons:**
- Significant development effort
- Need to maintain API integrations as platforms update
- More complex testing/debugging

---

## 6. Platform API Summary Table

| Platform | Client Pixel | Server API | Auth | Free? | Node.js SDK |
|----------|-------------|------------|------|-------|-------------|
| **Meta** | `fbevents.js` + `fbq()` | Graph API `/events` | Pixel ID + System User Token | Yes | `facebook-nodejs-business-sdk` |
| **Google GA4** | `gtag.js` | Measurement Protocol | Measurement ID + API Secret | Yes | None official (simple HTTP POST) |
| **TikTok** | TikTok Pixel JS | Events API 2.0 | Pixel Code + Access Token | Yes | None official (simple HTTP POST) |
| **Snapchat** | Snap Pixel JS | CAPI v2/v3 | Pixel ID + Long-lived Token | Yes | Business SDKs (Go, Java, PHP, Python, Ruby — no JS) |
| **Pinterest** | Pinterest Tag JS | Conversions API v5 | Ad Account ID + Access Token | Yes | None official (simple HTTP POST) |

> **Note:** All of these APIs are **free to use** — no per-event costs. The authentication is straightforward (generate a token in their respective ad managers). For platforms without official Node.js SDKs, integration is just an HTTP POST with the right headers and JSON body.

---

## 7. Your Existing Hooks to Leverage

These are the exact insertion points in the codebase where tracking would plug in:

| Hook Point | Where | What It Enables |
|-----------|-------|----------------|
| `+onPageTransitionEnd.ts` | `pages/+onPageTransitionEnd.ts` | `page_viewed` on every SPA navigation |
| `+onPageTransitionStart.ts` | `pages/+onPageTransitionStart.ts` | Pre-navigation tracking (time-on-page calc) |
| `CartProvider` actions | `frontend/contexts/` | `add_to_cart`, `remove_from_cart`, `view_cart` |
| tRPC `order.create` | `backend/orders/` | Server-side `purchase` event (most important!) |
| tRPC `auth.register` | `backend/auth/` | `complete_registration` |
| Homepage SSR data loader | `pages/index/+data.ts` | `view_item_list` for featured products |
| Product page mount | Product page template | `view_item` / `view_content` |
| Search page | `pages/` search routes | `search` event |
| Checkout page flow | `pages/checkout/` | `begin_checkout`, `add_shipping_info`, `add_payment_info` |
| `+Head.tsx` | `pages/+Head.tsx` | Inject pixel base scripts dynamically |
| Fastify request hooks | `server/server.ts` | Server-side page view tracking, UTM parameter capture |
| `template_analytics` table | `shared/database/drizzle/schema.ts` | Already exists for template performance data |
| `auth_log` table pattern | `shared/database/drizzle/schema.ts` | Proven event-sourcing pattern to replicate |
| `TemplateContext` | `frontend/contexts/TemplateContext.tsx` | Template view/interaction event emission |
| Effect-TS service pattern | Backend services | Composable, testable tracking service architecture |

---

## 8. Recommendation & Phased Rollout

**Go with Approach C (Hybrid Server+Client Bus)**, implemented in phases:

### Phase 1: Foundation (Event Bus + Context)

- Build the `TrackingContext` provider and client-side event bus
- Define the standardized event taxonomy (mapping your events to each platform's naming)
- Wire up existing page transition hooks (`+onPageTransitionStart/End.ts`) for `page_viewed`
- Wire up `CartProvider` for `add_to_cart`, `remove_from_cart`, `view_cart`
- Create the `pixel_config` DB table (stores platform + pixel ID + access token per platform)
- Create the `tracking_event` DB table for first-party event storage

### Phase 2: Client-Side Adapters (Meta + Google)

- Build Meta Pixel adapter (`fbq()` calls)
- Build Google gtag adapter (`gtag()` calls)
- Dynamic pixel script injection in `+Head.tsx` based on `pixel_config` table
- Dashboard UI at `/dashboard/admin/pixels` for connecting Meta & Google
- Event testing UI (verify events are firing correctly)

### Phase 3: Server-Side Tracking (The Edge)

- Build `POST /api/track` beacon endpoint
- Implement Meta Conversions API integration (server-to-server)
- Implement Google Measurement Protocol integration
- Wire tRPC procedures (`order.create`, `auth.register`) to emit server-side events
- Implement client↔server deduplication using shared `event_id`
- Begin populating `tracking_event` table

### Phase 4: Additional Platforms + Dashboard

- Add TikTok Events API 2.0 adapter (client + server)
- Add Snapchat Conversions API adapter (client + server)
- Add Pinterest Conversions API adapter (client + server)
- Build unified analytics dashboard (funnels, conversion rates, traffic sources)
- Template performance correlation (connect template choices to conversion data)

### Phase 5: Advanced Features (The Differentiators)

- Custom event builder (merchant defines events via UI, no code)
- Scroll depth & time-on-section tracking
- Multi-touch attribution model
- Customer LTV by traffic source
- Consent management framework (GDPR/CCPA compliance)
- UTM parameter auto-capture and session stitching
- Export/API for analytics data

---

## Appendix: Useful Links

### Meta / Facebook
- [Meta Pixel Documentation](https://developers.facebook.com/docs/meta-pixel/get-started)
- [Conversions API Documentation](https://developers.facebook.com/docs/marketing-api/conversions-api)
- [Conversions API Parameters](https://developers.facebook.com/docs/marketing-api/conversions-api/parameters)
- [Event Deduplication](https://developers.facebook.com/docs/marketing-api/conversions-api/deduplicate-pixel-and-server-events)
- [Payload Helper](https://developers.facebook.com/docs/marketing-api/conversions-api/payload-helper)

### Google
- [GA4 Ecommerce Events](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce)
- [Measurement Protocol Overview](https://developers.google.com/analytics/devguides/collection/protocol/ga4)
- [Send Events via Measurement Protocol](https://developers.google.com/analytics/devguides/collection/protocol/ga4/sending-events)
- [Validate Events](https://developers.google.com/analytics/devguides/collection/protocol/ga4/validating-events)

### TikTok
- [Events API 2.0 Get Started](https://business-api.tiktok.com/portal/docs?id=1771100865818625)
- [Events API 2.0 Supported Events](https://ads.tiktok.com/marketing_api/docs?id=1771101186666498)
- [Event Deduplication](https://ads.tiktok.com/marketing_api/docs?id=1771100965992450)
- [Payload Helper for Web](https://ads.tiktok.com/marketing_api/docs?id=1771101027431426)

### Snapchat
- [Conversions API V2 Documentation](https://marketingapi.snapchat.com/docs/conversion.html)
- [Conversions API V3 (Latest)](https://docs.snap.com/api/marketing-api/Conversions-API)
- [Business SDKs (Go, Java, PHP, Python, Ruby)](https://github.com/Snapchat)

### Pinterest
- [Pinterest Conversions API](https://developers.pinterest.com/docs/api/v5/conversion_events-create/)
- [Install the Pinterest Tag](https://help.pinterest.com/en/business/article/install-the-pinterest-tag)
- [Getting Started with Conversions API](https://help.pinterest.com/en/business/article/getting-started-with-the-conversions-api)

### Shopify (Reference Architecture)
- [Web Pixels API](https://shopify.dev/docs/api/web-pixels-api)
- [Standard Events](https://shopify.dev/docs/api/web-pixels-api/standard-events)
- [Custom Events](https://shopify.dev/docs/api/web-pixels-api/emitting-data)
- [Pixel Privacy](https://shopify.dev/docs/api/web-pixels-api/pixel-privacy)
