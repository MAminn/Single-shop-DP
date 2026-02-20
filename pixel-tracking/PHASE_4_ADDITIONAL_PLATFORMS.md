# Phase 4: Additional Platform Adapters — TikTok, Snapchat, Pinterest

> **Goal:** Extend the adapter system to support TikTok, Snapchat, and Pinterest — both client-side pixels and server-side Conversions APIs.

> **Depends on:** Phase 3 fully complete.

---

## Task 4.1: TikTok Pixel + Events API 2.0

### Files to create:
- `frontend/pixel-adapters/tiktok-pixel-adapter.ts` — Client-side adapter
- `backend/pixel-tracking/server-adapters/tiktok-events-adapter.ts` — Server-side adapter

### Client-side (TikTok Pixel):

1. **`initialize(config)`:**
   - Inject TikTok's `analytics.js` script
   - Call `ttq.load(config.pixelId)`
   - Call `ttq.page()` for initial page view

2. **`trackEvent(event)`:**
   - Map our event names to TikTok's event names:
     | Our Event | TikTok Event |
     |-----------|-------------|
     | `page_viewed` | `ttq.page()` (automatic) |
     | `product_viewed` | `ViewContent` |
     | `added_to_cart` | `AddToCart` |
     | `checkout_started` | `InitiateCheckout` |
     | `payment_info_added` | `AddPaymentInfo` |
     | `purchase_completed` | `CompletePayment` |
     | `search_submitted` | `Search` |
     | `added_to_wishlist` | `AddToWishlist` |
   - Call `ttq.track(eventName, params)` with `event_id` for dedup
   - Parameters: `content_id`, `content_type`, `content_name`, `quantity`, `price`, `value`, `currency`

### Server-side (Events API 2.0):

1. **Endpoint:** `POST https://business-api.tiktok.com/open_api/v1.3/event/track/`
   - Header: `Access-Token: {ACCESS_TOKEN}`
   - Body:
     ```json
     {
       "event_source": "web",
       "event_source_id": "PIXEL_ID",
       "data": [{
         "event": "CompletePayment",
         "event_time": 1700000000,
         "event_id": "uuid-for-dedup",
         "user": {
           "ip": "1.2.3.4",
           "user_agent": "Mozilla/5.0...",
           "ttp": "cookie-value"
         },
         "page": {
           "url": "https://shop.com/product/123",
           "referrer": "https://google.com"
         },
         "properties": {
           "value": 99.99,
           "currency": "USD",
           "content_id": "SKU-001",
           "content_type": "product",
           "contents": [{"content_id": "SKU-001", "quantity": 1, "price": 99.99}]
         }
       }]
     }
     ```

2. **TTP cookie:** TikTok's first-party cookie `_ttp` — extract in beacon endpoint, same as `_fbp` for Meta

3. **Dedup:** `event_id` matches between pixel `ttq.track()` and Events API

### Acceptance criteria:
- [ ] Client pixel fires all standard TikTok events
- [ ] Server Events API 2.0 sends correct payload format
- [ ] `_ttp` cookie extracted and sent server-side
- [ ] `event_id` dedup between client and server
- [ ] Retry with backoff on server failures
- [ ] `npx tsc --noEmit` passes
- [ ] Tests for both adapters

---

## Task 4.2: Snapchat Pixel + Conversions API

### Files to create:
- `frontend/pixel-adapters/snapchat-pixel-adapter.ts` — Client-side adapter
- `backend/pixel-tracking/server-adapters/snapchat-capi-adapter.ts` — Server-side adapter

### Client-side (Snapchat Pixel):

1. **`initialize(config)`:**
   - Inject Snapchat's `scevent.min.js` script
   - Call `snaptr('init', config.pixelId)`
   - Call `snaptr('track', 'PAGE_VIEW')` for initial page view

2. **`trackEvent(event)`:**
   - Event mapping:
     | Our Event | Snapchat Event |
     |-----------|---------------|
     | `page_viewed` | `PAGE_VIEW` |
     | `product_viewed` | `VIEW_CONTENT` |
     | `added_to_cart` | `ADD_CART` |
     | `checkout_started` | `START_CHECKOUT` |
     | `purchase_completed` | `PURCHASE` |
     | `search_submitted` | `SEARCH` |
     | `added_to_wishlist` | `ADD_TO_WISHLIST` |
     | `product_list_viewed` | `LIST_VIEW` |
     | `signed_up` | `SIGN_UP` |
   - Call `snaptr('track', eventName, params)`
   - Parameters: `item_ids`, `price`, `currency`, `number_items`, `search_string`, `transaction_id`

### Server-side (Conversions API):

1. **Endpoint:** `POST https://tr.snapchat.com/v3/{PIXEL_ID}/events`
   - Header: `Authorization: Bearer {ACCESS_TOKEN}`
   - Body:
     ```json
     {
       "data": [{
         "event_name": "PURCHASE",
         "event_time": "2024-01-01T00:00:00Z",
         "event_source_url": "https://shop.com/checkout",
         "event_tag": "purchase_flow",
         "action_source": "WEB",
         "user": {
           "ip_address": "1.2.3.4",
           "user_agent": "Mozilla/5.0...",
           "sc_click_id": "uuid-from-cookie",
           "client_dedup_id": "our-event-id"
         },
         "custom_data": {
           "price": "99.99",
           "currency": "USD",
           "item_ids": ["SKU-001"],
           "number_items": "1",
           "transaction_id": "T-001"
         }
       }]
     }
     ```

2. **Dedup:** `client_dedup_id` matches client pixel event

3. **ScCid cookie:** Snapchat's `_scid` cookie — extract in beacon endpoint

