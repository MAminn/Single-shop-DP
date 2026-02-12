import type React from "react";
import { HomeFeaturedProducts } from "./home/HomeFeaturedProducts";
import type { HomeFeaturedProductsProps } from "./home/HomeFeaturedProducts";
import { ModernHomeTemplateV2 } from "./home/ModernHomeTemplateV2";
import type { ModernHomeTemplateV2Props } from "./home/ModernHomeTemplateV2";
import { LandingTemplateModern } from "./landing/LandingTemplateModern";
import type { LandingTemplateModernProps } from "./landing/LandingTemplateModern";
import { LandingTemplateClassic } from "./landing/LandingTemplateClassic";
import type { LandingTemplateClassicProps } from "./landing/LandingTemplateClassic";
import { LandingTemplateEditorial } from "./landing/LandingTemplateEditorial";
import type { LandingTemplateEditorialProps } from "./landing/LandingTemplateEditorial";
import { LandingTemplateMinimal } from "./landing/LandingTemplateMinimal";
import type { LandingTemplateMinimalProps } from "./landing/LandingTemplateMinimal";
import { ProductPageModernSplit } from "./productPage/ProductPageModernSplit";
import type { ProductPageModernSplitProps } from "./productPage/ProductPageModernSplit";
import { ProductPageClassic } from "./productPage/ProductPageClassic";
import type { ProductPageClassicProps } from "./productPage/ProductPageClassic";
import { ProductPageEditorial } from "./productPage/ProductPageEditorial";
import type { ProductPageEditorialProps } from "./productPage/ProductPageEditorial";
import { ProductPageTechnical } from "./productPage/ProductPageTechnical";
import type { ProductPageTechnicalProps } from "./productPage/ProductPageTechnical";
import { ProductPageMinimal } from "./productPage/ProductPageMinimal";
import type { ProductPageMinimalProps } from "./productPage/ProductPageMinimal";
import { CategoryPageGridWithFilters } from "./categoryPage/CategoryPageGridWithFilters";
import type { CategoryPageGridWithFiltersProps } from "./categoryPage/CategoryPageGridWithFilters";
import { CategoryGridClassic } from "./categoryPage/CategoryGridClassic";
import type { CategoryGridClassicProps } from "./categoryPage/CategoryGridClassic";
import { CategoryHeroSplit } from "./categoryPage/CategoryHeroSplit";
import type { CategoryHeroSplitProps } from "./categoryPage/CategoryHeroSplit";
import { CategoryMinimal } from "./categoryPage/CategoryMinimal";
import type { CategoryMinimalProps } from "./categoryPage/CategoryMinimal";
import { CategoryShowcase } from "./categoryPage/CategoryShowcase";
import type { CategoryShowcaseProps } from "./categoryPage/CategoryShowcase";
import { SortingToolbarTemplate } from "./sorting/SortingToolbarTemplate";
import type { SortingToolbarTemplateProps } from "./sorting/SortingToolbarTemplate";
import { SortingGalleryTemplate } from "./sorting/SortingGalleryTemplate";
import type { SortingGalleryTemplateProps } from "./sorting/SortingGalleryTemplate";
import { SortingPremiumTemplate } from "./sorting/SortingPremiumTemplate";
import type { SortingPremiumTemplateProps } from "./sorting/SortingPremiumTemplate";
import { CartPageModernTemplate } from "./cartPage/CartPageModernTemplate";
import type { CartPageModernTemplateProps } from "./cartPage/CartPageModernTemplate";
import { CheckoutPageModernTemplate } from "./checkoutPage/CheckoutPageModernTemplate";
import type { CheckoutPageModernTemplateProps } from "./checkoutPage/CheckoutPageModernTemplate";
import { SearchResultsGrid } from "./searchResults/SearchResultsGrid";
import type { SearchResultsGridProps } from "./searchResults/SearchResultsGrid";
import { SearchResultsMinimal } from "./searchResults/SearchResultsMinimal";
import type { SearchResultsMinimalProps } from "./searchResults/SearchResultsMinimal";

