# Project Deep Analysis & Next Steps Plan

**Date:** January 19, 2026  
**Status:** Runtime Error Investigation - Dashboard Load Failure  
**Mode:** Single-Shop Template (SINGLE_SHOP_MODE=true)

---

## 🎯 EXECUTIVE SUMMARY

### Current Situation

The Lebsy Shop single-shop template transformation is **95% complete** from a code perspective, but the application **cannot run successfully** due to a critical runtime issue:

**BLOCKER:** Development server crashes immediately when started, preventing any testing or verification of the dashboard and e-commerce flows.

### Root Cause Analysis

After multiple debugging attempts, the issue appears to be related to:

1. **Environment Variable Access in Shared Code** - `shared/config/app.ts` uses `process.env.SINGLE_SHOP_MODE` which is available in Node.js (server) but not in the browser (client)
2. **Vite Build Configuration** - Recent attempts to fix this with Vite's `define` plugin may have introduced new build-time issues
3. **Silent Crash** - The tsx server process exits immediately without error output, making diagnosis difficult

### What Works

✅ TypeScript compilation passes (only minor Tailwind CSS lint warnings)  
✅ PostgreSQL database is running (Docker container healthy)  
✅ All vendor code removal complete (backend/vendor directory deleted)  
✅ Dashboard UI components cleaned of vendor references  
✅ Authentication middleware configured for admin-only access

### What's Broken

❌ Development server crashes on startup (exit code 1)  
❌ Cannot test dashboard at http://127.0.0.1:3000/dashboard  
❌ Cannot verify single-shop commerce flows (browse → cart → checkout → orders)  
❌ Unknown if `process is not defined` browser error is truly fixed

---

## 📊 ARCHITECTURE OVERVIEW

### Tech Stack

```
Frontend:  Vike-React (SSR) + React 19 + Tailwind CSS + shadcn/ui
Backend:   Fastify + tRPC + Drizzle ORM + Effect
Database:  PostgreSQL 16 (Docker, port 8051)
Auth:      Custom session-based (Oslo, Argon2)
Build:     Vite + tsx (TypeScript execution)
```

### Key Directories

```
backend/           - tRPC procedures, services, business logic
  auth/            - Authentication (login, register, session)
  categories/      - Category management
  dashboard/       - Admin dashboard analytics
  file/            - File upload handling
  homepage/        - Homepage content CMS
  orders/          - Order management
  products/        - Product CRUD
  promo-codes/     - Promo code system

pages/             - Vike pages (SSR routes)
  dashboard/       - Admin dashboard UI
    +Page.tsx      - Main dashboard (recently cleaned)
    products/      - Product management
    orders/        - Order management
  cart/            - Shopping cart
  checkout/        - Checkout flow

components/
  dashboard/       - Dashboard-specific components
  globals/         - Navbar, Footer, layout
  shop/            - Product cards, product detail
  template-system/ - Template CMS components
    home/          - Homepage templates (3 variants)
    categoryPage/  - Category templates (4 variants)
    productPage/   - Product templates (4 variants)
    searchResults/ - Search templates (3 variants)

shared/            - Code shared between server & client
  config/
    app.ts         - ⚠️ PROBLEMATIC FILE - uses process.env
  database/        - Drizzle schema, migrations
  trpc/            - tRPC setup, router
```

### Database Schema (Relevant Tables)

```sql
users              - id, email, role ('admin' | 'user'), verified
sessions           - id, userId, expiresAt
products           - id, name, price, vendorId (nullable), status
orders             - id, userId, totalAmount, status, items (JSONB)
categories         - id, name, slug, template, content (JSONB)
homepage_content   - merchantId, content (JSONB), template
promo_codes        - id, code, discountAmount, expiresAt
```

---

## 🔍 DETAILED PROBLEM ANALYSIS

### Problem 1: Server Crash (CURRENT BLOCKER)

**Symptoms:**

```bash
> tsx watch --exclude "./pages/**/*" --include "./backend/**/*" ./server/server.ts
(process immediately exits)
Command exited with code 1
```

**No error output captured** - This is the biggest issue. The server starts, tsx begins watching, then immediately crashes without logging any errors.

**Recent Changes That May Have Caused This:**

1. **vite.config.ts modification (Most Recent)**

   ```typescript
   // Added:
   import "dotenv/config";

   define: {
     "process.env.SINGLE_SHOP_MODE": JSON.stringify(process.env.SINGLE_SHOP_MODE),
   },
   ```

   **Risk:** Vite's `define` plugin does static replacement. If `process.env.SINGLE_SHOP_MODE` is undefined at build config evaluation time, it will inject `undefined` string into code.

