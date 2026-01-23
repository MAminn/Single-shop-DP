# LEBSEY - Comprehensive Project Context for ChatGPT

## A) WHAT THIS REPO IS

**Product**: Lebsy Shop is a single-shop e-commerce template (sellable digital product) that provides:

- Admin-managed product catalog for a single online store
- Customers browse and purchase products from the single store
- Admins manage all products, categories, orders, and store settings
- A customizable template system for dynamic page layouts (homepage, category, product, cart, checkout)

**Users & Roles**:

- **Admin**: Full system access - manage products, categories, orders, store settings, and template configuration
- **User/Customer**: Browse products, add to cart, place orders, write reviews

**Core Flows**:

1. **Shopping**: Browse Products → Add to Cart → Checkout → Order Placement → Order Tracking (Fincart integration)
2. **Product Management**: Admin Creates Product → Assign Categories → Upload Images → Set Variants → Manage Stock
3. **Order Management**: Customer Places Order → Admin Fulfills → Status Updates via Fincart Webhooks
4. **Promo Codes**: Admin creates codes → Customers apply at checkout → Discount applied
5. **Template System**: Admins assign templates to pages/sections → Dynamic rendering → Customizable store appearance

**What "Done" Means**:

- Sellable single-shop e-commerce template
- Admin-only dashboard (no vendor features)
- Complete shopping flows (browse → cart → checkout → orders)
- Template system for UI customization
- Admin manages single store inventory
- Zero vendor-related code or UI

---

## B) TECH STACK & ARCHITECTURE

### Frontend

- **Framework**: Vike (SSR/SSG framework) + React 19
- **Styling**: Tailwind CSS 4 + shadcn/ui components (Radix UI primitives)
- **State Management**: React hooks, tRPC client-side caching
- **Forms**: React Hook Form + Zod validation
- **UI Libraries**:
  - Framer Motion (animations)
  - Recharts (analytics charts)
  - Lucide React (icons)
  - Sonner (toast notifications)
  - next-themes (dark mode)

### Backend

- **Runtime**: Node.js with Fastify
- **API**: tRPC (type-safe RPC) + some REST endpoints for webhooks
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Custom session-based auth with Oslo.js (cryptography)
  - Argon2 for password hashing
  - SHA256 for session tokens
  - Email verification with tokens
- **File Uploads**: Fastify Multipart (100MB limit, stored in `/uploads`)
- **Email**: Nodemailer with React Email templates

### Database (Drizzle ORM)

- **Connection**: PostgreSQL via `@fastify/postgres`
- **Migrations**: Drizzle Kit (`drizzle-kit generate` + `drizzle-kit migrate`)
- **Schema Location**: `shared/database/drizzle/schema.ts`

### API Style

- **Primary**: tRPC (type-safe procedures)
- **Secondary**: REST for webhooks (`/api/webhooks/fincart`) and auth (`/api/auth/*`)

### Monorepo Structure

- **No**, single repository
- **Tooling**: pnpm for package management
- **Build**: Unbuild + Vite

### Env & Config

- **Env Vars**: `.env` file (currently open in editor)
  - `DATABASE_URL`: PostgreSQL connection string
  - `PORT`: Server port (default 3000)
  - `HMR_PORT`: Vite HMR port (default 24678)
  - `NODE_ENV`: production/development
- **Config Files**:
  - `vite.config.ts`: Vite + React + Tailwind plugins
  - `drizzle.config.ts`: Database connection for migrations
  - `tsconfig.json`: TypeScript configuration
  - `biome.json`: Linting and formatting rules

---

## C) FOLDER MAP & MENTAL MODEL

### Main Entry Points

- **Server**: `server/server.ts` - Fastify server setup
- **Vike Handler**: `server/vike-handler.ts` - SSR rendering
- **Dev Entry**: `hono-entry.ts` (development with Hono)
- **Node Entry**: `hono-entry.node.ts` (production)

### Routing Structure

