Generated with [vike.dev/new](https://vike.dev/new) ([version 405](https://www.npmjs.com/package/create-vike/v/0.0.405)) using this command:

```sh
pnpm create vike@latest --react --trpc --hono --drizzle --biome
```

## Contents

- [_Drizzle_](#drizzle)
- [Single Shop Mode](#single-shop-mode)

- [React](#react)
  - [`/pages/+config.ts`](#pagesconfigts)
  - [Routing](#routing)
  - [`/pages/_error/+Page.jsx`](#pages_errorpagejsx)
  - [`/pages/+onPageTransitionStart.ts` and `/pages/+onPageTransitionEnd.ts`](#pagesonpagetransitionstartts-and-pagesonpagetransitionendts)
  - [SSR](#ssr)
  - [HTML Streaming](#html-streaming)

## _Drizzle_

First, ensure that `DATABASE_URL` is configured in `.env` file, then create the database:

```bash
pnpm drizzle:generate # a script that executes drizzle-kit generate.
pnpm drizzle:migrate # a script that executes drizzle-kit migrate.
```

> \[!NOTE]
> The `drizzle-kit generate` command is used to generate SQL migration files based on your Drizzle schema.
>
> The `drizzle-kit migrate` command is used to apply the generated migrations to your database.

Read more on [Drizzle ORM documentation](https://orm.drizzle.team/docs/overview)

## Single-Shop E-Commerce Template

**Lebsy Shop** is a ready-to-use single-shop e-commerce template designed for selling as a digital product.

### Key Features

- ✅ **Admin-Only Dashboard** - Complete control over products, orders, and store settings
- ✅ **Template System** - Customizable page layouts for homepage, categories, products, cart, and checkout
- ✅ **Modern Stack** - Built with Vike (SSR), React 19, tRPC, PostgreSQL, and Tailwind CSS
- ✅ **Production-Ready** - Authentication, payments (Fincart), orders, reviews, and promo codes
- ✅ **Clean Architecture** - Well-organized codebase ready for customization

### Architecture

- **Single Store Model** - Admin manages all products and orders
- **No Vendor Features** - No vendor registration, approval, or multi-vendor logic
- **Type-Safe API** - Full-stack type safety with tRPC
- **Modern UI** - shadcn/ui components with responsive design

**Perfect For**: Digital product marketplaces (CodeCanyon, Gumroad) or businesses needing a clean, customizable single-shop e-commerce solution.

## React

This app is ready to start. It's powered by [Vike](https://vike.dev) and [React](https://react.dev/learn).

### `/pages/+config.ts`

Such `+` files are [the interface](https://vike.dev/config) between Vike and your code. It defines:

- A default [`<Layout>` component](https://vike.dev/Layout) (that wraps your [`<Page>` components](https://vike.dev/Page)).
- A default [`title`](https://vike.dev/title).
- Global [`<head>` tags](https://vike.dev/head-tags).

### Routing

[Vike's built-in router](https://vike.dev/routing) lets you choose between:

- [Filesystem Routing](https://vike.dev/filesystem-routing) (the URL of a page is determined based on where its `+Page.jsx` file is located on the filesystem)
- [Route Strings](https://vike.dev/route-string)
- [Route Functions](https://vike.dev/route-function)

### `/pages/_error/+Page.jsx`

The [error page](https://vike.dev/error-page) which is rendered when errors occur.

### `/pages/+onPageTransitionStart.ts` and `/pages/+onPageTransitionEnd.ts`

The [`onPageTransitionStart()` hook](https://vike.dev/onPageTransitionStart), together with [`onPageTransitionEnd()`](https://vike.dev/onPageTransitionEnd), enables you to implement page transition animations.

### SSR

SSR is enabled by default. You can [disable it](https://vike.dev/ssr) for all your pages or only for some pages.

### HTML Streaming

You can enable/disable [HTML streaming](https://vike.dev/stream) for all your pages, or only for some pages while still using it for others.
