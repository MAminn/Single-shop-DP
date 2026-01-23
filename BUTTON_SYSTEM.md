# Premium Quiet Luxury Button System

## Overview

A comprehensive 3-tier button hierarchy designed for high-end e-commerce with editorial aesthetics. No loud colors, no rounded pills, no heavy shadows—buttons feel like luxury fashion websites.

---

## Design Principles

### Brand Tone

- **Quiet luxury** - confidence through restraint
- **Editorial** - fashion magazine aesthetic
- **Minimal** - clean, purposeful, timeless
- **No playfulness** - no bright blues, gradients, or bouncy animations

### Core Rules

1. ❌ **Never** use bright blues, purples, or gradients
2. ❌ **Never** use box-shadows (no shadow-lg, shadow-xl)
3. ❌ **Never** use rounded-full or rounded-xl
4. ✅ **Always** use rounded-none or rounded-sm (max)
5. ✅ **Always** use stone color palette
6. ✅ **Always** support disabled states with opacity-40

---

## Button Hierarchy

### 1. PRIMARY (Main CTA)

**When to use:**

- Hero section call-to-action
- "Add to Cart" / "Buy Now"
- "Checkout" / "Place Order"
- Key conversion actions
- Newsletter submit

**Visual style:**

```tsx
variant = "primary";
```

**Appearance:**

- Solid black background (`bg-stone-900`)
- White text (`text-stone-50`)
- 1px stone border (`border-stone-900`)
- Sharp edges (`rounded-none`)
- No shadow (`shadow-none`)

**Hover:**

- Background lightens to `stone-800`

**Active:**

- Subtle downward movement (`translate-y-[1px]`)

**Focus:**

- Visible ring (`ring-1 ring-stone-900/40`)

**Example:**

```tsx
<Button variant='primary' size='lg'>
  Add to Cart
</Button>
```

---

### 2. SECONDARY (Supporting CTA)

**When to use:**

- "View Collection" / "Shop Now"
- "Learn More"
- "Continue Shopping"
- Secondary navigation
- "View All Products"

**Visual style:**

```tsx
variant = "secondary";
```

**Appearance:**

- Transparent background (`bg-transparent`)
- Black text (`text-stone-900`)
- 1px stone border (`border-stone-900`)
- Sharp edges (`rounded-none`)
- No shadow

**Hover:**

- **Inverts**: black background (`stone-900`), white text (`stone-50`)

**Active:**

- Subtle downward movement (`translate-y-[1px]`)

**Focus:**

- Visible ring (`ring-1 ring-stone-900/30`)

**Example:**

```tsx
<Button variant='secondary' size='lg'>
  View Collection
</Button>
```

---

### 3. TERTIARY / TEXT (Low Emphasis)

**When to use:**

- "View Details"
- "Remove" / "Delete"
- "Back" / "Cancel"
- Inline text actions
- Subtle navigation links

**Visual style:**

```tsx
variant = "tertiary";
```

**Appearance:**

- No background
- No border
- Stone-700 text (`text-stone-700`)
- No padding constraints

**Hover:**

- Text darkens to `stone-900`
- Thin underline appears (`decoration-1 underline-offset-4`)

**Active:**

- Opacity reduces to 80% (`opacity-80`)

**Focus:**

- Underline visible
- No ring

**Example:**

```tsx
<Button variant='tertiary' size='md'>
  View Details
</Button>
```

---

## Light Variants (Dark Backgrounds)

### PRIMARY-LIGHT

For hero sections with dark overlays or dark backgrounds.

```tsx
variant = "primary-light";
```

**Appearance:**

- White background (`bg-stone-50`)
- Black text (`text-stone-900`)
- White border (`border-stone-50`)

**Hover:**

- Background to pure white (`bg-white`)

**Example:**

```tsx
{
  /* On dark hero section */
}
<Button variant='primary-light' size='lg'>
  Explore Collection
</Button>;
```

---

### SECONDARY-LIGHT

For transparent buttons on dark backgrounds.

```tsx
variant = "secondary-light";
```

**Appearance:**

- Transparent background
- White text (`text-stone-50`)
- White border (`border-stone-50`)

**Hover:**

- **Inverts**: white background, black text

**Example:**

```tsx
{
  /* On dark footer section */
}
<Button variant='secondary-light' size='lg'>
  Get Started
</Button>;
```

---

## Sizes

### Small (`sm`)

```tsx
size = "sm";
```

