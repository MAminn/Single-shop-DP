import { viewCategories } from "#root/backend/categories/view-categories/service";
import {
  viewProducts,
  type viewProductsSchema,
} from "#root/backend/products/view-products/service";
import { viewVendors } from "#root/backend/vendor/view-vendors/service";
import {
  runBackendEffect,
  serializeBackendEffectResult,
} from "#root/shared/backend/effect";
import { DatabaseClientService } from "#root/shared/database/drizzle/db";
import { Effect } from "effect";
import type { PageContext } from "vike/types";
import type { z } from "zod";

// Define valid sort keys based on the backend schema
type SortByType = z.infer<typeof viewProductsSchema>["sortBy"];
const validSortByKeys: ReadonlyArray<SortByType> = ["name", "price", "stock"];

// Default number of products per page
const DEFAULT_LIMIT = 10;

export async function data(ctx: PageContext) {
  const session = ctx.clientSession;

  if (!session) {
    return {
      success: false,
      error: "Unauthorized",
    } as const;
  }

  // Parse page and limit from URL query, providing defaults
  const currentPage =
    Number.parseInt(ctx.urlParsed.search.page || "1", 10) || 1;
  const limit =
    Number.parseInt(ctx.urlParsed.search.limit || String(DEFAULT_LIMIT), 10) ||
    DEFAULT_LIMIT;
  const offset = (currentPage - 1) * limit;

  const getVendorId = () => {
    if (session.role === "vendor") {
      return session.vendorId;
    }

    if (ctx.urlParsed.search.vendorId) {
      return ctx.urlParsed.search.vendorId;
    }
  };

  const getCategoryId = () => {
    if (ctx.urlParsed.search.categoryId) {
      return ctx.urlParsed.search.categoryId;
    }
  };

  // --- REAL BACKEND LOGIC --- //
  // Validate sortBy parameter
  const sortByInput = ctx.urlParsed.search.sortBy;
  const validatedSortBy = validSortByKeys.includes(sortByInput as SortByType)
    ? (sortByInput as SortByType)
    : undefined; // Default to undefined if invalid

  const viewProductsResult = await runBackendEffect(
    viewProducts({
      vendorId: getVendorId(),
      categoryId: getCategoryId(),
      offset,
      limit,
      // Pass search and sortBy if needed by backend
      search: ctx.urlParsed.search.search,
      sortBy: validatedSortBy, // Pass validated value
    }).pipe(Effect.provideService(DatabaseClientService, ctx.db))
  ).then(serializeBackendEffectResult);

  if (!viewProductsResult.success) {
    return viewProductsResult;
  }

  const { products, totalCount } = viewProductsResult.result;
  const totalPages = Math.ceil(totalCount / limit);

  const viewCategoriesResult = await runBackendEffect(
    viewCategories().pipe(Effect.provideService(DatabaseClientService, ctx.db))
  ).then(serializeBackendEffectResult);

  if (!viewCategoriesResult.success) {
    return viewCategoriesResult;
  }

  let vendors = [] as { id: string; name: string }[];

  if (ctx.clientSession?.role === "admin") {
    const viewVendorsResult = await runBackendEffect(
      viewVendors({}, ctx.clientSession).pipe(
        Effect.provideService(DatabaseClientService, ctx.db)
      )
    ).then(serializeBackendEffectResult);

    if (!viewVendorsResult.success) {
      return viewVendorsResult;
    }

    vendors = viewVendorsResult.result;
  }

  return {
    success: true,
    vendorId: getVendorId(),
    categoryId: getCategoryId(),
    vendors,
    categories: viewCategoriesResult.result,
    products,
    totalPages,
    currentPage,
    limit,
  } as const;
}

export type Data = Awaited<ReturnType<typeof data>>;
