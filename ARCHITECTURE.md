# Homepage Content Management - System Architecture

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         MERCHANT                                 │
│                    (Future Admin UI)                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Updates Content
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      tRPC API Layer                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  homepage.updateContent({ merchantId, content })         │   │
│  │  - Validates with Zod schema                             │   │
│  │  - Requires authentication (protectedProcedure)          │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Backend Service Layer                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  updateHomepageContent(merchantId, content)              │   │
│  │  - Upserts to database                                   │   │
│  │  - Stores as JSONB                                       │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     PostgreSQL Database                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Table: homepage_content                                 │   │
│  │  ┌────────────┬──────────┬──────────┬────────────────┐   │   │
│  │  │ merchant_id │  content │ created  │   updated     │   │   │
│  │  │   (UUID)    │  (JSONB) │  (DATE)  │    (DATE)     │   │   │
│  │  └────────────┴──────────┴──────────┴────────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Fetches Content
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      tRPC API Layer                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  homepage.getContent({ merchantId })                     │   │
│  │  - Public endpoint (no auth required)                    │   │
│  │  - Returns HomepageContent type                          │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Backend Service Layer                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  getHomepageContent(merchantId)                          │   │
│  │  - Fetches from database                                 │   │
│  │  - Merges with defaults                                  │   │
│  │  - Handles errors gracefully                             │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Fallback Strategy
                             │
      ┌──────────────────────┼──────────────────────┐
      │                      │                      │
      ▼                      ▼                      ▼
┌───────────┐        ┌──────────────┐        ┌──────────────┐
│ Database  │   OR   │  Merge with  │   OR   │   Default    │
│  Content  │        │   Defaults   │        │   Content    │
└───────────┘        └──────────────┘        └──────────────┘
      │                      │                      │
      └──────────────────────┴──────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Frontend Page                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  pages/index/+Page.tsx                                   │   │
