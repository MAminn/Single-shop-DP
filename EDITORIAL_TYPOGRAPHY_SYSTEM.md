# Editorial Typography System

## Brand Tone

- **Quiet luxury**
- Editorial / fashion magazine aesthetic
- Confident, minimal, timeless
- No playful or techy styles

## Font Strategy

- One primary sans-serif (clean, modern)
- No script or decorative fonts
- Font weight contrast replaces color contrast

---

## Typography Scale

### HEADINGS

#### H1 (Hero / Page Title)

```tsx
className =
  "text-5xl lg:text-7xl font-light text-stone-900 leading-[1.05] tracking-tight";
```

- **Mobile**: text-5xl (48px)
- **Desktop**: lg:text-7xl (72px)
- **Weight**: font-light (300)
- **Color**: text-stone-900
- **Leading**: leading-[1.05] (tight)
- **Tracking**: tracking-tight

**Usage**: Primary hero headings, main page titles

---

#### H2 (Section Titles)

```tsx
className =
  "text-3xl lg:text-5xl font-light text-stone-900 leading-[1.15] tracking-tight";
```

- **Mobile**: text-3xl (30px)
- **Desktop**: lg:text-5xl (48px)
- **Weight**: font-light (300)
- **Color**: text-stone-900
- **Leading**: leading-[1.15] (snug)
- **Tracking**: tracking-tight

**Usage**: Major section headings, category titles

---

#### H3 (Sub-sections / Cards)

```tsx
className = "text-xl lg:text-2xl font-normal text-stone-900 leading-snug";
```

- **Mobile**: text-xl (20px)
- **Desktop**: lg:text-2xl (24px)
- **Weight**: font-normal (400)
- **Color**: text-stone-900
- **Leading**: leading-snug (1.375)

**Usage**: Product cards, sub-sections, card headings

---

### BODY TEXT

#### Body Large (Editorial Paragraphs)

```tsx
className =
  "text-base lg:text-lg text-stone-600 font-light leading-relaxed max-w-md";
```

- **Mobile**: text-base (16px)
- **Desktop**: lg:text-lg (18px)
- **Weight**: font-light (300)
- **Color**: text-stone-600
- **Leading**: leading-relaxed (1.625)
- **Max Width**: max-w-md (never exceed 65 characters)

**Usage**: Main body copy, descriptions, editorial content

---

#### Body Small (Supporting Copy)

```tsx
className = "text-sm text-stone-600 font-light leading-relaxed";
```

- **Size**: text-sm (14px)
- **Weight**: font-light (300)
- **Color**: text-stone-600
- **Leading**: leading-relaxed (1.625)

**Usage**: Secondary descriptions, metadata, supporting text

---

### MICROCOPY / UI TEXT

#### Eyebrows / Labels

```tsx
className = "text-[11px] uppercase tracking-[0.25em] font-light text-stone-500";
```

- **Size**: text-[11px] (11px fixed)
- **Transform**: uppercase
- **Tracking**: tracking-[0.25em] (wide letter-spacing)
- **Weight**: font-light (300)
- **Color**: text-stone-500

**Usage**: Category labels, section eyebrows, micro-labels

---

#### Buttons

```tsx
className = "text-sm font-light tracking-wide";
```

- **Size**: text-sm (14px)
- **Weight**: font-light (300)
- **Tracking**: tracking-wide (0.025em)
- **Transform**: NO uppercase allowed

**Usage**: All button text

---

## Button Styles

### Primary Button

```tsx
className =
  "bg-stone-900 hover:bg-stone-800 text-white font-light text-sm tracking-wide px-8 py-6 rounded-none shadow-none transition-all";
```

### Secondary / Outline Button

```tsx
className =
  "border border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-white font-light text-sm tracking-wide px-8 py-6 rounded-none transition-all";
```

### Ghost Button (Hero)

```tsx
className =
  "bg-transparent text-stone-50 hover:bg-stone-50 hover:text-stone-900 font-light text-sm tracking-wide px-10 py-6 border border-stone-50 rounded-none shadow-none transition-all";
```