- **Vike Filesystem Routing**: `/pages/*`
  - `/pages/index/+Page.tsx` → `/` (home page with template system)
  - `/pages/dashboard/` → `/dashboard/*` (admin/vendor dashboard)
  - `/pages/featured/` → `/featured/*` (featured products)
  - `/pages/cart/` → `/cart` (shopping cart)
  - `/pages/checkout/` → `/checkout` (order placement)
  - `/pages/login/` → `/login` (authentication)
  - `/pages/register/` → `/register` (user registration)
  - `/pages/vendor/` → `/vendor/*` (vendor-specific pages)
  - `/pages/verify-email/` → `/verify-email` (email verification)
  - `/pages/_error/` → Error page

### Business Logic Location

- **Backend**: `/backend/` - organized by domain
  - `auth/` - Authentication (login, register, session management)
  - `products/` - Product CRUD, reviews, search, stats
  - `orders/` - Order management, Fincart webhook handler
  - `vendor/` - Vendor registration, approval, management
  - `categories/` - Category CRUD
  - `file/` - File upload handling
  - `promo-codes/` - Promotional code management
  - `dashboard/` - Admin analytics and overview
  - `router/router.ts` - Main tRPC router

### API Calls Location

- **Client**: `shared/trpc/client.ts` - tRPC client setup
- **Usage**: Components import `trpc` from `#root/shared/trpc/client`
- **Example**: `trpc.product.search.query({ limit: 10 })`

### Auth Boundaries

- **Public Routes**: Home, featured products, product search, login, register
- **Protected Routes (Dashboard)**: `/dashboard/*` - requires auth + admin/vendor role
  - **Guard**: `pages/dashboard/+guard.ts` - redirects if not authenticated or if role is "user"
- **Role Checks**:
  - Admin: Full access to all features
  - Vendor: Can only manage their own products and view their orders
  - User: Shopping only, no dashboard access

### Shared UI Patterns

- **Components**: `/components/` - reusable React components
  - `ui/` - shadcn/ui primitives (buttons, dialogs, forms, etc.)
  - `dashboard/` - Dashboard-specific components
  - `globals/` - Global components (Navbar, Footer)
  - `shop/` - Shopping-related components
  - `template/` - Template system components
- **Layouts**: `/layouts/LayoutDefault.tsx` - main layout wrapper
- **Hooks**: `/hooks/` - custom React hooks

---

## D) CONVENTIONS

### Naming Conventions

- **Files**:
  - React components: PascalCase (`ProductCard.tsx`)
  - Utilities: kebab-case (`use-mobile.ts`)
  - Vike config: `+config.ts`, `+Page.tsx`, `+data.ts`, `+guard.ts`
- **Functions**: camelCase (`createProduct`, `validateSession`)
- **Components**: PascalCase (`ProductCard`, `DashboardSidebar`)
- **Types**: PascalCase with descriptive names (`ClientSession`, `FeaturedProduct`)
- **Database Tables**: snake_case (`product_category`, `order_item`)

### Components Pattern

- **Functional Components** with TypeScript
- **Props Interface**: Defined inline or as separate type
- **Default Exports** for page components
- **Named Exports** for utility components
- **Hooks**: React hooks at top of component
- **Effect Pattern**: Effect.js for backend operations

### Error Handling Pattern

- **Backend**: Effect.js with `ServerError` class
  - `tag`: Error type identifier
  - `statusCode`: HTTP status code
  - `clientMessage`: User-facing message
  - `cause`: Original error (for logging)
- **Frontend**: Try-catch with state management
  - `isLoading`, `error`, `data` state pattern
  - Toast notifications for user feedback (Sonner)

### API Client Pattern

- **tRPC Procedures**:
  - `publicProcedure`: No auth required
  - Custom middleware for auth (checks `ctx.clientSession`)
- **Structure**:
  ```typescript
  export const someProcedure =
    publicProcedure.input(zodSchema).query |
    mutation(async ({ ctx, input }) => {
      return await runBackendEffect(
        someService(input).pipe(provideDatabase(ctx)),
      ).then(serializeBackendEffectResult);
    });
  ```

