# SINGLE-SHOP TRANSFORMATION AUDIT & EXECUTION PLAN

**Generated:** January 18, 2026  
**Repository:** Single-Shop Template (duplicated from multi-vendor)  
**Status:** 70% Complete - Core transformations done, cleanup needed

---

## A) CHANGELOG SUMMARY: What We Changed

### ✅ Frontend Changes

**Routes Removed:**

- `pages/vendor/` - Entire vendor storefront directory (DELETED)
- `pages/dashboard/vendors/` - Vendor management dashboard (DELETED)

**Template System:**

- `components/template-system/vendorShop/` - 3 vendor shop templates (DELETED)
  - VendorShopGrid.tsx
  - VendorShopList.tsx
  - VendorShopMinimal.tsx
- `components/template/templateConfig.ts` - Removed vendorShop from TemplateCategory union
- `components/template/TemplateCardGrid.tsx` - Removed vendorShop template selector
- `components/template-system/index.ts` - Removed vendorShop exports

**Product Templates (Modified):**

- `components/template-system/productPage/ProductPageClassic.tsx` - Removed "Sold by" vendor section
- `components/template-system/productPage/ProductPageEditorial.tsx` - Removed "Curated by" vendor section
- `components/template-system/productPage/ProductPageTechnical.tsx` - Removed vendor display
- `components/template-system/productPage/ProductPageMinimal.tsx` - Removed "by {vendorName}" section

**Product Card Components (Conditional Hide):**

- `components/shop/ProductCard.tsx` - showVendor defaults to false via isMultiVendorMode()
- `components/template-system/categoryPage/CategoryGridClassic.tsx` - Vendor hidden by default
- `components/template-system/home/HomeFeaturedProducts.tsx` - Vendor hidden by default

**Navigation (Conditional Hide):**

- `components/globals/Navbar.tsx` - "Become a vendor!" link hidden in single-shop mode
- `components/dashboard/DashboardSidebar.tsx` - "Vendors" menu item hidden (not modified, pre-existing)

---

### ✅ Backend Changes

**Authentication & Guards:**

- `backend/auth/middleware.ts` - Dashboard redirects non-admins to home (vendors blocked)
- `backend/auth/login/service.ts` - Removed vendor email verification bypass (~40 lines)

**Product Services (8 files - ADMIN-ONLY):**

- `backend/products/create-product/service.ts`
  - Removed vendorId from createProductSchema
  - Changed auth from (admin || vendor) to admin-only
  - Removed checkVendorStatus() calls
  - Removed vendor validation logic (~25 lines)
  - Sets vendorId = null in product inserts
- `backend/products/edit-product/service.ts`
  - Removed vendorId from editProductSchema
  - Removed vendor ownership checks (~30 lines)
  - Direct product update without vendor validation
- `backend/products/delete-product/service.ts`
  - Changed auth to admin-only
  - Removed vendor ownership validation
- `backend/products/view-products/service.ts`
  - Removed vendorId from viewProductsSchema
  - Removed vendor table joins (2 queries)
  - Removed vendor.status = "active" conditions
  - Removed vendor.name from search filters
- `backend/products/search-products/service.ts`
  - Removed vendorId from searchProductsSchema
  - Removed vendor joins
  - Removed vendorId/vendorName from select fields
- `backend/products/get-product-by-id/service.ts`
  - Removed vendor table join
  - Removed vendorId/vendorName from ProductByIdResult type
  - Removed vendor.status validation
- `backend/products/get-product-stats/service.ts`
  - Removed vendorId from schema
  - Removed vendor filtering logic
- `backend/products/get-total-revenue/service.ts`
  - Removed vendorId from schema
  - Simplified to sum all orders (admin-only)
- `backend/products/get-top-selling/service.ts`
  - Removed vendorId from schema
  - Removed vendor joins
  - Removed vendorId/vendorName from output

**Order Services (Modified but NOT fully cleaned):**

- `backend/orders/view-orders/service.ts`
  - Removed auto-vendorId filtering for vendor role
  - Set isVendor = false
  - Changed auth to admin-only
- `backend/orders/order-stats/service.ts`
  - Admin-only auth
  - vendorId parameter still exists but ignored in single-shop mode
- `backend/orders/update-order-status/service.ts`
  - Admin-only auth
  - Removed vendor role checks

**File Upload:**

