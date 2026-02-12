import React, { useState, useEffect } from "react";
import { Search, SlidersHorizontal, Grid3x3, List } from "lucide-react";
import { Link } from "#root/components/utils/Link";
import type { SortingPageProduct } from "./SortingToolbarTemplate";

/**
 * Props for SortingPremiumTemplate
 */
export interface SortingPremiumTemplateProps {
  products: SortingPageProduct[];
  isLoading?: boolean;
  emptyStateMessage?: string;

  // Sorting
  defaultSort?: string;
  onSortChange?: (value: string) => void;

  // Search
  showSearch?: boolean;
  searchPlaceholder?: string;
  defaultSearchValue?: string;
  onSearchChange?: (value: string) => void;

  // Filters
  showFiltersButton?: boolean;
  onOpenFilters?: () => void;

  // Grid configuration (3 or 4 columns for modern ecommerce)
  gridColumns?: 3 | 4;

  // Styling
  className?: string;
}

/**
 * Sort options - clear and commercial
 */
const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "New Arrivals" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
] as const;

/**
 * SortingPremiumTemplate Component
 *
 * Modern luxury ecommerce product browsing for Percé.
 * Balanced layout with clear functionality and premium aesthetics.
 */
export function SortingPremiumTemplate({
  products = [],
  isLoading = false,
  emptyStateMessage = "No products found",
  defaultSort = "featured",
  onSortChange,
  showSearch = true,
  searchPlaceholder = "Search products...",
  defaultSearchValue = "",
  onSearchChange,
  showFiltersButton = true,
  onOpenFilters,
  gridColumns = 3,
  className = "",
}: SortingPremiumTemplateProps) {
  const [currentSort, setCurrentSort] = useState(defaultSort);
  const [searchValue, setSearchValue] = useState(defaultSearchValue);
  const [debouncedSearch, setDebouncedSearch] = useState(defaultSearchValue);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue);
      if (onSearchChange) {
        onSearchChange(searchValue);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue, onSearchChange]);

  // Handle sort change
  const handleSortChange = (value: string) => {
    setCurrentSort(value);
    if (onSortChange) {
      onSortChange(value);
    }
  };

  // Get grid column classes
  const getGridColumns = () => {
    if (gridColumns === 3) {
      return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    }
    return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
  };

  return (
    <div className={`w-full min-h-screen bg-neutral-50 ${className}`}>
      {/* Modern Toolbar */}
      <div className='border-b border-neutral-200 bg-white'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-4'>
          {/* Desktop Toolbar */}
          <div className='hidden lg:flex items-center justify-between gap-4'>
            {/* Left: Result count */}
            <div className='text-sm text-neutral-600 font-medium min-w-[100px]'>
              {isLoading ? (
                <span className='inline-block h-5 w-24 bg-neutral-200 animate-pulse rounded' />
              ) : (
                <span>
                  {products.length}{" "}
                  {products.length === 1 ? "Product" : "Products"}
                </span>
              )}
            </div>

            {/* Center: Search */}
            {showSearch && (
              <div className='relative flex-1 max-w-lg'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400' />
                <input
                  type='text'
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className='w-full pl-10 pr-4 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all'
                />
              </div>
            )}

            {/* Right: Controls */}
            <div className='flex items-center gap-3'>
              {/* Sort Dropdown */}
              <select
                value={currentSort}
                onChange={(e) => handleSortChange(e.target.value)}
                className='px-4 py-2.5 text-sm bg-white border border-neutral-200 rounded-lg text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent cursor-pointer appearance-none pr-10 bg-no-repeat bg-right'
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23525252' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundPosition: "right 0.75rem center",
                }}>
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* View Toggle */}
              <div className='flex items-center border border-neutral-200 rounded-lg overflow-hidden'>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2.5 transition-colors ${
                    viewMode === "grid"
                      ? "bg-neutral-900 text-white"
                      : "bg-white text-neutral-600 hover:bg-neutral-50"
                  }`}>
                  <Grid3x3 className='h-4 w-4' />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2.5 transition-colors ${
                    viewMode === "list"
                      ? "bg-neutral-900 text-white"
                      : "bg-white text-neutral-600 hover:bg-neutral-50"
                  }`}>
                  <List className='h-4 w-4' />
                </button>
              </div>

              {/* Filters Button */}
              {showFiltersButton && onOpenFilters && (
                <button
                  onClick={onOpenFilters}
                  className='flex items-center gap-2 px-4 py-2.5 text-sm border border-neutral-200 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors'>
                  <SlidersHorizontal className='h-4 w-4' />
                  <span>Filters</span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile Toolbar */}
          <div className='lg:hidden space-y-3'>
            {/* Search Input */}
            {showSearch && (
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400' />
                <input
                  type='text'
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className='w-full pl-10 pr-4 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent'
                />
              </div>
            )}

            <div className='flex items-center gap-2'>
              {/* Sort */}
              <select
                value={currentSort}
                onChange={(e) => handleSortChange(e.target.value)}
                className='flex-1 px-3 py-2.5 text-sm bg-white border border-neutral-200 rounded-lg text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-900 cursor-pointer appearance-none pr-8 bg-no-repeat bg-right'
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23525252' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundPosition: "right 0.5rem center",
                }}>
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* Filters Button */}
              {showFiltersButton && onOpenFilters && (
                <button
                  onClick={onOpenFilters}
                  className='px-4 py-2.5 text-sm border border-neutral-200 rounded-lg text-neutral-700 hover:bg-neutral-50'>
                  <SlidersHorizontal className='h-4 w-4' />
                </button>
              )}
            </div>

            {/* Result Count */}
            <div className='text-sm text-neutral-600 text-center'>
              {isLoading ? (
                <span className='inline-block h-5 w-24 bg-neutral-200 animate-pulse rounded mx-auto' />
              ) : (
                <span>
                  {products.length}{" "}
                  {products.length === 1 ? "Product" : "Products"}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12'>
        {isLoading ? (
          // Loading State
          <div className={`grid ${getGridColumns()} gap-6`}>
            {Array.from({ length: gridColumns * 3 }).map((_, index) => (
              <div key={index} className='animate-pulse'>
                <div className='aspect-[3/4] bg-neutral-200 rounded-lg mb-4' />
                <div className='space-y-2'>
                  <div className='h-4 bg-neutral-200 rounded w-3/4' />
                  <div className='h-3 bg-neutral-200 rounded w-1/2' />
                  <div className='h-4 bg-neutral-200 rounded w-1/3' />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          // Empty State
          <div className='flex flex-col items-center justify-center py-16 px-4 text-center'>
            <div className='w-16 h-16 mb-4 rounded-lg bg-neutral-100 flex items-center justify-center'>
              <Search className='h-8 w-8 text-neutral-400' />
            </div>
            <h3 className='text-lg font-medium mb-2 text-neutral-900'>
              No Products Found
            </h3>
            <p className='text-sm text-neutral-500 max-w-md'>
              {emptyStateMessage}
            </p>
          </div>
        ) : (
          // Product Grid
          <div className={`grid ${getGridColumns()} gap-6`}>
            {products.map((product) => (
              <PremiumProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Premium Product Card Component
 *
 * Modern, clean card for luxury ecommerce
 */
interface PremiumProductCardProps {
  product: SortingPageProduct;
}

function PremiumProductCard({ product }: PremiumProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Get display image URL
  const getDisplayImageUrl = () => {
    if (product.images && product.images.length > 0) {
      const primaryImage = product.images.find((img) => img.isPrimary);
      return (
        primaryImage?.url ||
        product.images[0]?.url ||
        "/placeholder-product.png"
      );
    }
    return product.imageUrl || "/placeholder-product.png";
  };

  const displayImageUrl = getDisplayImageUrl();
  const hasDiscount =
    product.discountPrice &&
    Number(product.discountPrice) > 0 &&
    Number(product.discountPrice) < Number(product.price);

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(product.price));

  const formattedDiscountPrice = hasDiscount
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(Number(product.discountPrice))
    : null;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      <Link href={`/shop/${product.id}`} className='group block no-underline'>
        {/* Image Container */}
        <div className='relative mb-3 overflow-hidden rounded-lg bg-neutral-100'>
          <div className='aspect-[3/4] relative'>
            <img
              src={displayImageUrl}
              alt={product.name}
              className={`w-full h-full object-cover transition-transform duration-500 ${
                isHovered ? "scale-105" : "scale-100"
              }`}
              loading='lazy'
            />

            {/* Out of stock overlay */}
            {!product.available && (
              <div className='absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center'>
                <span className='text-xs font-medium uppercase tracking-wider text-neutral-600 bg-white px-3 py-1.5 rounded-md'>
                  Out of Stock
                </span>
              </div>
            )}

            {/* Subtle sale indicator */}
            {hasDiscount && product.available && (
              <div className='absolute top-3 right-3'>
                <span className='text-xs font-medium text-neutral-700 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-md'>
                  Sale
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className='space-y-1.5'>
          {/* Category */}
          {product.categoryName && (
            <p className='text-xs uppercase tracking-wider text-neutral-500 font-medium'>
              {product.categoryName}
            </p>
          )}

          {/* Product Name */}
          <h3 className='text-sm font-medium text-neutral-900 group-hover:text-neutral-600 transition-colors line-clamp-2'>
            {product.name}
          </h3>

          {/* Price */}
          <div className='flex items-baseline gap-2 pt-0.5'>
            {hasDiscount ? (
              <>
                <span className='text-sm font-semibold text-neutral-900'>
                  {formattedDiscountPrice}
                </span>
                <span className='text-sm text-neutral-400 line-through'>
                  {formattedPrice}
                </span>
              </>
            ) : (
              <span className='text-sm font-semibold text-neutral-900'>
                {formattedPrice}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