### Forms/Validation Pattern

- **Zod Schemas**: Define in service files (`service.ts`)
- **React Hook Form**: For form state management
- **Validation**: Zod resolver with React Hook Form
- **Example**:
  ```typescript
  const schema = z.object({ name: z.string().min(1) });
  const form = useForm({ resolver: zodResolver(schema) });
  ```

### i18n Pattern

- **Not Currently Implemented** - all text is hardcoded in English

### Testing Pattern

- **Framework**: Vitest configured but no tests written yet
- **Location**: Would be `*.test.ts` or `*.spec.ts` files

### Lint/Format

- **Tool**: Biome (fast linter/formatter)
- **Commands**:
  - `pnpm lint` - lint and fix
  - `pnpm format` - format code
- **Config**: `biome.json`
- **Rules**: Recommended rules with some overrides

---

## E) ENVIRONMENTS & RUN COMMANDS

### Install

```bash
pnpm install
```

### Database Setup

```bash
# Create .env file with DATABASE_URL
# Then run migrations:
pnpm drizzle:generate  # Generate migration files
pnpm drizzle:migrate   # Apply migrations to database
```

### Development

```bash
pnpm dev  # Starts Fastify server with Vike, watches backend changes
# Server runs on http://localhost:3000
# HMR on port 24678
```

### Build

```bash
pnpm build  # Unbuild + Vike build for production
```

### Production

```bash
pnpm preview  # Run production build locally
pnpm start    # Start production server
```

### Database Tools

```bash
pnpm drizzle:studio  # Open Drizzle Studio (database GUI)
```

### Lint/Format

```bash
pnpm lint    # Lint and auto-fix
pnpm format  # Format code
```

### Deploy

- **Not configured** - would typically be Docker-based (Dockerfile present)
- `docker-compose.yml` present for containerization

---

## F) CURRENT STATUS

### What Works Now (Single-Shop Template)

✅ User authentication (login, register, email verification)
✅ Session management (cookie-based)
✅ Product CRUD operations (admin-only) with multiple images
✅ Category management (customizable categories)
✅ Product search and filtering
✅ Order creation and management (single-store)
✅ Fincart payment integration (webhook handler)
✅ Promo code system (create, validate, apply discounts)
✅ Template system (homepage, category, product, cart, checkout templates)
✅ File upload system (images)
✅ Admin dashboard (admin-only access)
✅ Product reviews system
✅ Multi-category assignment for products
✅ Product variants (e.g., sizes, colors)
✅ Single-shop mode enabled by default

### Recently Completed (Transformation)

✅ Removed vendor registration and approval workflows
✅ Removed vendor dashboard and shop pages
✅ Removed vendor-related UI components ("Sold by", shop links)
✅ Admin-only product management enforced
✅ Vendor routes disabled/removed

### What's Half-Done / Messy

⚠️ Template analytics tracking (structure exists, not fully implemented)
⚠️ Email templates (React Email components exist but may need styling)
⚠️ Error handling consistency (mix of Effect and try-catch)
⚠️ Frontend state management could be more consistent
⚠️ Some legacy vendor references in database schema (legacy columns)

### Big Refactors Planned

🔄 Final cleanup of vendor-related backend code
🔄 Add comprehensive test coverage
🔄 Improve template system with additional template variations
🔄 Add caching layer (Redis) for performance
🔄 Add inventory management features
🔄 Package for marketplace sales (CodeCanyon/Gumroad)

### Deadline / Priority

📅 Not specified - appears to be active development
⭐ Priority: Vendor management, order processing, payment integration

---

## G) DATA MODEL

### Main Entities

#### User

```typescript
{
  id: uuid (PK)
  name: string
  email: string (unique)
  passwordDigest: string (Argon2 hashed)
  phone: string
  vendorId: uuid (FK → vendor) | null
  role: "admin" | "vendor" | "user"
  emailVerified: boolean
  verificationToken: string | null
  verificationExpiry: date | null
  profilePicture: string | null
  createdAt: date
  updatedAt: date | null
}
```