- `backend/file/upload-file/service.ts` - Changed to admin-only

**Router:**

- `shared/trpc/router.ts` - vendorRouter still registered (NOT disabled)

---

### ✅ Database/Schema (NOT MODIFIED - Intact)

**Schema Preserved:**

- `shared/database/drizzle/schema.ts` - All vendor tables/columns intact:
  - `vendor` table exists
  - `vendorLog` table exists
  - `user.vendorId` FK exists
  - `user.role` enum includes "vendor"
  - `product.vendorId` FK exists (NOT NULL)
  - `orderItem.vendorId` FK exists (NOT NULL)
  - `orderItem.vendorName` text field exists
  - All vendor enums (vendorStatus, vendorLogAction) exist

**Why preserved:**

- Data integrity for existing records
- Allows potential multi-vendor restoration
- Single-shop mode uses NULL vendorId values

---

### ✅ Auth & Roles

**Role Behavior Changes:**

- **Admin:** Full dashboard access, all operations
- **Vendor:** BLOCKED from dashboard, treated as regular user
- **User:** Customer-only access (browse, cart, checkout)

**Session Type (Unchanged):**

```typescript
// shared/types - Session interface still has:
role: "admin" | "vendor" | "user"  // "vendor" type preserved
vendorId?: string                   // Field preserved
```

**Procedure Definitions (Unchanged):**

- `shared/trpc/server.ts` - vendorProcedure still exists (unused)

---

### ✅ Configuration System

**New Config:**

- `shared/config/app.ts` - Created SINGLE_SHOP_MODE flag system
  - `isSingleShopMode()` helper
  - `isMultiVendorMode()` helper
  - Used conditionally in 5+ components

**.env:**

```bash
SINGLE_SHOP_MODE=true
```

---

## B) CURRENT STATE SNAPSHOT: How the App Behaves Now

### User Roles & Permissions

**Admin Role:**

- ✅ Full dashboard access (`/dashboard`)
- ✅ Manage products (create, edit, delete)
- ✅ Manage orders (view all, update status)
- ✅ Manage categories
- ✅ Manage promo codes
- ✅ Upload files/images
- ✅ Configure homepage content
- ✅ Configure category content
- ✅ Select templates
- ✅ View all statistics

**User Role (Customer):**

- ✅ Browse products (homepage, category pages, search)
- ✅ View product details
- ✅ Add to cart
- ✅ Complete checkout
- ✅ Track orders (if logged in)
- ❌ BLOCKED from `/dashboard`

**Vendor Role (DISABLED):**

- ❌ BLOCKED from `/dashboard` (redirected to home)
- ❌ Cannot create/edit products (401 Unauthorized)
- ❌ Cannot view orders (403 Forbidden)
- ❌ Cannot upload files (401)
- ❌ Cannot access any backend procedures
- ✅ Can browse as customer

---

### Main Customer Flows (Working)

**Browse → Product → Cart → Checkout:**

1. **Homepage** (`/`) - Shows featured products, categories, hero sections
   - No vendor information displayed
   - Product cards show: image, name, price, category
2. **Category Page** (`/featured/men`, `/featured/women`, `/featured/brands`)
   - Grid/list of products
   - Filters: price, stock, category
   - No vendor filters
3. **Product Detail Page** (`/featured/products/@productId`)
   - Product info, images, description
   - Add to cart button
   - No "Sold by" vendor section
4. **Cart** (`/cart`)
   - Line items with quantity adjustment
   - Subtotal calculation
   - Proceed to checkout
5. **Checkout** (`/checkout`)
   - Shipping address form
   - Payment processing (Fincart integration)
   - Order confirmation
6. **Order Tracking** (if user logged in)
   - View order history
   - Track order status

---

### Admin Flows (Working)

**Product Management:**

- `/dashboard/products` - List all products (no vendor filter UI)
- `/dashboard/products/create` - Create product (vendorId NOT sent)
- `/dashboard/products/edit/@productId` - Edit product
- Delete products via API

**Category Management:**

- `/dashboard/categories` - View/create/edit categories
- Upload category images

**Order Management:**

- `/dashboard/orders` - View all orders (no vendor filtering)
- Update order status
- View order details

**Promo Codes:**

- `/dashboard/promo-codes` - Create/manage discount codes

**Template Configuration:**

