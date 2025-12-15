# Quick Start - Homepage Content Management

## For Developers

### 1. Run Migration

```bash
# Option 1: Direct PostgreSQL
psql -d lebsy_db -f shared/database/migrations/0001_add_homepage_content.sql

# Option 2: Drizzle Kit
pnpm drizzle-kit push:pg
```

### 2. Use in Frontend

```typescript
import { trpc } from "#root/shared/trpc/client";
import { DEFAULT_HOMEPAGE_CONTENT } from "#root/shared/types/homepage-content";

// Fetch content (falls back to defaults)
const { result } = await trpc.homepage.getContent.query({
  merchantId: "00000000-0000-0000-0000-000000000000",
});

// Render template
<LandingTemplateModern content={result} featuredProducts={products} />;
```

### 3. Update Content (Admin)

```typescript
import type { HomepageContent } from "#root/shared/types/homepage-content";

const newContent: HomepageContent = {
  // Copy from DEFAULT_HOMEPAGE_CONTENT and modify
  ...DEFAULT_HOMEPAGE_CONTENT,
  hero: {
    enabled: true,
    title: "Your Custom Title",
    subtitle: "Your Custom Subtitle",
    ctaText: "Get Started",
    ctaLink: "/signup",
  },
};

await trpc.homepage.updateContent.mutate({
  merchantId: merchantId,
  content: newContent,
});
```

## For Content Editors (Future Admin UI)

When the admin UI is built, you'll be able to:

1. Navigate to **Settings → Homepage**
2. Edit any text field directly
3. Toggle sections on/off
4. Upload hero background image
5. Click **Save** to publish changes

## Content Sections

| Section           | Default State | Description                           |
| ----------------- | ------------- | ------------------------------------- |
| Hero              | Enabled       | Main banner with title, subtitle, CTA |
| Promo Banner      | **Disabled**  | Top announcement bar                  |
| Value Props       | Enabled       | 3-column feature highlights           |
| Featured Products | Enabled       | Product grid with CTA                 |
| Newsletter        | Enabled       | Email subscription form               |
| Footer CTA        | Enabled       | Final conversion section              |

## Value Prop Icons

Choose from:

- `shopping` - Shopping bag
- `shipping` - Delivery truck
- `security` - Shield
- `support` - Headphones
- `quality` - Award badge
- `returns` - Refresh/return

## Tips

✅ **Do**: Customize text, links, and images  
✅ **Do**: Toggle sections on/off as needed  
✅ **Do**: Use clear, action-oriented CTAs

❌ **Don't**: Try to change colors (controlled by template)  
❌ **Don't**: Expect to modify layout (fixed structure)  
❌ **Don't**: Edit code directly (use the schema)

## Default Merchant ID

Currently using: `00000000-0000-0000-0000-000000000000`

This will be replaced with actual merchant IDs when the merchant system is fully integrated.

## Troubleshooting

**Content not showing?**

- Check database connection
- Verify migration ran successfully
- Defaults will load automatically on error

**TypeScript errors?**

- Ensure all required fields are present
- Use `DEFAULT_HOMEPAGE_CONTENT` as template
- Check enum values for icons

**Section not visible?**

- Verify `enabled: true` in section config
- Check browser console for errors
- Confirm section data is valid

## API Reference

### Get Content

```typescript
trpc.homepage.getContent.query({ merchantId: string });
// Returns: { success: true, result: HomepageContent }
```

### Update Content (Protected)

```typescript
trpc.homepage.updateContent.mutate({
  merchantId: string,
  content: HomepageContent,
});
// Returns: { success: true, result: HomepageContent }
```

## Example Files

See `backend/homepage/examples/update-homepage-examples.ts` for complete examples of:

- Updating full homepage
- Updating single section
- Enabling/disabling sections
- Customizing value props
- Adding promo banners

---

**Need Help?** Check `HOMEPAGE_CONTENT_MANAGEMENT_V1.md` for full documentation.