#### Vendor

```typescript
{
  id: uuid (PK)
  name: string
  status: "pending" | "rejected" | "active" | "inactive" | "suspended" | "archived"
  description: string | null
  logoId: uuid (FK → file) | null
  socialLinks: jsonb (array of links)
  featured: boolean
  createdAt: date
  updatedAt: date | null
}
```

#### Product

```typescript
{
  id: uuid (PK)
  name: string
  description: string
  imageId: uuid (FK → file) // Primary image
  categoryId: uuid (FK → category) // Legacy, use productCategory junction
  price: decimal(10,2)
  discountPrice: decimal(10,2) | null
  vendorId: uuid (FK → vendor)
  stock: integer
  createdAt: date
  updatedAt: date | null
}
```

#### Category

```typescript
{
  id: uuid (PK)
  name: string
  slug: string
  imageId: uuid (FK → file) | null
  type: "men" | "women"
  deleted: boolean
  createdAt: date
  updatedAt: date | null
}
```

#### Order

```typescript
{
  id: uuid (PK)
  userId: uuid (FK → user) | null
  customerName: string
  customerEmail: string
  customerPhone: string
  shippingAddress: string
  shippingCity: string
  shippingState: string
  shippingPostalCode: string
  shippingCountry: string
  subtotal: decimal(10,2)
  shipping: decimal(10,2)
  tax: decimal(10,2)
  discount: decimal(10,2) | null
  promoCodeId: uuid (FK → promoCode) | null
  total: decimal(10,2)
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  notes: string | null
  // Fincart integration fields
  fincartTrackingNumber: string | null
  fincartStatus: string | null
  fincartSubStatus: string | null
  fincartRejectionReason: string | null
  fincartSupportNote: string | null
  fincartReturnTrackingNumber: string | null
  fincartStatusUpdatedDate: date | null
  fincartWebhookData: jsonb | null
  createdAt: date
  updatedAt: date | null
}
```

#### PromoCode

```typescript
{
  id: uuid (PK)
  code: string (unique)
  description: string | null
  discountType: "percentage" | "fixed_amount"
  discountValue: decimal(10,2)
  status: "active" | "inactive" | "expired" | "exhausted" | "scheduled"
  startDate: date | null
  endDate: date | null
  usageLimit: integer | null // Total uses
  usedCount: integer
  usageLimitPerUser: integer | null
  minPurchaseAmount: decimal(10,2) | null
  appliesToAllProducts: boolean
  createdBy: uuid (FK → user) | null
  createdAt: date
  updatedAt: date | null
}
```

#### Template (Dynamic Layout System)

```typescript
{
  id: uuid (PK)
  name: string
  description: string | null
  type: "page" | "section" | "component"
  category: string // e.g., "hero", "product-card", "navbar"
  previewImageId: uuid (FK → file) | null
  componentPath: string // React component path
  configSchema: jsonb // JSON schema for options
  defaultConfig: jsonb // Default configuration
  status: "active" | "inactive" | "draft"
  version: string
  isDefault: boolean
  createdBy: uuid (FK → user)
  createdAt: date
  updatedAt: date | null
}
```

### Key Relationships

1. **User ↔ Vendor**: One-to-One (user.vendorId → vendor.id)
2. **Vendor ↔ Product**: One-to-Many (product.vendorId → vendor.id)
3. **Product ↔ Category**: Many-to-Many via `productCategory` junction table
4. **Product ↔ ProductImage**: One-to-Many (productImage.productId → product.id)
5. **Product ↔ ProductVariant**: One-to-Many (productVariant.productId → product.id)
6. **Order ↔ OrderItem**: One-to-Many (orderItem.orderId → order.id)
7. **Order ↔ User**: Many-to-One (order.userId → user.id, nullable for guest orders)
8. **Order ↔ PromoCode**: Many-to-One (order.promoCodeId → promoCode.id)
9. **PromoCode ↔ Product**: Many-to-Many via `promoCodeProducts` junction table
10. **PromoCode ↔ Category**: Many-to-Many via `promoCodeCategories` junction table
11. **Product ↔ ProductReview**: One-to-Many (productReview.productId → product.id)
12. **Template ↔ TemplateAssignment**: One-to-Many (templateAssignment.templateId → template.id)