---

## Color Palette

### Text Colors

- **Headings**: stone-900 (primary) / stone-50 (on dark)
- **Body**: stone-600 / stone-700
- **Microcopy**: stone-500
- **Supporting text**: stone-400
- **Inverted text**: stone-200 / stone-300

### Background Colors

- **Primary**: white / stone-50
- **Elevated**: stone-900 (dark sections)
- **Borders**: stone-200

---

## Design Rules

### ✅ DO

1. Use font-light (300) for most text
2. Use font-normal (400) only for H3
3. Prefer spacing + weight over color for hierarchy
4. Ensure headings breathe (more margin-bottom than margin-top)
5. Constrain body text to max 65 characters width (max-w-md)
6. Use consistent stone color palette
7. Use rounded-none for clean edges
8. Use shadow-none for flat, editorial aesthetic

### ❌ DON'T

1. Never use font-bold for luxury content
2. Never use font-semibold or font-extrabold
3. Never use blue/colored brand accents (no bg-blue-600, etc.)
4. Never use uppercase on buttons
5. Never use rounded corners (except scroll indicators)
6. Never use heavy shadows (shadow-xl, shadow-2xl)
7. Never mix gray- and stone- color scales
8. Never exceed max-w-md for body text

---

## Implementation Checklist

### Landing Templates

- ✅ LandingTemplateModern
- ✅ LandingTemplateEditorial
- ✅ LandingTemplateClassic
- ✅ LandingTemplateMinimal (already correct)

### Search Results

- ✅ SearchResultsGrid
- ✅ SearchResultsMinimal

### Product Components

- 🔄 ProductCard
- 🔄 ProductDetail
- 🔄 Category pages

### Global Components

- 🔄 Buttons
- 🔄 Forms
- 🔄 Navigation

---

## Examples

### Hero Section

```tsx
<section className='py-20 lg:py-32'>
  <h1 className='text-5xl lg:text-7xl font-light text-stone-900 leading-[1.05] tracking-tight mb-8'>
    Welcome to Quiet Luxury
  </h1>
  <p className='text-base lg:text-lg text-stone-600 font-light leading-relaxed max-w-md mx-auto mb-10'>
    Timeless pieces crafted with care. Experience the difference.
  </p>
  <button className='bg-stone-900 hover:bg-stone-800 text-white font-light text-sm tracking-wide px-10 py-6 rounded-none'>
    Explore Collection
  </button>
</section>
```

### Section Title

```tsx
<div className='text-center mb-16'>
  <p className='text-[11px] uppercase tracking-[0.25em] font-light text-stone-500 mb-4'>
    Featured Collection
  </p>
  <h2 className='text-3xl lg:text-5xl font-light text-stone-900 leading-[1.15] tracking-tight mb-6'>
    New Arrivals
  </h2>
  <p className='text-base lg:text-lg text-stone-600 font-light leading-relaxed max-w-md mx-auto'>
    Discover our latest curated selection.
  </p>
</div>
```

### Product Card

```tsx
<div className='group'>
  <img src='...' className='mb-4' />
  <p className='text-[11px] uppercase tracking-[0.25em] font-light text-stone-500 mb-2'>
    Category Name
  </p>
  <h3 className='text-xl lg:text-2xl font-normal text-stone-900 leading-snug mb-2'>
    Product Name
  </h3>
  <p className='text-sm text-stone-600 font-light leading-relaxed'>$120.00</p>
</div>
```

---

## Notes for Developers

- All new components must follow this scale
- When refactoring, search for: `font-bold`, `font-semibold`, `text-blue-`, `bg-blue-`, `shadow-xl`, `rounded-lg`
- Replace `gray-` with `stone-` for warmth
- Test all typography at both mobile and desktop breakpoints
- Ensure readability on both white and dark backgrounds

---

**Version**: 1.0  
**Last Updated**: January 2026  
**Status**: Active implementation in progress