### Acceptance criteria:
- [ ] Client pixel fires all standard Snapchat events
- [ ] Server CAPI sends correct payload format
- [ ] Click ID cookie extracted
- [ ] Dedup via `client_dedup_id`
- [ ] `npx tsc --noEmit` passes
- [ ] Tests for both adapters

---

## Task 4.3: Pinterest Tag + Conversions API

### Files to create:
- `frontend/pixel-adapters/pinterest-tag-adapter.ts` — Client-side adapter
- `backend/pixel-tracking/server-adapters/pinterest-capi-adapter.ts` — Server-side adapter

### Client-side (Pinterest Tag):

1. **`initialize(config)`:**
   - Inject Pinterest's `pintrk.js` script
   - Call `pintrk('load', config.pixelId)`
   - Call `pintrk('page')` for initial page view

2. **`trackEvent(event)`:**
   - Event mapping:
     | Our Event | Pinterest Event |
     |-----------|----------------|
     | `page_viewed` | `pagevisit` |
     | `product_viewed` | `pagevisit` (with product data) |
     | `added_to_cart` | `addtocart` |
     | `checkout_started` | `checkout` |
     | `purchase_completed` | `checkout` (with order data) |
     | `search_submitted` | `search` |
     | `signed_up` | `signup` |
     | `lead_submitted` | `lead` |
   - Call `pintrk('track', eventName, params)`
   - Parameters: `value`, `order_quantity`, `currency`, `line_items[{product_id, product_name, product_price, product_quantity}]`, `search_query`, `order_id`

### Server-side (Conversions API):

1. **Endpoint:** `POST https://api.pinterest.com/v5/ad_accounts/{AD_ACCOUNT_ID}/events`
   - Header: `Authorization: Bearer {ACCESS_TOKEN}`
   - Body:
     ```json
     {
       "data": [{
         "event_name": "checkout",
         "action_source": "web",
         "event_time": 1700000000,
         "event_id": "uuid-for-dedup",
         "event_source_url": "https://shop.com/checkout",
         "user_data": {
           "client_ip_address": "1.2.3.4",
           "client_user_agent": "Mozilla/5.0..."
         },
         "custom_data": {
           "value": "99.99",
           "currency": "USD",
           "content_ids": ["SKU-001"],
           "contents": [{"item_price": "99.99", "quantity": 1}],
           "num_items": 1,
           "order_id": "T-001"
         }
       }]
     }
     ```

2. **Note:** Pinterest requires an `ad_account_id` in addition to the tag ID. We'll need an additional field in `pixel_config` or store it in `accessToken` JSON.

3. **Dedup:** `event_id` matches client tag event

### Schema update needed:
- Add an optional `metadata` JSONB column to `pixel_config` for platform-specific fields like Pinterest's `ad_account_id`
- OR store as `{ accessToken: "...", adAccountId: "..." }` in a JSON config field

### Acceptance criteria:
- [ ] Client tag fires all standard Pinterest events  
- [ ] Server CAPI sends correct payload format
- [ ] `ad_account_id` properly stored and used
- [ ] Dedup via `event_id`
- [ ] `npx tsc --noEmit` passes
- [ ] Tests for both adapters

---

## Task 4.4: Platform Dashboard Enhancements

### Files to modify:
- `components/dashboard/pixels/PixelConfigForm.tsx` — Add TikTok, Snapchat, Pinterest fields
- `components/dashboard/pixels/PixelConfigList.tsx` — Platform icons and status for new platforms

### New form fields per platform:

| Platform | Required Fields |
|----------|----------------|
| TikTok | Pixel ID, Access Token (for Events API) |
| Snapchat | Pixel ID, Access Token (for CAPI) |
| Pinterest | Tag ID, Ad Account ID, Access Token (for CAPI) |

### Platform-specific validation:
- TikTok Pixel ID format: alphanumeric
- Snapchat Pixel ID format: UUID
- Pinterest Tag ID format: numeric

### Acceptance criteria:
- [ ] All 5 platforms available in dropdown
- [ ] Platform-specific form fields appear dynamically
- [ ] Validation per platform format
- [ ] Test button works for all platforms
- [ ] `npx tsc --noEmit` passes

---

## Task 4.5: Unified Event Delivery Dashboard

### Files to create:
- `pages/dashboard/admin/pixels/events/+Page.tsx` — Event delivery log page
- `components/dashboard/pixels/EventDeliveryTable.tsx` — Table showing event delivery status

### Features:
1. **Event log table:**
   - Columns: Timestamp, Event Name, Platform, Status (sent/failed/pending), Response code
   - Filter by: platform, event name, date range, status
   - Pagination

2. **Delivery stats cards:**
   - Total events (24h / 7d / 30d)
   - Success rate per platform
   - Failed deliveries needing attention

3. **Data source:** Query `tracking_event` + `tracking_event_delivery` tables

### Acceptance criteria:
- [ ] Event log table renders with real data
- [ ] Filtering and pagination work
- [ ] Stats cards show accurate counts
- [ ] `npx tsc --noEmit` passes
- [ ] Integration test: render with mock data

---

## Phase 4 Completion Checklist

- [ ] TikTok — client pixel + Events API 2.0 working
- [ ] Snapchat — client pixel + Conversions API working
- [ ] Pinterest — client tag + Conversions API working
- [ ] All 5 platforms configurable in dashboard
- [ ] Platform-specific form validation
- [ ] Unified event delivery log page
- [ ] Delivery stats dashboard
- [ ] All integration tests passing
- [ ] `npx tsc --noEmit` → zero errors
- [ ] Existing system still works (no regression)