### Key Enums/Statuses

- **user_role**: `"admin" | "vendor" | "user"`
- **vendor_status**: `"pending" | "rejected" | "active" | "inactive" | "suspended" | "archived"`
- **order_status**: `"pending" | "processing" | "shipped" | "delivered" | "cancelled"`
- **category_type**: `"men" | "women"`
- **discount_type**: `"percentage" | "fixed_amount"`
- **promo_code_status**: `"active" | "inactive" | "expired" | "exhausted" | "scheduled"`
- **template_type**: `"page" | "section" | "component"`
- **template_status**: `"active" | "inactive" | "draft"`

### Auth Permissions Matrix

| Role  | Create Product | Edit Product | Manage Categories | View Orders | Manage Promo Codes | Access Dashboard |
| ----- | -------------- | ------------ | ----------------- | ----------- | ------------------ | ---------------- |
| Admin | ✅             | ✅           | ✅                | ✅ (All)    | ✅                 | ✅               |
| User  | ❌             | ❌           | ❌                | ❌          | ❌                 | ❌               |

**Special Rules**:

- Only admins can access dashboard and manage store
- Email must be verified for full access
- Session must be valid (not expired)
- In single-shop mode, vendor role and features are disabled

---

## H) API MAP

### Base URLs

- **Development**: `http://localhost:3000`
- **Production**: Not specified (likely behind proxy)

### Auth Headers/Cookies

- **Cookie**: `session` - contains session token (Base32 encoded)
- **No Bearer tokens** - session-based auth only

### Key tRPC Endpoints

#### 1. Product Search

```typescript
trpc.product.search.query({
  query?: string,
  categoryId?: string,
  vendorId?: string,
  minPrice?: number,
  maxPrice?: number,
  limit?: number,
  offset?: number,
  sortBy?: "price_asc" | "price_desc" | "newest",
  includeOutOfStock?: boolean
})

// Response:
{
  success: true,
  result: {
    items: [{
      id: string,
      name: string,
      description: string,
      price: string,
      discountPrice: string | null,
      stock: number,
      imageUrl: string,
      vendor: string,
      vendorId: string,
      categoryName: string,
      available: boolean,
      images: [{ url: string, isPrimary: boolean }]
    }],
    total: number
  }
}
```

#### 2. Create Product

```typescript
trpc.product.create.mutate({
  name: string,
  description: string,
  imageId: string (uuid),
  categoryId: string (uuid),
  categoryIds: string[] (uuids),
  price: number,
  discountPrice?: number,
  vendorId: string (uuid),
  stock: number,
  variants?: [{ name: string, values: string[] }],
  productImages?: [{ id: string (uuid), isPrimary?: boolean }]
})

// Response:
{
  success: true,
  result: { id: string, ...productData }
}
```

#### 3. Create Order

```typescript
trpc.order.create.mutate({
  items: [{
    productId: string,
    quantity: number,
    price: number,
    discountPrice?: number,
    name: string,
    vendorId: string,
    vendorName: string
  }],
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  shippingAddress: string,
  shippingCity: string,
  shippingState: string,
  shippingPostalCode: string,
  shippingCountry: string,
  promoCode?: string,
  notes?: string
})

// Response:
{
  success: true,
  result: { id: string, total: number, status: "pending", ... }
}
```

#### 4. Vendor Registration

```typescript
trpc.vendor.register.mutate({
  name: string,
  description?: string,
  logoId?: string (uuid),
  socialLinks?: string[]
})

// Response:
{
  success: true,
  result: {
    id: string,
    name: string,
    status: "pending",
    message: "Vendor registration submitted for approval"
  }
}
```

