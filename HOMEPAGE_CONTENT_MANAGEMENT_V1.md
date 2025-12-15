# Homepage Content Management v1

## Overview

This implementation separates **template layout** from **editable content**, allowing merchants to customize their homepage text, images, and links without modifying layout or styling.

## Architecture

### 1. Content Schema (`shared/types/homepage-content.ts`)

Defines strongly-typed content structures for all homepage sections:

- **meta**: Page title and description (SEO)
- **hero**: Main banner with title, subtitle, CTA
- **promoBanner**: Optional promotional banner
- **categories**: Categories section headers
- **featuredProducts**: Product section configuration
- **valueProps**: Key selling points with icons
- **newsletter**: Email subscription section
- **footerCta**: Bottom call-to-action

Each section includes:

- `enabled: boolean` - Toggle section visibility
- Strongly typed fields for content
- No color, spacing, or layout configuration

### 2. Database Model (`shared/database/drizzle/schema.ts`)

```typescript
export const homepageContent = pgTable("homepage_content", {
  id: uuid("id").primaryKey(),
  merchantId: uuid("merchant_id").notNull().unique(),
  content: jsonb("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

Stores content as JSONB for flexibility while maintaining type safety on the application layer.

### 3. Loader Function (`backend/homepage/get-homepage-content/index.ts`)

```typescript
export async function getHomepageContent(
  merchantId: string
): Promise<HomepageContent>;
```

- Fetches content from database by merchantId
- Falls back to `DEFAULT_HOMEPAGE_CONTENT` if not found
- Merges stored content with defaults to ensure all fields exist
- Gracefully handles errors

### 4. tRPC Endpoint (`backend/homepage/trpc.ts`)

```typescript
homepage.getContent({ merchantId: string });
```

Public endpoint for fetching homepage content.

### 5. Updated Template (`components/template-system/landing/LandingTemplateModern.tsx`)

**New Props:**

```typescript
interface LandingTemplateModernProps {
  content: HomepageContent; // All editable content
  featuredProducts?: FeaturedProduct[]; // Dynamic data
  className?: string;
  onCtaClick?: (link: string) => void;
}
```

**Key Changes:**

- No hardcoded text anywhere
- All content comes from `content` prop
- Sections render conditionally based on `enabled` flags
- Additional sections: promoBanner, newsletter, footerCta
- Enhanced value props with 6 icon options

## Usage

### Fetching Homepage Content

```typescript
import { trpc } from "#root/shared/trpc/client";

const result = await trpc.homepage.getContent.query({
  merchantId: "merchant-uuid-here",
});

const content = result.result; // HomepageContent
```

### Rendering the Template

```typescript
import { LandingTemplateModern } from "#root/components/template-system";
import type { HomepageContent } from "#root/shared/types/homepage-content";

<LandingTemplateModern
  content={homepageContent}
  featuredProducts={products}
  onCtaClick={(link) => (window.location.href = link)}
/>;
```

### Default Content

The system provides comprehensive defaults in `DEFAULT_HOMEPAGE_CONTENT`:

- Professional, marketplace-focused copy
- All sections enabled by default (except promoBanner)
- Safe fallback values for all fields

## Sections

### Hero

- Large banner with title, subtitle, CTA button
- Optional background image
- Always visible when enabled

### Promo Banner

- Optional top banner for announcements
- Can include link
- Disabled by default

### Value Props

- 3-column grid of key features
- 6 icon options: shopping, shipping, security, support, quality, returns
- Highlights marketplace benefits

### Featured Products

- Displays product grid
- Configurable title and subtitle
- View all CTA

### Newsletter

- Email subscription form
- Privacy notice
- Disabled by default (enable when ready)

### Footer CTA

- Final conversion opportunity
- Large CTA button
- Disabled by default

## Value Prop Icons

Available `ValuePropIconType` enum values:

- `SHOPPING` - Shopping bag icon
- `SHIPPING` - Truck icon
- `SECURITY` - Shield icon
- `SUPPORT` - Headphones icon
- `QUALITY` - Award icon
- `RETURNS` - Refresh icon

## Migration

Run the migration to create the database table:

```bash
# Apply migration
psql -d your_database -f shared/database/migrations/0001_add_homepage_content.sql
```

Or use Drizzle Kit:

```bash
pnpm drizzle-kit push:pg
```

## Future Enhancements

### Phase 2 (Not in v1)

- Admin UI for editing content
- Image upload for hero backgrounds
- Multi-language support
- A/B testing different content variations
- Analytics tracking per section
- Template preview mode

### Not Planned

- Per-section color customization (violates "no colors per section" rule)
- Layout modifications (layout is fixed)
- Custom CSS (styling controlled by template)

## Design Decisions

### Why JSONB?

- Flexible schema evolution
- Single query to fetch all content
- Type safety enforced at application level
- Easy backup/restore of content

### Why Merchant ID?

- Prepares for multi-tenant architecture
- Each merchant gets their own homepage content
- Currently using placeholder UUID (can be enhanced with real merchant system)

### Why Defaults in Code?

- Type-safe fallbacks
- Instant new merchant setup
- No database required for default experience
- Easy testing and development

### Why Conditional Rendering?

- Merchants can disable unused sections
- Cleaner pages when features not needed
- Progressive disclosure of complexity

## Testing

```typescript
// Test with default content
import { DEFAULT_HOMEPAGE_CONTENT } from "#root/shared/types/homepage-content";

<LandingTemplateModern content={DEFAULT_HOMEPAGE_CONTENT} />;

// Test with custom content
const customContent: HomepageContent = {
  ...DEFAULT_HOMEPAGE_CONTENT,
  hero: {
    enabled: true,
    title: "Custom Title",
    subtitle: "Custom Subtitle",
    ctaText: "Get Started",
    ctaLink: "/signup",
  },
};

<LandingTemplateModern content={customContent} />;
```

## Breaking Changes from Previous Version

- Props structure completely changed
- `hero`, `promoCards`, `featuredProducts` props replaced with `content`
- `onViewAllClick` callback removed (use `onCtaClick` instead)
- All text must come from `content` prop

## Notes

- No legacy template modifications were made
- Existing homepage routing unchanged
- TypeScript strict mode compatible
- All sections respect enabled flags
- Layout and styling remain in template component
