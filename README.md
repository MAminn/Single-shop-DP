# Lebsy Shop — Single-Shop E-Commerce Template

A production-ready, fully-featured single-shop e-commerce template built with **React 19**, **Fastify 5**, **tRPC**, **Drizzle ORM**, and **Tailwind CSS 4**. Designed for developers who want a clean, modern, and extensible store — ready to customize and ship.

---

## Features

### Storefront
- **22 swappable templates** across 8 categories — homepage, product pages, category pages, cart, checkout, search results, and more
- **Full product catalog** with images, descriptions, pricing, discounts, and stock management
- **Hierarchical categories** — main categories with subcategories, Men/Women collections
- **Shopping cart** with promo code support (percentage & fixed discounts)
- **Checkout flow** with order confirmation page
- **Customer order history** at `/orders`
- **Product search** — navbar search bar + dedicated search results page with sorting & pagination
- **Mobile responsive** — sheet-based mobile menu, responsive layouts throughout

### Admin Dashboard
- **Product CRUD** — create, edit, delete products with multi-image uploads
- **Order management** — view orders, update status (pending → processing → shipped → delivered)
- **Category management** — hierarchical CRUD with main/subcategory support
- **Promo codes** — full CRUD with validation, usage limits, date ranges
- **Homepage CMS** — drag-and-drop sections: hero, brand statement, promo banner, featured products, value props, newsletter, footer CTA
- **Category content CMS** — editable content per category
- **Template switcher** — choose and preview templates with device-frame preview
- **Pixel tracking dashboard** — multi-platform ad pixel configuration (Meta, Google GA4, TikTok, Snapchat, Pinterest)
- **Analytics dashboard** — conversion funnel, channel breakdown, platform health

### Technical
- **Full-stack type safety** — tRPC v10 with SuperJSON, end-to-end TypeScript
- **SSR** — Vike 0.4 with server-side rendering and client-side hydration
- **Effect-TS** — functional error handling in backend services
- **Auth** — login, register, email verification, JWT sessions, admin-only dashboard guard
- **Email** — order confirmation + admin notification emails via SMTP (React Email templates)
- **Shipping integration** — Fincart API with webhook status updates
- **Pixel tracking** — client-side + server-side event tracking with consent management (GDPR)
- **Docker** — PostgreSQL compose file for local development

---

## Quick Start

### Prerequisites
- **Node.js ≥ 22**
- **pnpm** (recommended) or npm
- **Docker** (for PostgreSQL) or a remote PostgreSQL instance

### 1. Clone & install

```bash
git clone <your-repo-url>
cd lebsy-shop
pnpm install
```

### 2. Set up environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SINGLE_SHOP_MODE` | Yes | Set to `true` |
| `ADMIN_EMAIL` | Yes | Admin account email |
| `ADMIN_PASSWORD` | Yes | Admin account password |
| `JWT_SECRET` | Yes | 64-character hex string for JWT signing |
| `SMTP_HOST` | Yes | SMTP server (e.g. `smtp.gmail.com`) |
| `SMTP_PORT` | Yes | SMTP port (e.g. `587`) |
| `SMTP_USER` | Yes | SMTP username |
| `SMTP_PASSWORD` | Yes | SMTP password or app password |
| `FINCART_API_KEY` | Optional | Fincart shipping API key |
| `FINCART_WEBHOOK_SECRET` | Optional | Fincart webhook verification secret |
| `FINCART_PICKUP_ID` | Optional | Fincart pickup location ID |

### 3. Start the database

```bash
docker compose up -d
```

### 4. Run migrations

```bash
pnpm drizzle:generate
pnpm drizzle:migrate
```

### 5. Start the dev server

```bash
pnpm dev
```

Visit **http://localhost:3000**. An admin account is auto-seeded using `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

---

## Project Structure

```
├── backend/           # tRPC procedures & business logic (Effect-TS)
│   ├── auth/          # Login, register, verify email, sessions
│   ├── categories/    # Category CRUD & content management
│   ├── orders/        # Order CRUD, email templates, Fincart webhook
│   ├── pixel-tracking/ # Multi-platform pixel tracking
│   ├── products/      # Product CRUD, search
│   └── promo-codes/   # Promo code CRUD & validation
├── components/
│   ├── dashboard/     # Admin dashboard components
│   ├── globals/       # Navbar, Footer
│   ├── shop/          # Product cards, category strips
│   ├── template-system/ # 22 swappable templates
│   └── ui/            # shadcn/ui primitives
├── frontend/          # Client-side contexts, pixel adapters, tracking
├── pages/             # Vike file-system routes
│   ├── checkout/      # Checkout flow
│   ├── dashboard/     # Admin dashboard (admin/, categories, products, orders)
│   ├── featured/      # Men, Women, Products, Brands collections
│   ├── order-confirmation/ # Post-checkout confirmation
│   ├── orders/        # Customer order history
│   └── search/        # Search results page
├── server/            # Fastify server, plugins, middleware
├── shared/            # Database schema, tRPC router, config, utils
└── uploads/           # User-uploaded images
```

---

## Template System

The template system is the core selling point. Admins can switch templates per category from the dashboard without touching code.

| Category | Templates | Description |
|----------|-----------|-------------|
| Landing | 4 | modern, editorial, classic, minimal |
| Home | 2 | featured products, modern v2 |
| Product Page | 5 | perce, classic, editorial, technical, minimal |
| Category Page | 4 | grid-classic, hero-split, minimal, showcase |
| Cart | 1 | modern |
| Checkout | 1 | modern |
| Search Results | 2 | grid, minimal |
| Sorting/Collection | 1 | minimal |

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server with hot reload |
| `pnpm build` | Production build (unbuild + Vike build) |
| `pnpm start` | Start production server |
| `pnpm test` | Run tests with Vitest |
| `pnpm typecheck` | TypeScript type checking |
| `pnpm lint` | Lint with Biome |
| `pnpm format` | Format with Biome |
| `pnpm drizzle:generate` | Generate database migrations |
| `pnpm drizzle:migrate` | Apply database migrations |
| `pnpm drizzle:studio` | Open Drizzle Studio (DB GUI) |

---

## Configuration

### Store Settings (`.env`)

- **`SINGLE_SHOP_MODE=true`** — Required. Ensures the store runs in single-shop mode.
- **`STORE_OWNER_ID`** — Optional. Auto-generated store owner UUID for DB foreign key constraints.
- **`VITE_SINGLE_SHOP_MODE=true`** — Client-side flag for conditional UI rendering.

### Customization

- **Brand name** — Set `VITE_STORE_NAME` in `.env` (defaults to store name). Update `<title>` in `pages/+config.ts`.
- **Currency** — Set `VITE_CURRENCY` in `.env` (defaults to `EGP`).
- **Social links** — Configure in the Footer component props or via CMS.
- **Templates** — Switch templates from the admin dashboard at `/dashboard/admin/templates`.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Tailwind CSS 4, shadcn/ui, Framer Motion |
| SSR Framework | Vike 0.4 |
| API | tRPC v10 with SuperJSON |
| Server | Fastify 5 |
| Database | PostgreSQL + Drizzle ORM |
| Backend Logic | Effect-TS |
| Auth | JWT sessions + cookie-based auth |
| Email | React Email + SMTP |
| Shipping | Fincart API |
| Analytics | Custom pixel tracking (Meta, GA4, TikTok, Snapchat, Pinterest) |
| Build | Vite 6, unbuild, tsx |
| Testing | Vitest |
| Linting | Biome |

---

## License

[MIT](./LICENSE)
