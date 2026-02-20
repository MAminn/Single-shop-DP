# Phase 3: Server-Side Event Relay & Conversions APIs

> **Goal:** Build the server-side event pipeline — beacon endpoint, event persistence, Meta Conversions API, Google Measurement Protocol — with client↔server deduplication.

> **Depends on:** Phase 2 fully complete.

---

## Task 3.1: POST /api/track Beacon Endpoint

**Why:** Client pixels can be blocked by adblockers. A first-party beacon endpoint lets us relay events server-side, guaranteeing 95%+ delivery.

### Files to create:
- `server/routes/track.ts` — Fastify route handler

### Implementation:

1. **Route:** `POST /api/track`
   - Body: `{ events: TrackingEvent[] }`
   - Uses `navigator.sendBeacon()` from client (fires on page unload, guaranteed delivery)
   - Also accepts standard `fetch` POST

2. **Request handling:**
   - Validate request body (Zod schema)
   - Extract server-side context automatically:
     - `ip` from `request.ip` (Fastify)
     - `userAgent` from `request.headers['user-agent']`
     - `referrer` from `request.headers['referer']`
     - `fbp` cookie (Meta's `_fbp` first-party cookie)
     - `fbc` cookie (Meta's `_fbc` click ID cookie)
     - `gclid` from URL params or cookie (Google Click ID)
   - Enrich events with server context

3. **Response:** `204 No Content` (fire-and-forget from client perspective)

4. **Rate limiting:** Basic rate limit per IP (configurable, default 100 events/minute)

### Registration pattern (follow existing Fastify plugin pattern):
```typescript
import fp from 'fastify-plugin';

export default fp(async (fastify) => {
  fastify.post('/api/track', async (request, reply) => {
    // ... handler
    return reply.status(204).send();
  });
});
```

### Acceptance criteria:
- [ ] Endpoint accepts POST with JSON body
- [ ] Server context (IP, UA, cookies) auto-extracted
- [ ] Rate limiting active
- [ ] Returns 204
- [ ] `npx tsc --noEmit` passes
- [ ] Test: endpoint with valid/invalid payloads

---

## Task 3.2: Event Persistence to Database

**Why:** Every tracking event should be logged for analytics, debugging, and retry on API failure.

### Files to create:
- `backend/pixel-tracking/event-logger.ts` — Effect service for persisting events

### Implementation:

1. **On beacon receive:**
   - Insert each event into `tracking_event` table (created in Phase 1)
   - Fields: `eventName`, `eventId`, `sessionId`, `userId`, `pageUrl`, `ecommerceData` (JSONB), `serverContext` (JSONB), `timestamp`

2. **Batch insert** where possible (Drizzle supports `insert().values([...])`)

3. **Follow Effect-TS pattern:**
```typescript
export const logTrackingEvents = (events: TrackingEvent[]) =>
  Effect.gen(function* () {
    const db = yield* query();
    return yield* Effect.tryPromise(() =>
      db.insert(trackingEvent).values(
        events.map(e => ({
          id: uuidv7(),
          eventName: e.eventName,
          eventId: e.eventId,
          sessionId: e.sessionId,
          // ... map all fields
        }))
      )
    );
  });
```

### Acceptance criteria:
- [ ] Events persisted to `tracking_event` table
- [ ] JSONB columns store ecommerce + server context
- [ ] Batch insert works for multiple events
- [ ] `npx tsc --noEmit` passes
- [ ] Test: insert and query back

---

## Task 3.3: Meta Conversions API Adapter (Server-Side)

**Why:** Meta's Conversions API (CAPI) is the server-side counterpart to the pixel. It's immune to ad blockers and increasingly required for accurate attribution.

### Files to create:
- `backend/pixel-tracking/server-adapters/meta-capi-adapter.ts`
- `backend/pixel-tracking/server-adapters/types.ts` — Server adapter interface

### Server adapter interface:
```typescript
interface ServerPixelAdapter {
  platform: PixelPlatform;
  sendEvents(events: EnrichedTrackingEvent[], config: PixelConfig): Effect.Effect<void, AdapterError>;
}

interface EnrichedTrackingEvent extends TrackingEvent {
  serverContext: {
    ip: string;
    userAgent: string;
    fbp?: string;     // _fbp cookie value
    fbc?: string;     // _fbc cookie value (click ID)
    gclid?: string;   // Google click ID
  };
}
```

### Meta CAPI implementation:

1. **Endpoint:** `POST https://graph.facebook.com/v21.0/{PIXEL_ID}/events`
   - Header: `Authorization: Bearer {ACCESS_TOKEN}`
   - Body:
     ```json
     {
       "data": [{
         "event_name": "Purchase",
         "event_time": 1700000000,
         "event_id": "uuid-for-dedup",
         "event_source_url": "https://shop.com/checkout",
         "action_source": "website",
         "user_data": {
           "client_ip_address": "1.2.3.4",
           "client_user_agent": "Mozilla/5.0...",
           "fbp": "_fbp.1.123456.789",
           "fbc": "fb.1.123456.AbCdEf"
         },
         "custom_data": {
           "value": 99.99,
           "currency": "USD",
           "content_ids": ["SKU-001"],
           "contents": [{"id": "SKU-001", "quantity": 1}],
           "content_type": "product",
           "num_items": 1
         }
       }]
     }
     ```

2. **Event name mapping:** Same table as client-side (Phase 1)

3. **Deduplication:** The `event_id` sent here matches the `eventId` sent client-side via `fbq('track', ..., {eventID: ...})` — Meta will deduplicate.

4. **Error handling:**
   - Retry with exponential backoff (max 3 attempts)
   - Log failures to `tracking_event_delivery` table
   - Never throw — events are fire-and-forget

### Acceptance criteria:
- [ ] CAPI call fires with correct payload format
- [ ] `event_id` matches client-side for dedup
- [ ] User data (IP, UA, fbp, fbc) included
- [ ] Retry logic with backoff
- [ ] Failures logged to `tracking_event_delivery` table
- [ ] `npx tsc --noEmit` passes
- [ ] Test: mock API call, verify payload shape

---

## Task 3.4: Google Measurement Protocol Adapter (Server-Side)

**Why:** GA4 Measurement Protocol lets us send events server-side to GA4, complementing the client-side gtag.

### Files to create:
- `backend/pixel-tracking/server-adapters/google-mp-adapter.ts`

### Implementation:

1. **Endpoint:** `POST https://www.google-analytics.com/mp/collect?measurement_id={MID}&api_secret={SECRET}`
   - Body:
     ```json
     {
       "client_id": "session-id-or-ga-client-id",
       "events": [{
         "name": "purchase",
         "params": {
           "transaction_id": "T-001",
           "value": 99.99,
           "currency": "USD",
           "items": [{
             "item_id": "SKU-001",
             "item_name": "Blue Widget",
             "price": 99.99,
             "quantity": 1
           }]
         }
       }]
     }
     ```

2. **API Secret:** Stored in `pixel_config.accessToken` — the admin generates this in GA4 Admin → Data Streams → Measurement Protocol.

3. **Client ID:** Use our `sessionId` or the `_ga` cookie value if available. GA4 uses this to attribute server events to the same user session.

4. **Deduplication:** GA4 doesn't have explicit event_id dedup like Meta. Instead:
   - Only send server-side events for platforms where client-side is DISABLED, OR
   - Use GA4's `non_personalized_ads` parameter to mark server events differently

### Acceptance criteria:
- [ ] Measurement Protocol call fires with correct format
- [ ] Client ID properly resolved (session or cookie)
- [ ] Items array formatted as GA4 expects
- [ ] API secret securely stored in config
- [ ] `npx tsc --noEmit` passes
- [ ] Test: mock API call, verify payload shape

---

## Task 3.5: Server-Side Delivery Pipeline

**Why:** Coordinate beacon receive → persist → fan-out to server adapters in one pipeline.

### Files to create:
- `backend/pixel-tracking/delivery-pipeline.ts` — Orchestrates the flow

### Pipeline flow:

```
Beacon received
  ↓
Validate & enrich (add server context)
  ↓
Persist to tracking_event table
  ↓
For each enabled pixel config with enableServerSide=true:
  ↓
  Instantiate server adapter
  ↓
  Send events
  ↓
  Record delivery status in tracking_event_delivery
```

### Implementation:
```typescript
export const processTrackingBeacon = (
  rawEvents: TrackingEvent[],
  serverContext: ServerContext
) =>
  Effect.gen(function* () {
    // 1. Enrich
    const enriched = enrichEvents(rawEvents, serverContext);
    
    // 2. Persist
    yield* logTrackingEvents(enriched);
    
    // 3. Get active server-side configs
    const configs = yield* getEnabledServerConfigs();
    
    // 4. Fan-out to adapters (parallel)
    yield* Effect.all(
      configs.map(config =>
        sendToAdapter(config, enriched).pipe(
          Effect.tap(result => logDelivery(config, result))
        )
      ),
      { concurrency: 'unbounded' }
    );
  });
```

### Acceptance criteria:
- [ ] Full pipeline: beacon → persist → fan-out → delivery log
- [ ] Server adapters run in parallel
- [ ] Individual adapter failure doesn't block others
- [ ] Delivery results logged
- [ ] `npx tsc --noEmit` passes
- [ ] Integration test: end-to-end pipeline with mocked APIs

---

## Task 3.6: Client-Side Beacon Integration

**Why:** The client event bus needs to also send events to our beacon endpoint for server-side relay.

### Files to modify:
- `frontend/contexts/TrackingContext.tsx` — Add beacon sender alongside adapter broadcast

### Implementation:

1. On each event emitted:
   - **Immediately:** Fan out to client-side adapters (Phase 2)
   - **Batch & send:** Collect events in a buffer (250ms debounce), then `POST /api/track`

2. Use `navigator.sendBeacon()` on `visibilitychange` (page hide/unload) for guaranteed delivery of buffered events.

3. Use regular `fetch` for normal batched sends.

### Buffer strategy:
```typescript
const eventBuffer: TrackingEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout>;

function bufferEvent(event: TrackingEvent) {
  eventBuffer.push(event);
  clearTimeout(flushTimer);
  flushTimer = setTimeout(flushBuffer, 250);
}

function flushBuffer() {
  if (eventBuffer.length === 0) return;
  const batch = [...eventBuffer];
  eventBuffer.length = 0;
  
  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ events: batch }),
    keepalive: true, // ensures delivery even during navigation
  });
}

// Guaranteed flush on page unload
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    navigator.sendBeacon('/api/track', JSON.stringify({ events: eventBuffer }));
    eventBuffer.length = 0;
  }
});
```

### Acceptance criteria:
- [ ] Events buffer and batch-send to beacon
- [ ] `sendBeacon` fires on page hide
- [ ] Client-side + server-side events both fire (dual tracking)
- [ ] `npx tsc --noEmit` passes
- [ ] Test: buffer, flush, sendBeacon integration

---

## Task 3.7: Client↔Server Deduplication

**Why:** When both client pixel AND server API fire for the same event, the platform must not double-count.

### Implementation:

| Platform | Dedup Mechanism |
|----------|----------------|
| **Meta** | `eventID` param in `fbq('track')` matches `event_id` in CAPI call |
| **Google GA4** | Only send server-side if client-side is disabled for that config, OR use separate stream |
| **TikTok** (Phase 4) | `event_id` in pixel matches `event_id` in Events API |
| **Pinterest** (Phase 4) | `event_id` field matches across client/server |
| **Snapchat** (Phase 4) | `event_id` / `client_dedup_id` |

### Key rule:
- Every `TrackingEvent` already has a unique `eventId` (UUIDv7, generated client-side)
- Client adapters attach this ID to their platform calls
- Server adapters attach the same ID to their API calls
- The platform handles dedup using this shared ID

### Acceptance criteria:
- [ ] Same `eventId` used in client pixel call AND server API call
- [ ] Verified via platform documentation that dedup will work
- [ ] `npx tsc --noEmit` passes

---

## Phase 3 Completion Checklist

- [ ] `POST /api/track` beacon endpoint working
- [ ] Events persisted to `tracking_event` table
- [ ] Meta Conversions API adapter sending events
- [ ] Google Measurement Protocol adapter sending events
- [ ] Delivery pipeline: beacon → persist → fan-out
- [ ] Delivery results logged to `tracking_event_delivery`
- [ ] Client-side beacon integration (buffer + sendBeacon)
- [ ] Client↔Server deduplication verified
- [ ] All integration tests passing
- [ ] `npx tsc --noEmit` → zero errors
- [ ] Existing system still works (no regression)
