# Search Results Templates - Visual Guide

## 📸 Template Comparison

### SearchResultsGrid (Standard)

**Target Audience:** General eCommerce, Multi-vendor Platforms

```
┌─────────────────────────────────────────────────────────────────┐
│ 🔍 Search Results                           [Search Bar...]     │
│ 42 results for "laptop"                                         │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┬──────────────────────────────────────────────────┐
│ Filters      │ Showing 12 of 42 results        Sort: Relevance ▼│
│              ├──────────────────────────────────────────────────┤
│ Categories   │ ┌────────┐ ┌────────┐ ┌────────┐                │
│ - Electronics│ │Product │ │Product │ │Product │                │
│ - Computers  │ │  #1    │ │  #2    │ │  #3    │                │
│              │ │$999    │ │$1299   │ │$799    │                │
│ Price Range  │ └────────┘ └────────┘ └────────┘                │
│ [──────────] │                                                  │
│              │ ┌────────┐ ┌────────┐ ┌────────┐                │
│ Vendors      │ │Product │ │Product │ │Product │                │
│ □ Vendor A   │ │  #4    │ │  #5    │ │  #6    │                │
│ □ Vendor B   │ │$1499   │ │$899    │ │$1099   │                │
│              │ └────────┘ └────────┘ └────────┘                │
│ Availability │                                                  │
│ □ In Stock   │              [← 1 2 3 4 →]                       │
│              │                                                  │
└──────────────┴──────────────────────────────────────────────────┘

CHARACTERISTICS:
• Gray background (#F9FAFB)
• White sidebar (280px, sticky)
• 3-column product grid
• Filter sidebar always visible on desktop
• Blue accent colors
• Medium information density
```

---

### SearchResultsMinimal (Clean)

**Target Audience:** Premium Brands, Minimalist Aesthetics

```

              Search Results
         42 items found for "laptop"

         [──────── Refine your search... ────────]

─────────────────────────────────────────────────────────────────
Viewing 12 of 42               ⇅  Sort: Relevance ▼
─────────────────────────────────────────────────────────────────

  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐
  │Prod  │  │Prod  │  │Prod  │  │Prod  │
  │ #1   │  │ #2   │  │ #3   │  │ #4   │
  │$999  │  │$1299 │  │$799  │  │$1499 │
  └──────┘  └──────┘  └──────┘  └──────┘

  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐
  │Prod  │  │Prod  │  │Prod  │  │Prod  │
  │ #5   │  │ #6   │  │ #7   │  │ #8   │
  │$899  │  │$1099 │  │$1199 │  │$699  │
  └──────┘  └──────┘  └──────┘  └──────┘

─────────────────────────────────────────────────────────────────
              Previous    1  2  3  4    Next
                      Page 1 of 4


CHARACTERISTICS:
• White on white (#FFFFFF)
• No sidebar, full-width content
• 4-column product grid (max-width: 1280px)
• Large, light typography (3xl/4xl headings)
• Border-only separators
• Minimal UI chrome
• Low information density, high elegance
```

---

## 🎯 When to Use Each Template

### Use SearchResultsGrid When:

- Running a general marketplace
- Need to show many filter options
- Users expect traditional eCommerce layout
- Information density is important
- Multiple categories and vendors
- Users familiar with Amazon/eBay style

### Use SearchResultsMinimal When:

- Premium or luxury brand
- Design-forward aesthetic
- Less complex product catalog
- Want to emphasize product imagery
- Target design-conscious customers
- Minimalist brand identity

---

## 📐 Layout Specifications

### SearchResultsGrid