- `/dashboard/admin/templates` - Select templates per page type
- Preview templates
- Save configurations

**Homepage Content:**

- `/dashboard/admin/homepage` - Edit hero sections, featured products
- Upload images

**Category Content:**

- `/dashboard/admin/categories` - Edit category-specific content

---

## C) MULTI-VENDOR REMNANTS CHECKLIST

### 🔴 1. ROUTING REMNANTS

**None Found (CLEAN)**

- ✅ No `/vendor/*` routes exist (directory deleted)
- ✅ No `/dashboard/vendors/*` routes (directory deleted)

---

### 🟡 2. UI REMNANTS (Low Priority String References)

| File                                        | Issue                                            | Severity   | Fix                                                   |
| ------------------------------------------- | ------------------------------------------------ | ---------- | ----------------------------------------------------- |
| `shared/types/homepage-content.ts:135`      | "Discover amazing products from trusted vendors" | OPTIONAL   | Change to "Discover amazing products from top brands" |
| `shared/types/homepage-content.ts:140`      | "trusted vendors around the world"               | OPTIONAL   | Change to "brands around the world"                   |
| `shared/types/homepage-content.ts:172`      | "products from top brands and vendors"           | OPTIONAL   | Change to "products from top brands"                  |
| `components/globals/FAQ.tsx:15`             | "multiple sellers without having to visit..."    | OPTIONAL   | Rewrite for single-shop context                       |
| `components/globals/FAQ.tsx:27`             | "Shipping times depend on...the seller"          | OPTIONAL   | Remove seller reference                               |
| `components/globals/FAQ.tsx:33`             | "Some sellers may have specific return policies" | OPTIONAL   | Single return policy statement                        |
| `components/shop/ProductCard.tsx:58-68`     | `showVendor` prop still exists                   | SHOULD-FIX | Remove prop entirely                                  |
| `components/shop/ProductDetail.tsx:594-599` | Conditional vendor display code                  | SHOULD-FIX | Delete vendor display section                         |
| `components/shop/ProductDetail.tsx:774-781` | Vendor name display                              | SHOULD-FIX | Delete vendor display section                         |

---

### 🔴 3. BACKEND REMNANTS (High Priority)

**Router Registration (BLOCKER):**
| File | Issue | Severity | Fix |
|------|-------|----------|-----|
| `shared/trpc/router.ts:10` | `import { vendorRouter } from "#root/backend/vendor/trpc"` | **BLOCKER** | Remove import |
| `shared/trpc/router.ts:28` | `vendor: vendorRouter,` registered in appRouter | **BLOCKER** | Remove registration |

**Procedure Definitions (SHOULD-FIX):**
| File | Issue | Severity | Fix |
|------|-------|----------|-----|
| `shared/trpc/server.ts:66-78` | `vendorProcedure` still exported | SHOULD-FIX | Remove or comment out |

**Vendor Backend Services (SHOULD-FIX - Currently Unused):**

- `backend/vendor/` directory (20 files) - Entire vendor API still exists
  - register-vendor, approve-vendor, reject-vendor
  - activate-vendor, suspend-vendor, edit-vendor
  - view-vendors, view-by-id, featured-vendors
  - check-vendor-status utility

**Severity:** SHOULD-FIX (not BLOCKER because router NOT registered would block access)  
**Fix:** Delete entire `backend/vendor/` directory

**Order Service Vendor References (SHOULD-FIX):**
| File | Issue | Severity | Fix |
|------|-------|----------|-----|
| `backend/orders/create-order/service.ts:279` | Still reads `product.vendorId` for order items | SHOULD-FIX | Handle NULL vendorId |
| `backend/orders/view-orders/service.ts:105-131` | Fetches vendor names for display | SHOULD-FIX | Remove vendor join, vendorName assignment |
| `backend/orders/order-stats/service.ts:11` | vendorId parameter in schema | SHOULD-FIX | Remove vendorId from schema |

---

### 🟠 4. DATABASE/SCHEMA REMNANTS (Optional - Data Integrity)

**Database Columns (Product Table):**
| Column | Type | Constraint | Severity | Fix |
|--------|------|------------|----------|-----|
| `product.vendorId` | uuid | NOT NULL FK | OPTIONAL | Make nullable via migration |

