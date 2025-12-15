/**
 * Vendor Shop Templates
 *
 * This module exports vendor shop page templates for displaying
 * individual vendor storefronts with their product catalogs.
 *
 * Available Templates:
 * - VendorShopGrid: Standard marketplace layout with sidebar
 * - VendorShopList: Catalog-heavy list view for many products
 * - VendorShopMinimal: Premium brand-focused minimal design
 */

export { VendorShopGrid } from "./VendorShopGrid";
export type {
  VendorShopGridProps,
  VendorShopVendor,
  VendorShopProduct,
} from "./VendorShopGrid";

export { VendorShopList } from "./VendorShopList";
export type { VendorShopListProps } from "./VendorShopList";

export { VendorShopMinimal } from "./VendorShopMinimal";
export type { VendorShopMinimalProps } from "./VendorShopMinimal";
