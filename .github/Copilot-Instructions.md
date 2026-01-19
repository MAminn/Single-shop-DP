## You’re working on the duplicated repo for Single-Shop template

## Multi-vendor is out of scope and must be removed/ignored

## Template system + CMS remain core selling points

## Goal = sellable single-shop eCommerce template

# Project Context for GitHub Copilot (SINGLE-SHOP TEMPLATE)

## Overview
We are working on a **single-shop e-commerce template** called **Lebsy Shop**.
This codebase is a **duplicated version** of the original multi-vendor project. The original multi-vendor repo remains intact and is NOT modified here.

**In this repo, multi-vendor is DISABLED and being removed.**
We are building a **reusable single-shop e-commerce digital product template** to sell on marketplaces (CodeCanyon/Gumroad/etc.).

## Core Rule (Non-Negotiable)
✅ This repo must behave like a **single store**:
- No vendor registration
- No vendor dashboard
- No vendor approval workflow
- No vendor shop/storefront pages
- No vendor role behavior
- No vendor filtering in orders/products
- Admin manages the single store; customers buy from the single store

If any logic mentions vendors, vendorId, vendorRouter, vendorShop, vendor role → it must be removed or made inactive under SINGLE_SHOP_MODE.

## Key Goals
- Make the codebase clean, organized, and easy to customize.
- Ensure all components follow naming/folder conventions.
- Keep the **Template System** as a core selling point (homepage/category/product/cart/checkout templates).
- Prepare the template for packaging and selling.

## Single-Shop Mode
We use `SINGLE_SHOP_MODE` (helper exists in shared config).
When `SINGLE_SHOP_MODE=true`:
- Any vendor routes/APIs must not exist or must be unreachable.
- Dashboard must be **admin-only**.
- Product CRUD must be **admin-only**.
- Orders must not contain vendor-scoped permissions or vendor-based joins/filters.
- UI must not display vendor branding (“Sold by”, “Visit store”, vendor badges).

## Technologies
- Frontend: Vike (SSR) + React 19, Tailwind CSS, shadcn/ui
- Backend: Fastify, tRPC, PostgreSQL + Drizzle ORM, custom auth

## Current Task (Now)
We are finalizing the transformation from multi-vendor → single-shop:
1) Remove remaining vendor API exposure (vendorRouter, vendorProcedure, vendor services).
2) Remove remaining vendorId injection from admin flows (e.g., getVendorId).
3) Remove remaining vendor references from order/product services and UI.
4) Ensure stable single-shop commerce flows (browse → cart → checkout → orders) and admin flows.

## Definition of Done (Pass/Fail)
✅ Single-shop template is complete when:
- No `/vendor` routes exist in frontend
- No vendor routers/procedures are registered in backend
- No “vendor” role behavior exists (admin/user only)
- Product & order services do not require vendorId logic
- UI contains no vendor branding or vendor links
- Build passes with 0 TypeScript errors
- Core flows verified:
  - Customer: browse → product → cart → checkout → order confirmation → order history
  - Admin: login → dashboard → create/edit product → manage orders → template switching

## Hard Scope Rules
✅ Allowed:
- Cleanup/refactor to remove vendor remnants
- Improve single-shop admin/store settings if needed
- Documentation and packaging tasks
- UX polish + QA for existing templates

❌ Forbidden:
- Reintroducing multi-vendor features
- Building vendor shop pages
- Vendor onboarding/approval flows
- Anything not needed for a sellable single-shop template

## Output Style for Copilot
When asked for plans or audits:
- Be specific with file paths
- Provide ordered milestones (no loops)
- Label issues as BLOCKER / SHOULD-FIX / OPTIONAL
- Prefer minimal changes that unblock shipping