**Database Columns (OrderItem Table):**
| Column | Type | Constraint | Severity | Fix |
|--------|------|------------|----------|-----|
| `orderItem.vendorId` | uuid | NOT NULL FK | OPTIONAL | Make nullable via migration |
| `orderItem.vendorName` | text | nullable | OPTIONAL | Remove column via migration |

**Vendor Tables (Intact):**

- `vendor` table - 8 columns, vendorStatus enum
- `vendorLog` table - audit log
- `user.vendorId` FK - links users to vendors
- Enums: `user_role` includes "vendor", `vendor_status`, `vendor_log_action`

**Severity:** OPTIONAL  
**Reason:** Preserved for data integrity, doesn't affect single-shop functionality  
**Fix (if desired):** Create migration to:

1. Make `product.vendorId` nullable
2. Make `orderItem.vendorId` nullable
3. Drop `orderItem.vendorName` column
4. (Advanced) Drop vendor/vendorLog tables + remove "vendor" from user_role enum

---

### 🟡 5. TYPE REMNANTS (Low Priority TypeScript Interfaces)

**Frontend Types (Product Data):**
| File | Issue | Severity | Fix |
|------|-------|----------|-----|
| `components/shop/ProductCard.tsx:51-52` | `vendorId: string; vendorName: string | null;` | SHOULD-FIX | Remove from interface |
| `components/shop/Sorting.tsx:42-43` | `vendorId: string; vendorName: string | null;` | SHOULD-FIX | Remove from interface |
| `components/template-system/*` | vendorId in 10+ template mock data | OPTIONAL | Update mock data |
| `frontend/components/template/templateRegistry.ts` | vendorId in type definitions (5 occurrences) | SHOULD-FIX | Remove from types |

**Backend Types (Session):**
| File | Issue | Severity | Fix |
|------|-------|----------|-----|
| `backend/auth/shared/database.schema.ts` | Session types inferred from schema | OPTIONAL | Leave as-is (matches DB) |

**Note:** Most type issues are auto-inferred from database schema. If schema preserved, types should match.

---

### 🔴 6. TEMPLATE REMNANTS (Frontend Configuration)

**None Found (CLEAN)**

- ✅ vendorShop templates deleted
- ✅ vendorShop removed from TemplateCategory union
- ✅ vendorShop removed from template selector UI

---

### 🟠 7. MOCK DATA & UTILITIES

**Mock Data:**
| File | Issue | Severity | Fix |
|------|-------|----------|-----|
| `components/template-system/previews/mockData.ts` | vendorId in 10 product samples | OPTIONAL | Remove vendorId fields |
| `lib/mock-data/orders.ts` | vendorId: 1, 2, 3, 4 in mock orders | OPTIONAL | Update or delete file |

**Utilities:**
| File | Issue | Severity | Fix |
|------|-------|----------|-----|
| `lib/utils/route-helpers.ts:15` | `getVendorUrl(vendorId: string)` function | SHOULD-FIX | Delete function |
| `shared/utils/check-vendor-status.ts` | Entire file (80 lines) | SHOULD-FIX | Delete file (unused) |

**Dashboard Data Layer:**
| File | Issue | Severity | Fix |
|------|-------|----------|-----|
| `pages/dashboard/products/+data.ts:46-54` | `getVendorId()` function auto-fills vendorId | **BLOCKER** | Delete function, remove vendorId from queries |
| `pages/dashboard/products/+data.ts:6` | `import { viewVendors }` | SHOULD-FIX | Remove import |
| `pages/dashboard/products/+data.ts:71,114` | Passes vendorId to backend | **BLOCKER** | Remove vendorId parameter |

---

## D) SINGLE-SHOP FINISH LINE: Definition of Done

### ✅ Core Requirements (Must Pass)

**1. No Vendor Role Functionality**

- [ ] `vendor: vendorRouter` removed from `shared/trpc/router.ts`
- [ ] Users with role="vendor" cannot access ANY backend procedures
- [ ] Dashboard blocks vendor role (redirect to home) ✅ DONE
- [ ] No vendor registration flow accessible

**2. No Vendor UI Surfaces**

- [ ] Product pages show NO vendor attribution ✅ DONE
- [ ] Product cards show NO vendor names ✅ DONE
- [ ] Search results show NO vendor info ✅ DONE
- [ ] No vendor shop pages ✅ DONE (deleted)
- [ ] No "Become a vendor" links ✅ DONE

**3. Admin-Only Store Management**