#### 5. Validate Promo Code

```typescript
trpc.promoCode.validate.query({
  code: string,
  cartItems: [{
    productId: string,
    quantity: number,
    price: number
  }],
  subtotal: number
})

// Response:
{
  success: true,
  result: {
    valid: boolean,
    promoCode: { id: string, code: string, discountType: string, discountValue: string },
    discountAmount: number,
    message?: string
  }
}
```

### REST Endpoints

#### Auth Endpoints (Prefix: `/api/auth`)

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login (sets session cookie)
- `POST /api/auth/logout` - User logout (clears session)
- `GET /api/auth/me` - Get current user session
- `POST /api/auth/verify-email` - Verify email with token

#### File Upload

- `POST /api/upload` - Upload file (multipart/form-data, max 100MB)
  - Returns: `{ fileId: string, url: string }`

#### Webhook

- `POST /api/webhooks/fincart` - Fincart payment webhook
  - Payload: Fincart webhook data (updates order status)

---

## I) WHAT I NEED FROM YOU (ChatGPT)

### Response Format for "Implement X"

When I ask you to implement a feature, you MUST respond in this exact format:

#### 1. **Understanding**

What you think the request means, including:

- Core functionality requested
- Expected user interaction
- Business logic implications
- Integration points with existing features

#### 2. **Impacted Areas**

List all files/modules that will be affected:

- New files to create
- Existing files to modify
- Related systems that might be affected
- Database schema changes (if any)

#### 3. **Plan**

Step-by-step implementation approach:

1. First step (e.g., "Create database migration for new table")
2. Second step (e.g., "Add tRPC procedure in backend")
3. Third step (e.g., "Create UI component in frontend")
4. etc.

#### 4. **Code Changes**

Provide actual code snippets or diffs:

- Show before/after for modifications
- Show complete code for new files
- Use proper syntax highlighting
- Include imports and types

#### 5. **Tests/Verification**

How to verify the implementation works:

- Manual testing steps
- Expected behavior
- Edge cases to test
- Data to use for testing

#### 6. **Edge Cases**

Potential issues and how they're handled:

- **Auth/Security**: Who can access this? Any auth bypass risks?
- **Data Loss**: Any risk of deleting/corrupting data?
- **Breaking Changes**: Will this break existing functionality?
- **Performance**: Any N+1 queries, slow operations, or memory leaks?
- **Race Conditions**: Any concurrent access issues?
- **Input Validation**: All user inputs validated?
- **Error Handling**: Graceful degradation? User-friendly errors?

---

## J) ADDITIONAL CONTEXT

### File Upload System

- **Location**: Files stored in `/uploads` directory
- **Max Size**: 100MB per file, 10 files max per request
- **Handling**: `backend/file/upload-file/api.ts`
- **Reference**: Files tracked in `file` table with `diskname` (actual filename on disk)
- **Access**: Static serving via Fastify Static plugin

### Session Management

- **Token Generation**: 20-byte random → Base32 encoded
- **Storage**: SHA256 hash of token stored in database
- **Expiry**: 30 days from creation
- **Cookie**: HTTP-only, secure in production

### Effect.js Pattern

The backend uses Effect.js for functional error handling:

```typescript
Effect.gen(function* ($) {
  // Dependency injection
  const db = yield* $(DatabaseClientService);

  // Operations with automatic error handling
  const result = yield* $(
    Effect.tryPromise({
      try: async () => await someOperation(),
      catch: (err) => new ServerError({ tag: "OperationFailed", cause: err }),
    }),
  );

  // Return result
  return result;
});
```

### Vendor Status Workflow

```
pending → (admin approves) → active → (can create products)
   ↓
rejected (admin rejects)

active → (admin suspends) → suspended
   ↓
archived (soft delete)
```

### Order + Fincart Integration

