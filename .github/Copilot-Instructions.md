# Lebsy Shop — Copilot Context Prompt

## Project Identity

**Lebsy** is a single-shop e-commerce template I'm building to sell on marketplaces (CodeCanyon, Gumroad, etc.). It's NOT a live store — it's a product that developers/entrepreneurs buy and deploy as their own shop.

**Stack:** React 19 + Vike (SSR) + Tailwind + shadcn/ui | Fastify + tRPC + Drizzle ORM + PostgreSQL

## Architecture — Key Files

### Configuration (source of truth)
- `shared/config/app.ts` → `SINGLE_SHOP_MODE` flag
- `shared/config/store.ts` → `DEFAULT_STORE_ID` (vendor FK workaround)
- `shared/config/branding.ts` → `STORE_NAME`, `STORE_CURRENCY`, `STORE_DESCRIPTION` (env vars)
- `shared/config/payment.ts` → Payment gateway detection (Stripe, Paymob, COD)

### Type Definitions (Zod + TypeScript)
- `shared/types/layout-settings.ts` → LayoutSettings (header + footer CMS)
- `shared/types/homepage-content.ts` → HomepageContent (hero, promo, sections)
- `shared/types/category-content.ts` → CategoryContent (title, desc, hero)
- `shared/types/pixel-tracking.ts` → Pixel platforms, events, tracking types

### Database
- `shared/database/drizzle/schema.ts` → 25+ tables (product, order, category, promoCode, layoutSettings, homepageContent, categoryContent, pixelConfig, storeSettings, template, templateAssignment, etc.)

### Router (ONLY use this one)
- `shared/trpc/router.ts` → PRIMARY router (11 sub-routers: auth, product, order, category, promoCode, homepage, layout, pixelTracking, payment, settings, analytics)
- ⚠️ `backend/router/router.ts` is a DEAD FILE — never import or reference it

### Layout Wrapper
- `layouts/LayoutDefault.tsx` → Root layout: AuthContext → CartProvider → TemplateProvider → LayoutSettingsContext → NavbarModeContext → TrackingProvider → Navbar/EditorialNavbar → {children} → Footer

## Template System

Two systems coexist — ONLY work with V2:
- **V2 (active):** `components/template-system/templateConfig.ts` — ~30 templates across 8 page types
- **V1 (legacy/dead):** `frontend/components/template/templateRegistry.ts` — do not extend

Template selection flow: Admin selects → localStorage stores → TemplateContext reads → page renders selected component.

**V2 Template inventory:**
- Landing (homepage): 4 — Modern, Classic, Editorial, Minimal
- Home: 2 — Featured Products, Modern V2
- Product Page: 6 — Percé, Classic, Editorial, Technical, Minimal, Modern Split
- Category Page: 5 — Grid Classic, Hero Split, Minimal, Showcase, Grid with Filters
- Cart: 2 — Modern, Editorial
- Checkout: 2 — Modern, Editorial
- Search Results: 2-3 — Grid, Minimal, Editorial
- Sorting: 2 — Minimal, Editorial

## Folder Structure

```
shared/          → Config, DB schema, tRPC router, types, email templates, utils
backend/         → Route handlers: analytics, auth, categories, dashboard, file, homepage, layout, orders, payments, pixel-tracking, products, promo-codes, settings
pages/           → Vike page routes (index, featured/brands|men|women|products, cart, checkout, orders, order-confirmation, search, dashboard/*, login, register, etc.)
components/      → globals (Navbar, Footer), template-system (V2 templates), dashboard, shop, ui (shadcn), template (admin), home
frontend/        → contexts (TemplateContext, LayoutSettingsContext, TrackingContext), pixel-adapters, tracking, V1 legacy templates
layouts/         → LayoutDefault.tsx
```

## CMS Pages (Admin Dashboard)

| Route | Purpose | Storage |
|-------|---------|---------|
| `/dashboard/admin/layout-settings` | Header/footer config (logo, nav, announcement, footer links, social) | layoutSettings table (JSONB) |
| `/dashboard/admin/homepage` | Homepage sections (hero, promo, value props, categories, featured, newsletter, CTA, brand statement) | homepageContent table (JSONB) |
| `/dashboard/admin/category-content` | Per-category hero & description | categoryContent table (JSONB) |
| `/dashboard/admin/templates` | Template switcher per page type | ⚠️ localStorage only (DB tables exist but unused) |
| `/dashboard/admin/pixels` | Pixel/tracking config (Meta, GA4, TikTok, Snapchat, Pinterest, Custom) | pixelConfig + tracking tables |
| `/dashboard/admin/analytics` | Real analytics (overview, funnel, events, platform health, top products) | Real DB queries |
| `/dashboard/products` | Product CRUD | product + variants + images tables |
| `/dashboard/categories` | Category CRUD | category table |
| `/dashboard/orders` | Order management | order + orderItem tables |
| `/dashboard/promo-codes` | Promo code CRUD | promoCode tables |
| `/dashboard/settings` | Store settings (only shipping fee currently) | storeSettings table |

## Known Issues to Be Aware Of

1. **`/shop` route** — may or may not exist yet. Was missing (all CMS defaults linked to it). Check if `pages/shop/` exists now.
2. **Hardcoded category routes** — `/featured/men/` and `/featured/women/` may have been replaced with dynamic `/categories/@slug`. Verify.
3. **`footerStyle` field** — exists in `shared/types/layout-settings.ts` Zod schema but is NOT read by any render component. Footer variant is controlled by EditorialChrome wrapper per-template, not by this CMS field.
4. **Template persistence** — localStorage-only. DB tables `template`, `templateAssignment`, `templateAnalytics` exist but are unused.
5. **Newsletter** — UI renders but no subscription backend exists.
6. **V1 template system** — still in codebase at `frontend/components/template/`. Should be removed or clearly deprecated.
7. **Dead files to delete:** `backend/router/router.ts`, `lib/utils/route-helpers.ts` (getVendorUrl), temp files, internal reports.
8. **Vendor remnants:** `showVendor` prop in TopSellingProductsCard, vendor code in `useAnalytics` hook, `getVendorUrl()` helper.

## UX/UI Priority

The templates need visual polish to compete on marketplaces. When working on templates:
- Each template should feel like a distinct, premium design — not a minor color variation
- Focus on spacing, typography hierarchy, hover states, micro-interactions, image treatment
- The "Editorial" variants should feel magazine-quality
- The "Modern" variants should feel clean and conversion-optimized
- Mobile responsiveness is critical — marketplace reviewers test this

## Development Rules

1. Always use the V2 template system (`components/template-system/`)
2. Never import from `backend/router/router.ts` — use `shared/trpc/router.ts`
3. All CMS data flows: Admin UI → tRPC mutation → DB (JSONB) → tRPC query → Context/Props → Component render
4. Use Tailwind + shadcn/ui for all UI work
5. Keep `SINGLE_SHOP_MODE` assumptions — no multi-vendor logic
6. When adding routes, follow Vike conventions: `pages/[route-name]/+Page.tsx`