- [ ] Products: create/edit/delete admin-only ✅ DONE
- [ ] Orders: view/manage admin-only ✅ DONE
- [ ] Categories: manage admin-only ✅ DONE
- [ ] Promo codes: manage admin-only ✅ DONE
- [ ] File uploads: admin-only ✅ DONE
- [ ] Template selection: admin-only ✅ DONE

**4. Clean Backend Services**

- [ ] Product services: no vendorId in input schemas ✅ DONE
- [ ] Product services: no vendor joins in queries ✅ DONE
- [ ] Order services: no vendor filtering ✅ DONE (mostly)
- [ ] Dashboard data: no auto-vendorId logic ❌ PENDING
- [ ] vendorProcedure removed or disabled ❌ PENDING

**5. Database Integrity**

- [ ] New products created with vendorId = null ✅ DONE
- [ ] Existing products can have vendorId (preserved) ✅ OK
- [ ] App functions with NULL vendorId values ❌ PENDING (order creation)

**6. Core Commerce Flows Working**

- [ ] Browse products (homepage, categories, search) ✅ WORKING
- [ ] View product details ✅ WORKING
- [ ] Add to cart ✅ WORKING
- [ ] Complete checkout ❌ NEEDS TESTING (vendorId in order items)
- [ ] Track orders ✅ WORKING
- [ ] Admin dashboard full functionality ❌ NEEDS TESTING

**7. Template System Functional**

- [ ] 4 homepage templates selectable ✅ WORKING
- [ ] 4 category templates selectable ✅ WORKING
- [ ] 4 product page templates selectable ✅ WORKING
- [ ] No vendorShop templates ✅ DONE
- [ ] Template preview works ✅ WORKING

---

### 🧪 Testing Checklist (Validation Steps)

**Smoke Tests:**

1. [ ] Start app with SINGLE_SHOP_MODE=true - no errors
2. [ ] TypeScript compilation passes - no type errors
3. [ ] Homepage loads - no vendor names shown
4. [ ] Product page loads - no "Sold by" section
5. [ ] Search works - no vendor filters shown
6. [ ] Cart + checkout flow completes - order created
7. [ ] Admin can create product without vendorId
8. [ ] Vendor role user redirected from dashboard
9. [ ] Admin sees all orders (not filtered by vendor)
10. [ ] Template selector shows 4 options per page type (no vendorShop)

**Regression Tests:**

- [ ] Homepage template switching works
- [ ] Category template switching works
- [ ] Product page template switching works
- [ ] Image uploads work
- [ ] Category content editor works
- [ ] Homepage content editor works
- [ ] Promo codes work
- [ ] Order status updates work

---

## E) FINAL EXECUTION PLAN: Ordered Milestones

### 🎯 MILESTONE 1: Remove Vendor Router & Dashboard Logic (BLOCKER)

**Goal:** Completely disable vendor backend API and clean dashboard data layer

**Files to Change:**

1. `shared/trpc/router.ts`
   - Remove line 10: `import { vendorRouter } from "#root/backend/vendor/trpc"`
   - Remove line 28: `vendor: vendorRouter,`
2. `pages/dashboard/products/+data.ts`
   - Delete `getVendorId()` function (lines 46-54)
   - Remove `vendorId: getVendorId()` from viewProducts call (line 71)
   - Remove `vendorId: getVendorId()` from second call (line 114)
   - Remove line 6: `import { viewVendors }`

**Expected Output:**

- vendorRouter no longer registered (vendor API 404)
- Dashboard product listings don't send vendorId to backend
- TypeScript compiles with no errors

**Validation:**

```bash
# 1. Search for vendor router registration
grep -n "vendor: vendorRouter" shared/trpc/router.ts
# Should return: no matches

# 2. Search for getVendorId usage
grep -n "getVendorId" pages/dashboard/products/+data.ts
# Should return: no matches

# 3. Compile check
pnpm build
# Should pass with no errors
```

---

### 🎯 MILESTONE 2: Clean Order Services Vendor References

**Goal:** Remove vendor data from order creation and display

**Files to Change:**

1. `backend/orders/create-order/service.ts` (line ~279)
   - Handle NULL product.vendorId gracefully:

   ```typescript
   vendorId: product.vendorId || null, // Allow null
   vendorName: product.vendorId ? vendorName : "Store", // Fallback
   ```

