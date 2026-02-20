# Phase 2: Client-Side Pixel Adapters — Meta & Google

> **Goal:** Build the adapter pattern for client-side pixels, implement Meta Pixel and Google GA4 gtag adapters, create the dashboard UI for connecting pixels, and dynamically inject pixel scripts.

> **Depends on:** Phase 1 fully complete.

---

## Task 2.1: Pixel Adapter Interface & Registry

**Why:** We need a clean abstraction so adding new platforms is just "implement the interface and register."

### Files to create:
- `frontend/pixel-adapters/types.ts` — Adapter interface
- `frontend/pixel-adapters/registry.ts` — Adapter registry (maps platform → adapter)

### Adapter interface:

```typescript
interface PixelAdapter {
  platform: PixelPlatform;
  
  // Lifecycle
  initialize(config: PixelConfig): void;     // Load the platform's JS SDK
  destroy(): void;                           // Clean up (remove scripts, etc.)
  
  // Event tracking
  trackEvent(event: TrackingEvent): void;    // Translate & fire platform event
  
  // Status
  isLoaded(): boolean;
  isEnabled(): boolean;
}
```

### Registry pattern:

```typescript
class PixelAdapterRegistry {
  private adapters: Map<PixelPlatform, PixelAdapter> = new Map();
  
  register(adapter: PixelAdapter): void;
  unregister(platform: PixelPlatform): void;
  getAdapter(platform: PixelPlatform): PixelAdapter | undefined;
  getAllAdapters(): PixelAdapter[];
  
  // Fan-out: send event to all active adapters
  broadcastEvent(event: TrackingEvent): void;
}
```

### Acceptance criteria:
- [ ] Interface is generic and platform-agnostic
- [ ] Registry supports dynamic add/remove
- [ ] `broadcastEvent` fans out to all enabled adapters
- [ ] `npx tsc --noEmit` passes
- [ ] Test: registry add/remove/broadcast works

---

## Task 2.2: Meta Pixel Adapter (Client-Side)

**Why:** Meta (Facebook/Instagram) is the #1 ad platform for e-commerce. Most merchants will connect this first.

### Files to create:
- `frontend/pixel-adapters/meta-pixel-adapter.ts`

### Implementation:

1. **`initialize(config)`:**
   - Inject the `fbevents.js` script into `<head>` dynamically
   - Call `fbq('init', config.pixelId)`
   - Set `isLoaded = true`

2. **`trackEvent(event)`:**
   - Map `event.eventName` to Meta's event name using the mapping table
   - Construct Meta-specific parameters from `event.ecommerce`
   - Call `fbq('track', metaEventName, metaParams)` for standard events
   - Call `fbq('trackCustom', eventName, params)` for custom events
   - Attach `event.eventId` for server deduplication (Phase 3)

3. **`destroy()`:**
   - Remove injected script tag
   - Clean up `window.fbq`

### Event parameter mapping (Meta-specific):