│  │  - Fetches homepage content                              │   │
│  │  - Fetches featured products                             │   │
│  │  - Passes to template component                          │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Template Component                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  LandingTemplateModern                                   │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │ Props: { content, featuredProducts }              │  │   │
│  │  │                                                     │  │   │
│  │  │ Renders:                                            │  │   │
│  │  │  - Hero (if enabled)                                │  │   │
│  │  │  - Promo Banner (if enabled)                        │  │   │
│  │  │  - Value Props (if enabled)                         │  │   │
│  │  │  - Featured Products (if enabled)                   │  │   │
│  │  │  - Newsletter (if enabled)                          │  │   │
│  │  │  - Footer CTA (if enabled)                          │  │   │
│  │  │                                                     │  │   │
│  │  │ Layout & Styling: FIXED (not editable)             │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CUSTOMER SEES                               │
│                  Rendered Homepage                               │
│           (with merchant's custom content)                       │
└─────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
Page (pages/index/+Page.tsx)
│
├─ Fetches Data
│  ├─ trpc.homepage.getContent() → HomepageContent
│  └─ trpc.product.search()     → FeaturedProduct[]
│
└─ Renders Template
   │
   └─ LandingTemplateModern
      │
      ├─ PromoBanner (conditional: content.promoBanner.enabled)
      │  └─ Text, Link
      │
      ├─ Hero Section (conditional: content.hero.enabled)
      │  ├─ Title
      │  ├─ Subtitle
      │  ├─ CTA Button
      │  └─ Background Image
      │
      ├─ Value Props (conditional: content.valueProps.enabled)
      │  └─ For each item:
      │     ├─ Icon (from ValuePropIconType enum)
      │     ├─ Title
      │     └─ Description
      │
      ├─ Featured Products (conditional: content.featuredProducts.enabled)
      │  ├─ Section Title
      │  ├─ Section Subtitle
      │  ├─ Product Grid (from props.featuredProducts)
      │  └─ View All CTA
      │
      ├─ Newsletter (conditional: content.newsletter.enabled)
      │  ├─ Title
      │  ├─ Subtitle
      │  ├─ Email Form
      │  └─ Privacy Text
      │
      └─ Footer CTA (conditional: content.footerCta.enabled)
         ├─ Title
         ├─ Subtitle
         └─ CTA Button
```

## Type Safety Flow

```
┌──────────────────────────────────────────────────────────┐
│  shared/types/homepage-content.ts                        │
│  ┌────────────────────────────────────────────────────┐  │
│  │  export interface HomepageContent {                │  │
│  │    meta: HomepageMetaContent;                      │  │
│  │    hero: HomepageHeroContent;                      │  │
│  │    promoBanner: HomepagePromoBannerContent;        │  │
│  │    categories: HomepageCategoriesContent;          │  │
│  │    featuredProducts: HomepageFeaturedProducts...  │  │
│  │    valueProps: HomepageValuePropsContent;          │  │
│  │    newsletter: HomepageNewsletterContent;          │  │
│  │    footerCta: HomepageFooterCtaContent;            │  │
│  │  }                                                  │  │
│  └────────────────────────────────────────────────────┘  │
└───────────────────────────┬──────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌────────────────┐   ┌──────────────┐
│   Backend    │   │   Database     │   │   Frontend   │
│   Services   │   │    Schema      │   │  Components  │
│              │   │                │   │              │
│  Type: ✅    │   │  Stored as     │   │  Type: ✅    │
│              │   │  JSONB, cast   │   │              │
│              │   │  to type       │   │              │
└──────────────┘   └────────────────┘   └──────────────┘
```

## Section Enabled/Disabled Logic

```
┌─────────────────────────────────────────────────────────┐
│  content.hero.enabled === true                          │
└────────────────────┬────────────────────────────────────┘
                     │
        YES ─────────┴───────── NO
         │                      │
         ▼                      ▼
┌─────────────────┐    ┌────────────────┐
│  Render Hero    │    │  Skip Hero     │
│  Section with:  │    │  Section       │
│  - title        │    │  (not in DOM)  │
│  - subtitle     │    └────────────────┘
│  - ctaText      │
│  - ctaLink      │
│  - bg image     │
└─────────────────┘

Repeat for all 8 sections independently
```

## Default Content Fallback Chain

```
1. Try Database
   └─ SELECT from homepage_content WHERE merchant_id = ?
      │
      ├─ Found? ──────────────────────────────┐
      │                                        │
      └─ Not Found? ──────┐                   │
                          │                   │
2. Try Merge              │                   │
   └─ Partial data? ──────┼───> YES ──────────┤
      │                   │                   │
      └─ Complete? ────────┘                  │
                                              │
3. Use Defaults                               │
   └─ DEFAULT_HOMEPAGE_CONTENT                │
                                              │
                                              ▼
                           ┌─────────────────────────────┐
                           │  Return HomepageContent     │
                           │  (guaranteed complete)      │
                           └─────────────────────────────┘
```

## File Organization

```
lebsy/
│
├─ shared/
│  ├─ types/
│  │  └─ homepage-content.ts          ← Type definitions + defaults
│  │
│  └─ database/
│     ├─ drizzle/
│     │  └─ schema.ts                 ← homepageContent table
│     │
│     └─ migrations/
│        └─ 0001_add_homepage_content.sql  ← Migration script
│
├─ backend/
│  ├─ homepage/
│  │  ├─ get-homepage-content/
│  │  │  └─ index.ts                  ← Fetch logic
│  │  │
│  │  ├─ update-homepage-content/
│  │  │  └─ index.ts                  ← Update logic
│  │  │
│  │  ├─ examples/
│  │  │  └─ update-homepage-examples.ts  ← Usage examples
│  │  │
│  │  └─ trpc.ts                      ← API endpoints
│  │
│  └─ router/
│     └─ router.ts                    ← Register homepage router
│
├─ components/
│  └─ template-system/
│     └─ landing/
│        └─ LandingTemplateModern.tsx  ← Template component
│
├─ pages/
│  └─ index/
│     └─ +Page.tsx                    ← Homepage integration
│
└─ Documentation/
   ├─ HOMEPAGE_CONTENT_MANAGEMENT_V1.md
   ├─ IMPLEMENTATION_SUMMARY.md
   ├─ IMPLEMENTATION_CHECKLIST.md
   ├─ QUICK_START_HOMEPAGE.md
   └─ ARCHITECTURE.md (this file)
```

## Key Design Decisions

### 1. JSONB Storage

**Why**: Flexible schema, single query, easy backup  
**Trade-off**: Type safety at app level, not database level

### 2. Merge with Defaults

**Why**: Handles schema evolution, partial data  
**Trade-off**: Slightly more complex logic

### 3. Public Get, Protected Update

**Why**: Anyone can view, only authenticated can edit  
**Trade-off**: Need auth system for updates

### 4. Enum for Icons

**Why**: Prevents invalid icon names, autocomplete  
**Trade-off**: Adding icons requires code change

### 5. Per-Section Enabled Flags

**Why**: Maximum flexibility, clean UI  
**Trade-off**: More boolean fields to manage

### 6. Content in Props, Not Context

**Why**: Explicit data flow, easier testing  
**Trade-off**: Prop drilling (acceptable for this scale)

---

**Architecture Version**: 1.0  
**Last Updated**: December 13, 2025