- **Container:** 1200px max-width
- **Sidebar:** 280px fixed width
- **Main Content:** Flexible (calc(100% - 280px - gap))
- **Product Grid:** 3 columns (lg), 2 columns (md), 1 column (sm)
- **Gap:** 24px between products
- **Background:** gray-50 (#F9FAFB)
- **Cards:** White with shadow-sm

### SearchResultsMinimal

- **Container:** 1280px max-width (7xl)
- **No Sidebar:** Full-width layout
- **Product Grid:** 4 columns (xl), 3 columns (lg), 2 columns (sm), 1 column (mobile)
- **Gap:** 32px between products
- **Background:** White (#FFFFFF)
- **Cards:** Borderless, minimal styling

---

## 🔤 Typography Comparison

| Element       | SearchResultsGrid   | SearchResultsMinimal          |
| ------------- | ------------------- | ----------------------------- |
| Main Title    | 2xl, font-bold      | 3xl-4xl, font-light           |
| Subtitle      | base, text-gray-600 | lg, text-gray-600, font-light |
| Toolbar Text  | sm, text-gray-600   | sm, text-gray-500, font-light |
| Product Count | sm, text-gray-600   | sm, text-gray-500, font-light |
| Empty State   | xl, font-semibold   | 2xl, font-light               |

---

## 🎨 Color Usage

### SearchResultsGrid

- Primary: Blue-600 (#2563EB)
- Background: Gray-50 (#F9FAFB)
- Cards: White (#FFFFFF)
- Text: Gray-900, Gray-600
- Borders: Gray-200
- Hover: Blue-700

### SearchResultsMinimal

- Primary: Gray-900 (#111827)
- Background: White (#FFFFFF)
- Cards: White (borderless)
- Text: Gray-900, Gray-600, Gray-500
- Borders: Gray-200 (minimal use)
- Hover: Gray-900 background

---

## 📱 Responsive Breakpoints

### SearchResultsGrid

- **Desktop (lg: 1024px+):**
  - Sidebar visible (280px)
  - 3-column grid
  - Full toolbar
- **Tablet (md: 768px - 1023px):**
  - Sidebar → drawer (toggle button)
  - 2-column grid
  - Compact toolbar
- **Mobile (< 768px):**
  - Drawer only
  - 1-column grid
  - Stacked toolbar

### SearchResultsMinimal

- **Desktop (xl: 1280px+):**
  - 4-column grid
  - Full toolbar
  - Large typography
- **Large (lg: 1024px - 1279px):**
  - 3-column grid
- **Tablet (sm: 640px - 1023px):**
  - 2-column grid
  - Reduced typography
- **Mobile (< 640px):**
  - 1-column grid
  - Compact toolbar
  - Stacked elements

---

## 🎭 Empty State Comparison

### SearchResultsGrid

```
     🔍 (Large icon, gray-300)

     No results found

  We couldn't find any products
      matching "laptop"

     [Clear Search]
```

- Friendly, helpful tone
- Blue button accent
- Centered in white card

### SearchResultsMinimal

```
     🔍 (Extra large icon, gray-200)

     No Results

  We couldn't find anything matching "laptop".
  Try a different search term.

     [Clear Search]
```

- Sophisticated, minimal tone
- Black button border
- Ample whitespace

---

## 🔄 Pagination Styles

### SearchResultsGrid

```
[<]  [1]  [2]  ...  [10]  [>]
     ━━━
  (Current page highlighted in blue)
```

- Button-style pagination
- Blue active state
- Ellipsis for gaps
- Compact spacing

### SearchResultsMinimal

```
Previous    1  •••  4  5  6  •••  10    Next
                   ━━━
         (Current page: black background)
                 Page 5 of 10
```

- Text-style Previous/Next
- Black active state
- Bullet ellipsis
- Page count below
- More whitespace

---

## 💡 Developer Notes

### Both templates share:

- Same props interface (mostly)
- Same sort options
- Same product data structure
- Same loading states
- Same search functionality
- ProductCard component reuse

### Key differences:

- Grid has `onFilterToggle` and `showFilters` props
- Grid has sidebar/drawer architecture
- Minimal has cleaner, larger typography
- Minimal uses 4-column grid vs 3-column
- Different color schemes and spacing

---

**This visual guide helps buyers understand which template fits their brand and use case.**