- Height: `h-9` (36px)
- Padding: `px-6 py-2`
- Font: `text-xs sm:text-sm`

**Use for:** Inline actions, tight spaces, mobile UI

---

### Medium (`md`) - Default

```tsx
size = "md";
```

- Height: `h-11` (44px)
- Padding: `px-8 py-4`
- Font: `text-sm sm:text-base`

**Use for:** Most CTAs, forms, general buttons

---

### Large (`lg`)

```tsx
size = "lg";
```

- Height: `h-14` (56px)
- Padding: `px-10 py-5`
- Font: `text-sm sm:text-base`

**Use for:** Hero CTAs, prominent actions, landing pages

---

## Typography

All buttons use:

- **Font weight**: `font-light` (300)
- **Tracking**: `tracking-wide` (0.025em)
- **Never uppercase** (except microcopy/labels elsewhere)
- Responsive sizing: `text-sm sm:text-base`

---

## Usage Examples

### Hero Section (Dark Background)

```tsx
<section className='bg-stone-900 text-white py-32'>
  <h1 className='text-5xl lg:text-7xl font-light mb-8'>Timeless Elegance</h1>
  <p className='text-base lg:text-lg font-light mb-10'>
    Discover our curated collection
  </p>

  {/* Use light variant on dark background */}
  <Button variant='secondary-light' size='lg'>
    Shop Now
  </Button>
</section>
```

---

### Featured Products Section

```tsx
<section className='py-20 bg-white'>
  <h2 className='text-3xl lg:text-5xl font-light mb-12'>Featured Collection</h2>

  {/* Product grid here */}

  {/* Secondary for view all */}
  <div className='text-center mt-12'>
    <Button variant='secondary' size='lg'>
      View All Products
    </Button>
  </div>
</section>
```

---

### Newsletter Subscription

```tsx
<section className='py-20 bg-white'>
  <h2 className='text-3xl lg:text-5xl font-light mb-6'>Stay Updated</h2>
  <form className='flex gap-4'>
    <input
      type='email'
      placeholder='Enter your email'
      className='flex-1 px-4 py-3 border border-stone-300'
    />
    {/* Primary for submission */}
    <Button type='submit' variant='primary' size='md'>
      Subscribe
    </Button>
  </form>
</section>
```

---

### Product Card Actions

```tsx
<div className='product-card'>
  <img src='...' alt='...' />
  <h3 className='text-xl lg:text-2xl font-normal'>Leather Tote</h3>
  <p className='text-sm text-stone-600'>$280.00</p>

  {/* Primary for add to cart */}
  <Button variant='primary' size='md' className='w-full mt-4'>
    Add to Cart
  </Button>

  {/* Tertiary for details */}
  <Button variant='tertiary' size='sm' className='w-full mt-2'>
    View Details
  </Button>
</div>
```

---

### With Icons

```tsx
import { ShoppingBag, ArrowRight } from "lucide-react";

{/* Icons automatically sized */}
<Button variant="secondary" size="lg">
  View Products
  <ShoppingBag />
</Button>

<Button variant="primary" size="lg">
  Shop Now
  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
</Button>
```

---

### As Link (with `asChild`)

```tsx
import { Link } from "#root/components/utils/Link";

<Button variant='secondary' size='lg' asChild>
  <Link href='/products'>Browse Collection</Link>
</Button>;
```

---

### Disabled State

```tsx
<Button variant='primary' size='md' disabled>
  Out of Stock
</Button>
```

**Appearance when disabled:**

- Opacity: 40%
- Cursor: `not-allowed`
- No hover effects
- Pointer events disabled

---

## Legacy Variants (Compatibility)

The following variants exist for backward compatibility but are **discouraged** for new implementations:

### `outline`

```tsx
variant = "outline";
```

Similar to secondary but with stone-300 border and stone-50 hover.

### `ghost`

```tsx
variant = "ghost";
```

Transparent with stone-100 hover background.

### `link`

```tsx
variant = "link";
```

Text-only with underline on hover (similar to tertiary).

**Use tertiary instead for new code.**

---

## Complete API

```tsx
<Button
  variant="primary" | "secondary" | "tertiary" | "primary-light" | "secondary-light" | "outline" | "ghost" | "link" | "destructive"
  size="sm" | "md" | "lg" | "icon"
  asChild={boolean}
  disabled={boolean}
  type="button" | "submit" | "reset"
  onClick={(e) => void}
  className={string}  // For additional customization
>
  Button Text
</Button>
```