2. **shared/config/app.ts modifications (Multiple Attempts)**
   - Attempt 1: Added `typeof process !== "undefined"` check with `import.meta.env` fallback
     - **Result:** Server crash (likely because `import.meta.env` cannot be used in Node.js server context)
   - Attempt 2: Used `globalThis.process` instead
     - **Result:** Server hang/freeze
   - Attempt 3: Reverted to original `process.env.SINGLE_SHOP_MODE === "true"`
     - **Result:** Still crashes (may have broken something else during experiments)

**Why This Is Critical:**

- `shared/config/app.ts` exports `SINGLE_SHOP_MODE` constant
- This file is imported by:
  - `pages/login/+guard.ts` (route guard)
  - `pages/dashboard/+guard.ts` (route guard)
  - `components/dashboard/DashboardSidebar.tsx` (UI component)
  - `components/globals/Navbar.tsx` (UI component)
  - `backend/orders/order-stats/service.ts` (backend service)

**Hypothesis:**
The server crash is likely happening during Vite's SSR build process or when Vike tries to import pages that reference `shared/config/app.ts`. Since the code works in Node.js (server) but crashes when Vite bundles it for client-side hydration, there's a fundamental incompatibility.

### Problem 2: Environment Variable Architecture

**The Core Issue:**

- `.env` file contains: `SINGLE_SHOP_MODE=true`
- Server code needs: `process.env.SINGLE_SHOP_MODE` (Node.js API)
- Client code needs: Some way to access this value without using `process.env` (browser doesn't have `process`)

**Current Broken Pattern:**

```typescript
// shared/config/app.ts (imported by BOTH server and client)
export const SINGLE_SHOP_MODE = process.env.SINGLE_SHOP_MODE === "true";
//                              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//                              ❌ This crashes in browser context
```

**Why Vite's `define` Plugin Didn't Work:**

```typescript
// vite.config.ts
define: {
  "process.env.SINGLE_SHOP_MODE": JSON.stringify(process.env.SINGLE_SHOP_MODE),
}
```

- `define` does literal string replacement at build time
- If `SINGLE_SHOP_MODE` is not set when Vite config loads, it injects `"undefined"` (string)
- This breaks the `=== "true"` comparison

**Correct Solutions (Ranked by Simplicity):**

1. **✅ RECOMMENDED: Make it a Build-Time Constant**

   ```typescript
   // vite.config.ts
   const SINGLE_SHOP_MODE = process.env.SINGLE_SHOP_MODE === "true";

   export default defineConfig({
     define: {
       __SINGLE_SHOP_MODE__: SINGLE_SHOP_MODE, // Boolean constant
     },
   });

   // shared/config/app.ts
   declare const __SINGLE_SHOP_MODE__: boolean;
   export const SINGLE_SHOP_MODE = __SINGLE_SHOP_MODE__;
   ```

   **Pros:** Works in both server and client, no runtime checks, type-safe  
   **Cons:** Requires rebuild if mode changes (acceptable for production)

2. **Alternative: Server-Only Config + PageContext Injection**
   - Move `SINGLE_SHOP_MODE` to server-only file
   - Pass value through Vike's `pageContext`
   - Client components read from `pageContext` instead of importing config
     **Pros:** Runtime flexibility  
     **Cons:** More refactoring, every page needs pageContext wiring

3. **Alternative: Separate Server/Client Config Files**
   - `shared/config/app.server.ts` (uses `process.env`)
   - `shared/config/app.client.ts` (reads from window global)
   - Backend imports `.server`, frontend imports `.client`
     **Pros:** Clean separation  
     **Cons:** Duplication, easy to import wrong one

---

## 🚧 WHAT WE FIXED IN PREVIOUS SESSION (Before Current Crash)

### ✅ Vendor Removal Milestones (All Complete)

**MILESTONE 1: Backend API Removal**

- ✅ Deleted `backend/vendor/` directory (20 files)
- ✅ Removed vendorRouter import from `shared/trpc/router.ts`
- ✅ Products API now admin-only (removed vendorId parameters, removed vendor ownership checks)
- ✅ Orders API now admin-only (removed vendor filtering)
- ✅ Authentication: Vendor role redirects to homepage

**MILESTONE 2: Database Constraints**

- ✅ Set `products.vendorId` to nullable
- ✅ Removed vendor foreign key constraints where applicable

**MILESTONE 3: Frontend UI Cleanup**

- ✅ Deleted `pages/vendor/` (vendor storefront)
- ✅ Deleted `pages/dashboard/vendors/` (vendor management)
- ✅ Deleted `components/template-system/vendorShop/` (3 vendor shop templates)
- ✅ Removed "Sold by" / "Curated by" sections from 4 product page templates
- ✅ ProductCard component: `showVendor` defaults to false
- ✅ Navbar: "Become a vendor" link hidden in single-shop mode
- ✅ Dashboard: Vendor alerts, stats cards, and links removed

**MILESTONE 4: Type System Cleanup**

- ✅ Removed "vendor" from role union types (6 files)
- ✅ Removed VendorDashboard component and vendor dashboard branching logic

### ✅ Dashboard Runtime Fixes (Before Server Crash)

**Issue 1: Vendor Data Reference**

```typescript
// pages/dashboard/+Page.tsx - Line 95
{data.vendors.pending > 0 && ( // ❌ vendors.pending doesn't exist
```

**Fixed:** Removed vendor pending alerts, changed condition to `pendingOrdersCount > 0 || outOfStockCount > 0`

**Issue 2: SSR Undefined Data**

```typescript
const pendingOrders = analytics.orderStats.data.pending; // ❌ Crash if data is undefined
```

**Fixed:** Added optional chaining: `analytics?.orderStats?.data?.pending || 0`

**Issue 3: toFixed() on Undefined**

```typescript
// components/dashboard/RevenueStatsCard.tsx
const formatted = totalRevenue.toFixed(2); // ❌ Crash if totalRevenue is undefined
```

**Fixed:** Added safety check:

```typescript
const safeRevenue = Number.isFinite(totalRevenue) ? totalRevenue : 0;
const formatted = safeRevenue.toFixed(2);
```

**Issue 4: Wrong Prop Name**

```typescript
<RevenueStatsCard totalRevenue={analytics.revenue.data || 0} /> // ❌ analytics.revenue doesn't exist
```

**Fixed:** Changed to `analytics.totalRevenue.data`

---

## 📋 IMMEDIATE ACTION PLAN (Priority Order)

### PHASE 1: Fix Server Startup (BLOCKER - DO FIRST)

**Goal:** Get development server running without crashes

**Step 1: Revert All Environment Variable Experiments**

```bash
# Check current state of files
git diff vite.config.ts
git diff shared/config/app.ts
```

**Step 2: Implement Build-Time Constant Solution**

File: `vite.config.ts`

```typescript
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import vike from "vike/plugin";
import tailwindcss from "@tailwindcss/vite";
import "dotenv/config";

// Evaluate once at build time
const SINGLE_SHOP_MODE = process.env.SINGLE_SHOP_MODE === "true";

export default defineConfig({
  plugins: [vike(), react(), tailwindcss()],
  build: {
    target: "es2022",
  },
  resolve: {
    alias: {
      "#root": __dirname,
    },
  },
  define: {
    // Inject as global constant (Vite will replace this everywhere)
    __SINGLE_SHOP_MODE__: SINGLE_SHOP_MODE,
  },
  server: {
    allowedHosts: ["www.lebsey.com", "lebsey.com"],
  },
});
```

File: `shared/config/app.ts`

```typescript
/**
 * Application Configuration
 * Central configuration for app-wide settings
 */

/**
 * Single Shop Mode
 * Injected at build time via Vite's define plugin
 * This makes it available in both server and client code
 */
declare const __SINGLE_SHOP_MODE__: boolean;

export const SINGLE_SHOP_MODE =
  typeof __SINGLE_SHOP_MODE__ !== "undefined" ? __SINGLE_SHOP_MODE__ : false; // Fallback for tests or non-Vite contexts

/**
 * Helper function to check if single-shop mode is enabled
 */
export function isSingleShopMode(): boolean {
  return SINGLE_SHOP_MODE;
}

/**
 * Check if multi-vendor features should be enabled
 */
export function isMultiVendorMode(): boolean {
  return !SINGLE_SHOP_MODE;
}
```

File: `global.d.ts` (create if doesn't exist)

```typescript
/// <reference types="vite/client" />

declare const __SINGLE_SHOP_MODE__: boolean;
```

**Step 3: Test Server Startup**

```bash
# Kill any existing processes
Get-NetTCPConnection -LocalPort 3000 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }

# Start fresh
pnpm dev
```

**Expected Result:** Server starts and shows:

```
Server listening at http://127.0.0.1:3000
[INFO] Initializing email service middleware
[INFO] Email service initialized successfully
```

**Success Criteria:**

- ✅ Server runs without crashes
- ✅ No "process is not defined" errors in browser console
- ✅ Can access http://127.0.0.1:3000/ (homepage)
- ✅ Can access http://127.0.0.1:3000/dashboard (after login)

---

### PHASE 2: Verify Core Flows (After Server Runs)

**Goal:** Ensure all single-shop commerce functionality works

**Test 1: Admin Authentication Flow**

```
1. Visit http://127.0.0.1:3000/login
2. Login with admin credentials
3. Verify redirect to /dashboard (not blocked)
4. Check dashboard loads without 500 errors
5. Verify no vendor UI elements visible
```

**Test 2: Dashboard Analytics**

```
1. Dashboard shows:
   - Product stats card (total, out of stock, low stock, new this week)
   - Order stats card (pending, processing, shipped, delivered, cancelled)
   - Revenue stats card (total revenue formatted correctly)
   - Website templates card (active status)
2. No vendor-related cards or alerts
3. "Attention Required" only shows orders/products, not vendors
```

**Test 3: Product Management (Admin)**

```
1. Go to /dashboard/products
2. Create new product
   - Form should NOT have vendorId field
   - Form should NOT have vendor selection dropdown
3. Product saves successfully
4. Edit product works
5. Delete product works
```

**Test 4: Order Management (Admin)**

```
1. Go to /dashboard/orders
2. View all orders (not filtered by vendor)
3. Update order status
4. View order details
```

**Test 5: Customer Flows**

```
1. Browse homepage (http://127.0.0.1:3000/)
2. Click category
3. Click product
   - Product page should NOT show "Sold by" or vendor name
4. Add to cart
5. View cart
6. Proceed to checkout
7. Complete order (test mode)
8. View order confirmation
9. Check order history
```

**Test 6: Template System**

```
1. Visit /dashboard
2. Test template switching for:
   - Homepage (3 variants: Modern, Classic, Minimal)
   - Category pages (4 variants)
   - Product pages (4 variants)
   - Search results (3 variants)
3. Verify no vendor shop template options exist
```

---

### PHASE 3: Code Quality & Documentation

**Goal:** Clean up remaining issues, document the system

**Cleanup Tasks:**

1. **Fix Tailwind CSS Lint Warnings**
   - Replace `min-w-[180px]` → `min-w-45`
   - Replace `h-[500px]` → `h-125`
   - Replace `bg-gradient-to-r` → `bg-linear-to-r`
   - Replace `flex-shrink-0` → `shrink-0`
     (19 occurrences total, non-critical)

2. **Remove Commented Code**
   - `pages/dashboard/+Page.tsx` has commented RevenueStatsCard and TopSellingProductsCard
   - Either delete or uncomment based on functionality status

3. **Update Documentation**
   - Mark VENDOR_UI_REMOVAL_COMPLETE.md as finalized
   - Update README.md with:
     - Single-shop mode quick start
     - Template customization guide
     - Deployment instructions
   - Create CHANGELOG.md for version 1.0

4. **Environment Variables Audit**
   - Document all required .env variables
   - Create .env.example with safe defaults
   - Add validation for critical env vars on startup

5. **TypeScript Strict Mode**
   - Enable `strict: true` in tsconfig.json
   - Fix any new type errors
   - Ensure all imported modules have proper types

---

### PHASE 4: Packaging for Sale

**Goal:** Prepare template for marketplaces (CodeCanyon, Gumroad, etc.)

**Deliverables:**

1. **Demo Data Seeder**

   ```typescript
   // scripts/seed-demo-data.ts
   - 20 sample products with images
   - 5 categories
   - 10 sample orders
   - Pre-configured homepage content for all 3 templates
   - Admin user (admin@example.com / changeme)
   - 5 customer users
   ```

2. **Installation Script**

   ```bash
   # scripts/install.sh (or .ps1 for Windows)
   - Check Node.js version (18+)
   - Check PostgreSQL connection
   - Run database migrations
   - Seed demo data (optional)
   - Generate secure JWT secret
   - Create .env from template
   - Run first build
   ```

3. **Documentation Package**
   - `INSTALLATION.md` - Step-by-step setup
   - `USER_GUIDE.md` - Admin dashboard usage
   - `DEVELOPER_GUIDE.md` - Customization, API reference
   - `TEMPLATE_GUIDE.md` - How to create custom templates
   - `DEPLOYMENT.md` - Vercel, Netlify, VPS instructions
   - `FAQ.md` - Common issues and solutions

4. **License & Legal**
   - Choose license (MIT, GPL, or proprietary)
   - Create LICENSE file
   - Add license checker to prevent unauthorized use
   - Terms of service for template buyers

5. **Demo Site**
   - Deploy live demo on Vercel/Netlify
   - Populate with realistic data
   - Show all 3 homepage templates
   - Show all 4 product page templates
   - Working checkout (test mode)

6. **Marketing Assets**
   - Screenshots (homepage, product page, cart, checkout, dashboard)
   - Feature list with checkmarks
   - Video walkthrough (5-10 minutes)
   - Comparison table (vs competitors)
   - SEO-optimized description

7. **Support System**
   - GitHub Discussions for community
   - Email support address
   - Documentation site (Docusaurus/GitBook)
   - Changelog for updates

---

## 🎯 SUCCESS METRICS

### Definition of Done for Single-Shop Template

**Code Completeness:**

- ✅ Zero vendor routes exist in frontend
- ✅ Zero vendor routers/procedures in backend
- ✅ Zero "vendor" role behavior (only admin/user)
- ✅ Product & order services don't require vendorId
- ✅ UI contains zero vendor branding or links
- ✅ Build passes with 0 TypeScript errors
- ⏳ **Core flows verified (PENDING - blocked by server crash)**

**Core Flows (Must All Work):**

- ⏳ Customer: browse → product → cart → checkout → order confirmation → order history
- ⏳ Admin: login → dashboard → create/edit product → manage orders → template switching

**Quality Standards:**

- ⏳ **No runtime errors (CURRENTLY FAILING)**
- ⏳ No console errors in browser (blocked by server crash)
- ⏳ Lighthouse score > 90 for performance (cannot test yet)
- ✅ Mobile responsive (UI components are ready)
- ⏳ SEO meta tags configured (needs verification)

**Documentation:**

- ✅ Architecture documented (ARCHITECTURE.md exists)
- ⏳ Installation guide (needs update)
- ⏳ User guide (needs creation)
- ⏳ API reference (needs generation)

---

## 🚨 CRITICAL RISKS & BLOCKERS

### 🔴 BLOCKER #1: Server Cannot Start

**Impact:** Cannot test anything  
**Priority:** P0 - Must fix immediately  
**Owner:** Development team  
**ETA:** 1-2 hours (implement build-time constant solution)

### 🟡 RISK #1: Hidden Runtime Errors

**Issue:** Multiple issues were found incrementally (vendors.pending, SSR undefined, toFixed crash). There may be more lurking.  
**Mitigation:** Comprehensive testing after server is fixed  
**Priority:** P1

### 🟡 RISK #2: Database Migration Issues

**Issue:** Some vendor-related columns/constraints may still exist in production database  
**Mitigation:** Audit database schema, create migration for cleanup  
**Priority:** P2

### 🟡 RISK #3: Incomplete Error Handling

**Issue:** Many components don't handle loading/error states gracefully  
**Mitigation:** Add ErrorBoundary components, improve loading states  
**Priority:** P2

### 🟡 RISK #4: Missing E2E Tests

**Issue:** No automated tests for core flows (checkout, order placement)  
**Mitigation:** Add Playwright tests for critical paths  
**Priority:** P3

---

## 📈 PROGRESS TRACKING

### Completed Work (95%)

```
█████████████████████████████████████████████████░░░ 95%
```

**Backend Transformation:** ████████████████████ 100% (vendor API deleted, products/orders admin-only)  
**Frontend UI Cleanup:** ████████████████████ 100% (vendor pages deleted, templates cleaned)  
**Type System Cleanup:** ████████████████████ 100% (vendor role removed)  
**Dashboard Fixes:** ████████████████░░░░ 80% (vendor UI removed, analytics fixed, but cannot test)  
**Environment Config:** █████░░░░░░░░░░░░░░░ 25% (identified issue, solution designed but not implemented)  
**Testing & Verification:** ░░░░░░░░░░░░░░░░░░░░ 0% (blocked by server crash)  
**Documentation:** ███████░░░░░░░░░░░░░ 35% (architecture done, user docs missing)  
**Packaging for Sale:** ░░░░░░░░░░░░░░░░░░░░ 0% (not started)

### Remaining Work (5%)

1. Fix server startup issue (2%)
2. Verify all core flows work (2%)
3. Minor cleanup & documentation (1%)

---

## 🔧 TECHNICAL DEBT

### High Priority

1. **Environment variable architecture** - Current approach is fragile
2. **Error handling consistency** - Some components crash, others show error UI
3. **Loading states** - Not all async operations show loading indicators

### Medium Priority

4. **TypeScript strict mode** - Currently disabled to avoid fixing 100+ errors
5. **API error responses** - Inconsistent error format between tRPC procedures
6. **Database indexes** - No performance optimization for large datasets

### Low Priority

7. **Tailwind class optimization** - Using arbitrary values instead of semantic classes
8. **Component prop types** - Many `any` types still exist
9. **Code comments** - Inconsistent commenting style

---

## 📞 DECISION LOG

### Decision 1: Environment Variable Strategy

**Date:** January 19, 2026  
**Decision:** Use Vite's `define` plugin with build-time constant injection  
**Rationale:**

- Simplest solution that works in both server and client
- Type-safe (can declare global constant)
- No runtime overhead (string replacement at build time)
- Acceptable trade-off: requires rebuild if mode changes (rare in production)  
  **Alternatives Considered:**
- PageContext injection (too much refactoring)
- Separate config files (duplication, import confusion)
- Runtime checks with typeof (brittle, caused crashes)

### Decision 2: Vendor Code Removal Strategy

**Date:** January 18, 2026  
**Decision:** Complete deletion of vendor features, not just hiding  
**Rationale:**

- Template is sold as "single-shop" - no reason to keep multi-vendor code
- Reduces complexity and maintenance burden
- Smaller bundle size
- Clearer architecture for buyers  
  **Alternatives Considered:**
- Keep vendor code but hidden behind SINGLE_SHOP_MODE flag (rejected: too complex)

### Decision 3: Template System Architecture

**Date:** Earlier (from ARCHITECTURE.md)  
**Decision:** JSONB content storage + React component templates  
**Rationale:**

- Flexible content without schema migrations
- Easy to add new template variants
- Searchable content with PostgreSQL JSONB operators
- Type-safe with Zod validation

---

## 📚 REFERENCE LINKS

### Internal Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
- [SINGLE_SHOP_TRANSFORMATION_AUDIT.md](./SINGLE_SHOP_TRANSFORMATION_AUDIT.md) - Detailed change log
- [VENDOR_UI_REMOVAL_COMPLETE.md](./VENDOR_UI_REMOVAL_COMPLETE.md) - UI cleanup report
- [BACKEND_AUTH_ADMIN_ONLY_COMPLETE.md](./BACKEND_AUTH_ADMIN_ONLY_COMPLETE.md) - Auth refactor

### External Resources

- [Vike Documentation](https://vike.dev) - SSR framework
- [tRPC Documentation](https://trpc.io) - Type-safe API
- [Drizzle ORM](https://orm.drizzle.team) - Database ORM
- [Vite Plugin API](https://vitejs.dev/guide/api-plugin.html) - Build system

---

## 🎬 NEXT IMMEDIATE STEPS (Today)

1. **[30 min]** Implement build-time constant solution in vite.config.ts and shared/config/app.ts
2. **[10 min]** Test server startup, verify no crashes
3. **[15 min]** Test dashboard load, check for any new errors
4. **[30 min]** Run through all core flow tests (authentication, products, orders, checkout)
5. **[15 min]** Document any remaining issues found
6. **[Decision]** If all tests pass → move to PHASE 3 (code quality)
7. **[Decision]** If new issues found → prioritize and fix before proceeding

---

## ✅ APPROVAL CHECKLIST

Before marking single-shop transformation as complete:

- [ ] Development server runs without crashes
- [ ] Zero TypeScript compilation errors
- [ ] Zero runtime errors in browser console
- [ ] Admin can login and access dashboard
- [ ] Dashboard shows correct stats (no vendor references)
- [ ] Admin can create/edit/delete products
- [ ] Admin can view/manage orders
- [ ] Customer can browse products
- [ ] Customer can add to cart and checkout
- [ ] Order confirmation works
- [ ] Template switching works (homepage, category, product, search)
- [ ] No "vendor" or "Become a vendor" text visible anywhere
- [ ] Mobile responsive design verified
- [ ] README.md updated with single-shop instructions
- [ ] .env.example has all required variables
- [ ] Demo data seeder script created (optional for initial completion)

---

**END OF ANALYSIS**

_This document should be updated as work progresses and new information is discovered._