- Orders created locally first with `status = "pending"`
- Fincart webhook updates order status with tracking info
- Webhook data stored in `fincartWebhookData` JSONB field
- Status mapping: Fincart status → internal order status

### Template System

- Admins create templates (React components)
- Templates assigned to pages/sections via `templateAssignment`
- Dynamic rendering via `TemplateRenderer` component
- Config schema allows customization per assignment
- Analytics track views, interactions, conversion rates

### Path Aliases

- `#root/*` maps to repository root (defined in `tsconfig.json` and `vite.config.ts`)
- Use absolute imports: `import { foo } from "#root/shared/utils"`

---

## K) COMMON TASKS & PATTERNS

### Adding a New tRPC Procedure

1. Create service file: `backend/[domain]/[action]/service.ts`
   - Define Zod schema
   - Implement Effect-based service function
2. Create tRPC file: `backend/[domain]/[action]/trpc.ts`
   - Export procedure with input schema
   - Call service and serialize result
3. Add to router: `backend/[domain]/trpc.ts`
   - Import procedure
   - Add to domain router
4. Use in frontend: `trpc.[domain].[action].query|mutate()`

### Adding a New Database Table

1. Edit `shared/database/drizzle/schema.ts`
   - Add table definition with Drizzle schema
   - Add any enums needed
   - Add relations if needed
2. Generate migration: `pnpm drizzle:generate`
3. Apply migration: `pnpm drizzle:migrate`
4. Update TypeScript types as needed

### Adding a New Page

1. Create folder: `pages/[route-name]/`
2. Add `+Page.tsx` - React component
3. Add `+data.ts` - SSR data fetching (optional)
4. Add `+guard.ts` - Auth protection (optional)
5. Add any page-specific components

### Adding Auth Protection

1. Page-level: Add `+guard.ts` with redirect logic
2. API-level: Check `ctx.clientSession` in tRPC procedure
3. Component-level: Use `usePageContext().clientSession` hook

---

## L) QUICK REFERENCE

### Important Files

- `server/server.ts` - Main server setup
- `backend/router/router.ts` - Main tRPC router
- `shared/database/drizzle/schema.ts` - Database schema
- `shared/trpc/server.ts` - tRPC setup
- `backend/auth/middleware.ts` - Auth middleware
- `pages/+config.ts` - Global Vike config
- `layouts/LayoutDefault.tsx` - Main layout

### Key Types/Interfaces

- `ClientSession` - Current user session data
- `Context` - tRPC context (db, clientSession, emailService)
- `ServerError` - Custom error class for backend
- `DatabaseClient` - Drizzle database client type

### Key Services

- `DatabaseClientService` - Effect service for database access
- `EmailService` - Email sending service (Nodemailer)

### Environment Variables

- `DATABASE_URL` - PostgreSQL connection string (required)
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - production | development
- `HMR_PORT` - Vite HMR port (default: 24678)

---

## M) SUMMARY FOR CHATGPT

**TLDR**: Lebsey is a full-stack multi-vendor e-commerce platform built with:

- **Frontend**: Vike (SSR) + React 19 + Tailwind + shadcn/ui
- **Backend**: Fastify + tRPC + PostgreSQL + Drizzle ORM
- **Auth**: Session-based with Oslo.js cryptography
- **Payment**: Fincart webhook integration
- **Special Features**: Dynamic template system, promo codes, vendor approval workflow

**Architecture**: Monolithic structure with domain-driven backend organization, Effect.js for functional error handling, filesystem-based routing (Vike), and type-safe API layer (tRPC).

**Current State**: Core features working (auth, products, orders, vendors), needs testing, better error handling, and feature expansion (templates, analytics, etc.).

**Your Role**: Understand this deeply, propose safe changes with minimal diffs, call out risks (auth, data loss, breaking changes, performance), and provide copy-paste-ready code aligned with existing patterns.

**When I ask for changes**: Follow the 6-part response format (Understanding → Impacted Areas → Plan → Code → Tests → Edge Cases). Always prioritize safety and consistency with existing codebase conventions.