// Import preview components
import {
  LandingModernPreview,
  LandingClassicPreview,
  LandingEditorialPreview,
  LandingMinimalPreview,
} from "./previews/LandingPreviews";
import {
  ProductPageClassicPreview,
  ProductPageEditorialPreview,
  ProductPageTechnicalPreview,
  ProductPageMinimalPreview,
  ProductPageModernSplitPreview,
} from "./previews/ProductPagePreviews";
import {
  CategoryGridClassicPreview,
  CategoryHeroSplitPreview,
  CategoryMinimalPreview,
  CategoryShowcasePreview,
  CategoryGridWithFiltersPreview,
} from "./previews/CategoryPagePreviews";
import {
  HomeFeaturedProductsPreview,
  ModernHomeTemplateV2Preview,
  SearchResultsGridPreview,
  SearchResultsMinimalPreview,
  SortingToolbarPreview,
  CartPageModernPreview,
  CheckoutPageModernPreview,
} from "./previews/OtherPreviews";

/**
 * Template System Configuration
 *
 * Central registry for all template components in the system.
 * Provides type-safe access to template components by category and ID.
 */

// Define valid template categories
export type TemplateCategory =
  | "landing"
  | "home"
  | "sorting"
  | "productPage"
  | "categoryPage"
  | "cartPage"
  | "checkoutPage"
  | "searchResults";

// Define the structure for a template entry
export interface TemplateEntry<TProps = any> {
  id: string;
  label: string;
  component: React.FC<TProps>;
  previewComponent: React.FC; // Preview-safe component for admin
}

// Define the structure for the entire template config
export interface TemplateConfig {
  landing: TemplateEntry[];
  home: TemplateEntry[];
  sorting: TemplateEntry[];
  productPage: TemplateEntry[];
  categoryPage: TemplateEntry[];
  cartPage: TemplateEntry[];
  checkoutPage: TemplateEntry[];
  searchResults: TemplateEntry[];
}

/**
 * Template Registry
 *
 * Centralized configuration for all available templates.
 * Add new templates here to make them available throughout the application.
 */