---

## Color Reference

| Element            | Default     | Hover     | Active    | Focus       | Disabled                 |
| ------------------ | ----------- | --------- | --------- | ----------- | ------------------------ |
| **Primary bg**     | stone-900   | stone-800 | stone-800 | stone-900   | stone-900 + opacity-40   |
| **Primary text**   | stone-50    | stone-50  | stone-50  | stone-50    | stone-50 + opacity-40    |
| **Secondary bg**   | transparent | stone-900 | stone-900 | transparent | transparent + opacity-40 |
| **Secondary text** | stone-900   | stone-50  | stone-50  | stone-900   | stone-900 + opacity-40   |
| **Tertiary text**  | stone-700   | stone-900 | stone-900 | stone-900   | stone-700 + opacity-40   |

---

## Migration Guide

### Before (Ad-hoc styles)

```tsx
<Button className='bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-6 rounded-full shadow-lg'>
  Shop Now
</Button>
```

### After (System variant)

```tsx
<Button variant='primary' size='lg'>
  Shop Now
</Button>
```

### Benefits

- ✅ Consistent styling across site
- ✅ Automatic responsive sizing
- ✅ Built-in accessibility (focus states)
- ✅ Proper disabled states
- ✅ Less code duplication
- ✅ Easier to maintain

---

## Implementation Checklist

### Completed ✅

- [x] Button component created with all variants
- [x] Primary, secondary, tertiary hierarchy
- [x] Light variants for dark backgrounds
- [x] Responsive sizing (sm, md, lg)
- [x] Disabled states
- [x] Focus states
- [x] asChild support for links
- [x] Icon support
- [x] All landing templates refactored
- [x] Homepage components refactored
- [x] Search results components refactored

### Remaining (Optional)

- [ ] Dashboard buttons (admin-only, lower priority)
- [ ] Cart page buttons
- [ ] Checkout page buttons
- [ ] Product page buttons
- [ ] Category page buttons

---

## Testing

### Visual QA Checklist

- [ ] Primary buttons look solid black with white text
- [ ] Secondary buttons invert on hover (black bg, white text)
- [ ] Tertiary buttons show underline on hover only
- [ ] Light variants work on dark backgrounds
- [ ] No rounded corners (rounded-none applied)
- [ ] No shadows visible
- [ ] Focus rings visible when tabbing
- [ ] Disabled buttons show opacity-40
- [ ] Icons align properly with text
- [ ] Button text is font-light and tracking-wide

### Functional Testing

- [ ] Click handlers work
- [ ] asChild links navigate correctly
- [ ] Form submit buttons trigger submission
- [ ] Disabled buttons don't respond to clicks
- [ ] Keyboard navigation works (Tab, Enter, Space)
- [ ] Screen readers announce button labels correctly

---

## File Locations

**Button Component:**

```
components/ui/button.tsx
```

**Updated Templates:**

```
components/template-system/landing/LandingTemplateModern.tsx
components/template-system/landing/LandingTemplateEditorial.tsx
components/template-system/landing/LandingTemplateClassic.tsx
components/template-system/landing/LandingTemplateMinimal.tsx
components/template-system/home/HomeFeaturedProducts.tsx
```

---

## Troubleshooting

### Button not styling correctly?

1. Check you're importing from `#root/components/ui/button`
2. Verify variant name is correct (case-sensitive)
3. Ensure no conflicting className overrides
4. Check if using `asChild` correctly with Slot component

### Hover not working?

1. Ensure no parent element blocking pointer events
2. Check if button is disabled
3. Verify no z-index issues
4. Check CSS specificity conflicts

### Icons not sizing?

Icons are automatically sized to `size-4` (16px). Override with:

```tsx
<Button variant='primary'>
  Text
  <Icon className='size-5' /> {/* 20px */}
</Button>
```

---

## Best Practices

### DO ✅

- Use semantic variants based on action hierarchy
- Use light variants on dark backgrounds
- Keep button text concise (2-4 words)
- Use appropriate size for context
- Test focus states for accessibility
- Use asChild for link buttons

### DON'T ❌

- Mix button styles on same page
- Add custom colors (use variants)
- Use multiple primary buttons in same view
- Make tertiary buttons too prominent
- Override rounded-none with rounded corners
- Add shadows manually

---

**Version**: 1.0  
**Last Updated**: January 2026  
**Status**: Production-ready