| Our Field | Meta Parameter |
|-----------|---------------|
| `ecommerce.value` | `value` |
| `ecommerce.currency` | `currency` |
| `ecommerce.items[].itemId` | `content_ids[]` |
| `ecommerce.items[].category` | `content_category` |
| `ecommerce.items[].itemName` | `content_name` |
| `ecommerce.items` | `contents[]` (with `id`, `quantity`) |
| `ecommerce.transactionId` | N/A (Meta doesn't use order ID in pixel, only in Conversions API) |
| `ecommerce.searchQuery` | `search_string` |
| `items.length` or sum of quantities | `num_items` |

### Acceptance criteria:
- [ ] `fbq` calls fire correctly for all standard events
- [ ] Custom events use `trackCustom`
- [ ] Script injection works dynamically (no hardcoded `<script>`)
- [ ] `eventId` attached for dedup
- [ ] `npx tsc --noEmit` passes
- [ ] Test: adapter maps events correctly

---

## Task 2.3: Google GA4 Adapter (Client-Side)

**Why:** Google Analytics is universal — nearly every merchant uses it.

### Files to create:
- `frontend/pixel-adapters/google-ga4-adapter.ts`

### Implementation:

1. **`initialize(config)`:**
   - Inject the `gtag.js` script: `https://www.googletagmanager.com/gtag/js?id={MEASUREMENT_ID}`
   - Initialize: `window.dataLayer = window.dataLayer || []; gtag('js', new Date()); gtag('config', config.pixelId)`
   - Set loaded flag

2. **`trackEvent(event)`:**
   - Map to GA4 event names
   - Transform `ecommerce.items` to GA4's `items[]` format (with `item_id`, `item_name`, `price`, `quantity`, etc.)
   - Call `gtag('event', ga4EventName, ga4Params)`

3. **`destroy()`:**
   - Remove script tags

### GA4 item format:

```typescript
{
  item_id: item.itemId,
  item_name: item.itemName,
  price: item.price,
  quantity: item.quantity,
  item_category: item.category,
  item_brand: item.brand,
  item_variant: item.variant,
}
```

### Acceptance criteria:
- [ ] `gtag` calls fire for all standard ecommerce events
- [ ] Items array formatted correctly for GA4
- [ ] Currency and value sent with revenue events
- [ ] `npx tsc --noEmit` passes
- [ ] Test: adapter maps events correctly

---

## Task 2.4: Wire Adapters to Event Bus

**Why:** Connect the adapter registry to the TrackingContext event bus so events automatically flow to all connected pixels.

### Files to modify:
- `frontend/contexts/TrackingContext.tsx` — Subscribe adapters to the event bus

### Implementation:

1. On mount, fetch pixel configs via tRPC: `pixelTracking.config.list`
2. For each enabled config with `enableClientSide: true`:
   - Instantiate the appropriate adapter
   - Register in the adapter registry
   - Call `adapter.initialize(config)`
3. Subscribe the registry's `broadcastEvent` to the event bus
4. On unmount, destroy all adapters

### Acceptance criteria:
- [ ] Pixel scripts load dynamically based on DB config
- [ ] Events fan out to all active adapters
- [ ] Adding/removing a pixel config reflects without code changes
- [ ] No pixel scripts load if no configs exist
- [ ] `npx tsc --noEmit` passes

---

## Task 2.5: Dashboard UI — Pixel Management

**Why:** The merchant needs a UI to connect their Meta Pixel ID, Google Measurement ID, etc.

### Files to create:
- `pages/dashboard/admin/pixels/+Page.tsx` — Pixel management page
- `pages/dashboard/admin/pixels/+guard.ts` — Admin-only guard (copy from existing)
- `components/dashboard/pixels/PixelConfigForm.tsx` — Add/edit pixel config form
- `components/dashboard/pixels/PixelConfigList.tsx` — List of connected pixels
- `components/dashboard/pixels/PixelTestButton.tsx` — Fire test event button

### Dashboard page features:

1. **List connected pixels** — Card per platform showing:
   - Platform icon & name
   - Pixel ID (partially masked)
   - Enabled/disabled toggle
   - Client-side / Server-side toggles
   - Last event timestamp
   - Edit / Delete buttons

2. **Add new pixel** — Form with:
   - Platform selector (dropdown: Meta, Google GA4, TikTok, Snapchat, Pinterest)
   - Pixel ID input (with placeholder showing format)
   - Access Token input (optional, for server-side)
   - Client-side enable toggle
   - Server-side enable toggle
   - Consent settings

3. **Test pixel** — Button that fires a test `page_viewed` event and shows success/error

### Sidebar integration:
Add "Pixels & Tracking" link to the dashboard sidebar (under Templates or as a new section).

### Acceptance criteria:
- [ ] Page renders at `/dashboard/admin/pixels`
- [ ] CRUD operations work for pixel configs
- [ ] Test button fires a real event to the connected platform
- [ ] Form validates Pixel ID format per platform
- [ ] `npx tsc --noEmit` passes
- [ ] Integration test: full CRUD flow

---

## Task 2.6: Dynamic Script Injection in +Head.tsx

**Why:** Pixel base scripts should load server-side rendered for maximum reliability (not just via React state).

### Files to modify:
- `pages/+Head.tsx` — Conditionally inject pixel scripts based on config
- `pages/+data.ts` or layout data — Fetch pixel configs at SSR time

### Implementation considerations:
- This is an **enhancement** — the client-side adapters (Task 2.4) already inject scripts
- SSR injection ensures scripts load even before React hydrates
- For SSR: fetch pixel configs in Vike's `+data.ts` and pass to `+Head.tsx` via `pageContext`
- Only inject base scripts (init + PageView) — event tracking still happens client-side

### Acceptance criteria:
- [ ] Pixel scripts appear in HTML source on first load (SSR)
- [ ] No duplicate scripts (SSR + client hydration must coordinate)
- [ ] `npx tsc --noEmit` passes

---

## Phase 2 Completion Checklist

- [ ] Adapter interface & registry working
- [ ] Meta Pixel adapter — all standard events mapped & firing
- [ ] Google GA4 adapter — all ecommerce events mapped & firing
- [ ] Event bus → adapter registry wiring complete
- [ ] Dashboard pixel management page at `/dashboard/admin/pixels`
- [ ] CRUD operations for pixel configs via dashboard
- [ ] Test pixel button working
- [ ] Sidebar link added to dashboard
- [ ] Dynamic script injection (SSR) working in `+Head.tsx`
- [ ] All integration tests passing
- [ ] `npx tsc --noEmit` → zero errors
- [ ] Existing system still works (no regression)