2. `backend/orders/view-orders/service.ts` (lines 105-131)
   - Remove vendor join query
   - Remove vendorName assignment
   - Set vendorName = "Store" or remove field entirely

3. `backend/orders/order-stats/service.ts` (line 11)
   - Remove vendorId from schema:
   ```typescript
   export const orderStatsSchema = z.object({
     // vendorId removed
   });
   ```

**Expected Output:**

- Orders can be created with NULL vendorId
- Order list doesn't show vendor names
- Order stats work without vendorId parameter

**Validation:**

```bash
# 1. Test order creation
# Create product as admin (vendorId = null)
# Add to cart, complete checkout
# Verify order created successfully

# 2. Check order list
# Visit /dashboard/orders
# Verify no vendor columns shown

# 3. Test order stats
# Visit dashboard overview
# Verify stats load without errors
```

---

### 🎯 MILESTONE 3: Remove Vendor UI Display Logic

**Goal:** Delete all conditional vendor display code from product cards/details

**Files to Change:**

1. `components/shop/ProductCard.tsx`
   - Remove `showVendor` prop (line 58)
   - Remove `vendorName` from interface (line 52)
   - Delete vendor display section

2. `components/shop/ProductDetail.tsx`
   - Delete lines 594-599 (vendor display section 1)
   - Delete lines 774-781 (vendor display section 2)

3. `components/shop/Sorting.tsx`
   - Remove `vendorName` from interface (line 43)
   - Remove vendorName from all product mappings

**Expected Output:**

- Product cards are smaller (no vendor UI logic)
- Product detail pages show no vendor sections
- Sorting/filtering doesn't reference vendors

**Validation:**

```bash
# 1. Visual check
# Browse homepage - product cards show no vendor
# Open product page - no "Sold by" section

# 2. Code search
grep -rn "showVendor" components/shop/
# Should return: no matches

grep -rn "vendorName" components/shop/
# Should return: no matches (or only type definitions)
```

---

### 🎯 MILESTONE 4: Clean Utility Files & Mock Data

**Goal:** Remove unused vendor utilities and update mock data

**Files to Delete:**

1. `backend/vendor/` - Entire directory (20 files)
2. `shared/utils/check-vendor-status.ts`

**Files to Modify:**

1. `lib/utils/route-helpers.ts`
   - Delete `getVendorUrl()` function (line 15)

2. `shared/trpc/server.ts`
   - Delete `vendorProcedure` export (lines 64-78)

3. `components/template-system/previews/mockData.ts`
   - Remove vendorId from all mock products

**Expected Output:**

- Vendor backend directory deleted
- No vendor utility functions exist
- Mock data has no vendorId fields

**Validation:**

```bash
# 1. Check vendor directory deleted
ls backend/vendor/
# Should return: No such file or directory

# 2. Search for check-vendor-status
grep -rn "checkVendorStatus" backend/
# Should return: no matches

# 3. Search for vendorProcedure usage
grep -rn "vendorProcedure" backend/
# Should return: no matches
```

---

### 🎯 MILESTONE 5: Polish Content & Copy

**Goal:** Update UI text to remove multi-vendor language

**Files to Change:**

1. `shared/types/homepage-content.ts`
   - Line 135: "trusted vendors" → "top brands"
   - Line 140: "vendors around the world" → "brands worldwide"
   - Line 172: "brands and vendors" → "brands"

2. `components/globals/FAQ.tsx`
   - Line 15: Rewrite for single-shop
   - Line 27: Remove "seller" reference
   - Line 33: Single return policy statement

3. `components/globals/Footer.tsx`
   - Line 132: Update marketplace description

**Expected Output:**

- All customer-facing copy says "brands" not "vendors"
- FAQ reflects single-shop experience
- Footer description accurate

**Validation:**

```bash
# Visual check
# Browse site as customer
# Read all text for vendor/seller/marketplace references

# Search check
grep -rn "vendor" components/globals/ shared/types/
# Filter to customer-facing strings only
```

---

### 🎯 MILESTONE 6: End-to-End Testing & Documentation

**Goal:** Verify all commerce flows work, document final state

**Testing Protocol:**

1. **Fresh Product Creation Flow**
   - Login as admin
   - Create new product (no vendorId sent)
   - Verify product.vendorId = null in database
   - Product appears on homepage