export const templateConfig: TemplateConfig = {
  landing: [
    {
      id: "landing-modern",
      label: "Demo 1: Modern (Blue Gradient)",
      component: LandingTemplateModern as React.FC<LandingTemplateModernProps>,
      previewComponent: LandingModernPreview,
    },
    {
      id: "landing-classic",
      label: "Demo 2: Classic (Commerce-First)",
      component:
        LandingTemplateClassic as React.FC<LandingTemplateClassicProps>,
      previewComponent: LandingClassicPreview,
    },
    {
      id: "landing-editorial",
      label: "Demo 3: Editorial (Premium Luxury)",
      component:
        LandingTemplateEditorial as React.FC<LandingTemplateEditorialProps>,
      previewComponent: LandingEditorialPreview,
    },
    {
      id: "landing-minimal",
      label: "Demo 4: Minimal (Typography-First)",
      component:
        LandingTemplateMinimal as React.FC<LandingTemplateMinimalProps>,
      previewComponent: LandingMinimalPreview,
    },
  ],

  home: [
    {
      id: "featured-products-modern",
      label: "Featured Products (Modern)",
      component: HomeFeaturedProducts as React.FC<HomeFeaturedProductsProps>,
      previewComponent: HomeFeaturedProductsPreview,
    },
    {
      id: "home-modern-v2",
      label: "Modern Home Template V2",
      component: ModernHomeTemplateV2 as React.FC<ModernHomeTemplateV2Props>,
      previewComponent: ModernHomeTemplateV2Preview,
    },
  ],

  sorting: [
    {
      id: "sorting-premium",
      label: "Premium Modern (Recommended)",
      component:
        SortingPremiumTemplate as React.FC<SortingPremiumTemplateProps>,
      previewComponent: SortingToolbarPreview,
    },
    {
      id: "sorting-gallery",
      label: "Gallery (Editorial)",
      component:
        SortingGalleryTemplate as React.FC<SortingGalleryTemplateProps>,
      previewComponent: SortingToolbarPreview,
    },
    {
      id: "sorting-toolbar",
      label: "Toolbar (Basic)",
      component:
        SortingToolbarTemplate as React.FC<SortingToolbarTemplateProps>,
      previewComponent: SortingToolbarPreview,
    },
  ],

  productPage: [
    {
      id: "product-classic",
      label: "Demo 1: Classic (Conversion-Focused)",
      component: ProductPageClassic as React.FC<ProductPageClassicProps>,
      previewComponent: ProductPageClassicPreview,
    },
    {
      id: "product-editorial",
      label: "Demo 2: Editorial (Luxury Storytelling)",
      component: ProductPageEditorial as React.FC<ProductPageEditorialProps>,
      previewComponent: ProductPageEditorialPreview,
    },
    {
      id: "product-technical",
      label: "Demo 3: Technical (Specs-First)",
      component: ProductPageTechnical as React.FC<ProductPageTechnicalProps>,
      previewComponent: ProductPageTechnicalPreview,
    },
    {
      id: "product-minimal",
      label: "Demo 4: Minimal (Premium Clean)",
      component: ProductPageMinimal as React.FC<ProductPageMinimalProps>,
      previewComponent: ProductPageMinimalPreview,
    },
    {
      id: "product-modern-split",
      label: "Modern Split Layout (Legacy)",
      component:
        ProductPageModernSplit as React.FC<ProductPageModernSplitProps>,
      previewComponent: ProductPageModernSplitPreview,
    },
  ],

  categoryPage: [
    {
      id: "category-grid-classic",
      label: "Classic Grid Layout",
      component: CategoryGridClassic as React.FC<CategoryGridClassicProps>,
      previewComponent: CategoryGridClassicPreview,
    },
    {
      id: "category-hero-split",
      label: "Hero Split Layout",
      component: CategoryHeroSplit as React.FC<CategoryHeroSplitProps>,
      previewComponent: CategoryHeroSplitPreview,
    },
    {
      id: "category-minimal",
      label: "Minimal Layout",
      component: CategoryMinimal as React.FC<CategoryMinimalProps>,
      previewComponent: CategoryMinimalPreview,
    },
    {
      id: "category-showcase",
      label: "Showcase Layout",
      component: CategoryShowcase as React.FC<CategoryShowcaseProps>,
      previewComponent: CategoryShowcasePreview,
    },
    {
      id: "category-grid-with-filters",
      label: "Category Grid with Filters (Legacy)",
      component:
        CategoryPageGridWithFilters as React.FC<CategoryPageGridWithFiltersProps>,
      previewComponent: CategoryGridWithFiltersPreview,
    },
  ],

  cartPage: [
    {
      id: "cart-modern",
      label: "Modern Cart Page",
      component:
        CartPageModernTemplate as React.FC<CartPageModernTemplateProps>,
      previewComponent: CartPageModernPreview,
    },
  ],

  checkoutPage: [
    {
      id: "checkout-modern",
      label: "Modern Checkout Page",
      component:
        CheckoutPageModernTemplate as React.FC<CheckoutPageModernTemplateProps>,
      previewComponent: CheckoutPageModernPreview,
    },
  ],

  searchResults: [
    {
      id: "search-results-grid",
      label: "Grid Layout (Standard)",
      component: SearchResultsGrid as React.FC<SearchResultsGridProps>,
      previewComponent: SearchResultsGridPreview,
    },
    {
      id: "search-results-minimal",
      label: "Minimal Layout (Clean)",
      component: SearchResultsMinimal as React.FC<SearchResultsMinimalProps>,
      previewComponent: SearchResultsMinimalPreview,
    },
  ],
};

/**
 * Get a template component by category and ID
 *
 * @param category - The template category
 * @param id - The unique template ID
 * @returns The template entry or undefined if not found
 */
export function getTemplateComponent(
  category: TemplateCategory,
  id: string,
): TemplateEntry | undefined {
  const categoryTemplates = templateConfig[category];
  return categoryTemplates.find((template) => template.id === id);
}

/**
 * Get all templates for a specific category
 *
 * @param category - The template category
 * @returns Array of template entries for the category
 */
export function getTemplatesByCategory(
  category: TemplateCategory,
): TemplateEntry[] {
  return templateConfig[category] || [];
}

/**
 * Check if a template exists
 *
 * @param category - The template category
 * @param id - The unique template ID
 * @returns True if the template exists
 */
export function templateExists(
  category: TemplateCategory,
  id: string,
): boolean {
  return getTemplateComponent(category, id) !== undefined;
}

/**
 * Get all available template IDs for a category
 *
 * @param category - The template category
 * @returns Array of template IDs
 */
export function getTemplateIds(category: TemplateCategory): string[] {
  return templateConfig[category].map((template) => template.id);
}