2. **Full Customer Journey**
   - Browse homepage (no vendor shown)
   - Click product (no "Sold by")
   - Add to cart
   - Complete checkout
   - Verify order created
   - Check order in admin dashboard

3. **Template System Test**
   - Admin template selector
   - Switch homepage template → verify change
   - Switch category template → verify change
   - Switch product page template → verify change
   - All 12 templates work (4 home, 4 category, 4 product)

4. **Admin Operations Test**
   - Edit product → saves successfully
   - Delete product → removed from DB
   - Create category → appears in listings
   - Create promo code → applies at checkout
   - Upload image → shows in products
   - Update order status → status changes

5. **Vendor Role Blocked Test**
   - Create user with role="vendor"
   - Login as vendor
   - Attempt `/dashboard` → redirected to home
   - Attempt create product API → 401
   - Attempt view orders API → 403

**Expected Output:**

- All flows work without errors
- No vendor references in UI
- Admin has full control
- Vendor role completely disabled

**Final Deliverable:**

- Update `README.md` with single-shop setup instructions
- Document admin workflows
- List all working features
- Mark template as "Single-Shop Ready for Sale"

**Validation Checklist:**

```
[ ] Can create products as admin
[ ] Products show with vendorId = null
[ ] Homepage displays products correctly
[ ] Product pages load without vendor section
[ ] Cart works
[ ] Checkout completes successfully
[ ] Orders appear in admin dashboard
[ ] Can update order status
[ ] Template switching works (all 12 templates)
[ ] Vendor role blocked from all operations
[ ] No TypeScript errors
[ ] No console errors on any page
[ ] Mobile responsive (spot check)
```

---

## 🎯 SUMMARY: Execution Order

**Priority 1 (BLOCKERS - Do First):**

1. ✅ Remove vendor router registration
2. ✅ Fix dashboard getVendorId logic
3. ✅ Handle NULL vendorId in order creation

**Priority 2 (CORE CLEANUP - Do Second):** 4. ✅ Remove vendor display from UI components 5. ✅ Delete vendor backend directory 6. ✅ Remove vendor utilities

**Priority 3 (POLISH - Do Third):** 7. ✅ Update UI copy (vendors → brands) 8. ✅ Clean mock data

**Priority 4 (VALIDATION - Do Last):** 9. ✅ End-to-end testing 10. ✅ Documentation update

**Estimated Time:**

- Milestone 1: 30 minutes
- Milestone 2: 1 hour
- Milestone 3: 45 minutes
- Milestone 4: 45 minutes
- Milestone 5: 30 minutes
- Milestone 6: 2 hours (testing)

**Total: ~6 hours to completion**

---

## 🚫 DO NOT DO

- ❌ Do NOT remove vendor table from database (data integrity)
- ❌ Do NOT change user.role enum (breaks existing data)
- ❌ Do NOT modify migrations (preserve history)
- ❌ Do NOT add "keep vendor for future" logic (clean deletion)
- ❌ Do NOT create vendor-specific config flags (use SINGLE_SHOP_MODE only)

---

## ✅ DEFINITION OF DONE (Final Checklist)

```
BACKEND:
[ ] vendorRouter not registered in appRouter
[ ] No vendor procedures accessible
[ ] Product CRUD: no vendorId in input schemas
[ ] Product queries: no vendor joins
[ ] Order creation: handles NULL vendorId
[ ] Order display: no vendor info shown
[ ] Dashboard: no getVendorId() logic

FRONTEND:
[ ] No vendor display in product cards
[ ] No vendor display in product pages
[ ] No vendor display in search results
[ ] No /vendor routes exist
[ ] No /dashboard/vendors routes exist
[ ] Template selector: no vendorShop option

DATABASE:
[ ] New products have vendorId = null
[ ] Orders can be created without vendor
[ ] App functions with NULL vendorId values

TESTING:
[ ] Full commerce flow works (browse → checkout)
[ ] Admin can manage all products
[ ] Admin can manage all orders
[ ] Template switching works (12 templates)
[ ] Vendor role completely blocked
[ ] No TypeScript errors
[ ] No console errors

DOCUMENTATION:
[ ] README updated for single-shop setup
[ ] Admin workflows documented
[ ] Feature list accurate
```

**When all boxes checked: TEMPLATE IS SALE-READY** ✅

---

_End of Audit & Execution Plan_
