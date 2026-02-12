import React, { useState, useEffect } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Link } from "#root/components/utils/Link";
import type { SortingPageProduct } from "./SortingToolbarTemplate";

/**
 * Props for SortingGalleryTemplate
 */
export interface SortingGalleryTemplateProps {
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

  // Grid configuration (2 or 3 columns max for editorial feel)
  gridColumns?: 2 | 3;

  // Styling
  className?: string;
}

/**
 * Sort options - calm, editorial labeling
 */
const SORT_OPTIONS = [
  { value: "featured", label: "Curated" },
  { value: "newest", label: "New Arrivals" },
  { value: "price-asc", label: "Price Ascending" },
  { value: "price-desc", label: "Price Descending" },
] as const;

/**
 * SortingGalleryTemplate Component
 *
 * An editorial, gallery-like product browsing experience for Percé.
 * Designed to feel like a curated private collection, not a marketplace.
 */
export function SortingGalleryTemplate({
  products = [],
  isLoading = false,
  emptyStateMessage = "No pieces available in this collection",
  defaultSort = "featured",
  onSortChange,
  showSearch = true,
  searchPlaceholder = "Search collection...",
  defaultSearchValue = "",
  onSearchChange,
  showFiltersButton = false,
  onOpenFilters,
  gridColumns = 2,
  className = "",
}: SortingGalleryTemplateProps) {
  const [currentSort, setCurrentSort] = useState(defaultSort);
  const [searchValue, setSearchValue] = useState(defaultSearchValue);
  const [debouncedSearch, setDebouncedSearch] = useState(defaultSearchValue);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue);
      if (onSearchChange) {
        onSearchChange(searchValue);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchValue, onSearchChange]);

  // Handle sort change
  const handleSortChange = (value: string) => {
    setCurrentSort(value);
    if (onSortChange) {
      onSortChange(value);
    }
  };

  // Get grid column classes - max 2-3 columns
  const getGridColumns = () => {
    if (gridColumns === 2) {
      return "grid-cols-1 lg:grid-cols-2";
    }
    return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
  };

  return (
    <div
      className={`w-full min-h-screen bg-stone-50 ${className}`}
      style={{ backgroundColor: "#faf9f7" }}>
      {/* De-emphasized Toolbar */}
      <div className='border-b border-stone-200/50 bg-stone-50/50 backdrop-blur-sm'>
        <div className='container mx-auto px-6 sm:px-8 lg:px-12 py-6 lg:py-8'>
          {/* Desktop Toolbar */}
          <div className='hidden lg:flex items-center justify-between gap-8'>
            {/* Left: Result count - very subtle */}
            <div className='text-xs uppercase tracking-wider text-stone-400 font-light'>
              {isLoading ? (
                <span className='inline-block h-4 w-20 bg-stone-200/50 animate-pulse rounded' />
              ) : (
                <span>
                  {products.length} {products.length === 1 ? "piece" : "pieces"}
                </span>
              )}
            </div>

            {/* Center: Search - minimal, low contrast */}
            {showSearch && (
              <div className='relative flex-1 max-w-sm'>
                <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-300' />
                <input
                  type='text'
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className='w-full pl-11 pr-4 py-2.5 text-sm bg-transparent border border-stone-200/60 rounded-full text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-stone-300 transition-colors'
                />
              </div>
            )}

            {/* Right: Sort & Filters - subtle */}
            <div className='flex items-center gap-4'>
              {/* Sort Dropdown */}
              <select
                value={currentSort}
                onChange={(e) => handleSortChange(e.target.value)}
                className='px-4 py-2 text-sm bg-transparent border border-stone-200/60 rounded-full text-stone-600 focus:outline-none focus:border-stone-300 transition-colors cursor-pointer appearance-none pr-8 bg-no-repeat bg-right'
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%2378716c' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundPosition: "right 0.75rem center",
                }}>
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* Filters Button (Optional) */}
              {showFiltersButton && onOpenFilters && (
                <button
                  onClick={onOpenFilters}
                  className='flex items-center gap-2 px-4 py-2 text-sm border border-stone-200/60 rounded-full text-stone-600 hover:border-stone-300 transition-colors'>
                  <SlidersHorizontal className='h-3.5 w-3.5' />
                  <span>Refine</span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile Toolbar */}
          <div className='lg:hidden space-y-4'>
            {/* Search Input */}
            {showSearch && (
              <div className='relative'>
                <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-300' />
                <input
                  type='text'
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className='w-full pl-11 pr-4 py-2.5 text-sm bg-transparent border border-stone-200/60 rounded-full text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-stone-300 transition-colors'
                />
              </div>
            )}

            <div className='flex items-center gap-3'>
              {/* Sort Dropdown */}
              <select
                value={currentSort}
                onChange={(e) => handleSortChange(e.target.value)}
                className='flex-1 px-4 py-2 text-sm bg-transparent border border-stone-200/60 rounded-full text-stone-600 focus:outline-none focus:border-stone-300 transition-colors cursor-pointer appearance-none pr-8 bg-no-repeat bg-right'
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%2378716c' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundPosition: "right 0.75rem center",
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
                  className='px-4 py-2 text-sm border border-stone-200/60 rounded-full text-stone-600 hover:border-stone-300 transition-colors'>
                  <SlidersHorizontal className='h-4 w-4' />
                </button>
              )}
            </div>

            {/* Result Count on Mobile */}
            <div className='text-xs uppercase tracking-wider text-stone-400 font-light text-center'>
              {isLoading ? (
                <span className='inline-block h-4 w-20 bg-stone-200/50 animate-pulse rounded mx-auto' />
              ) : (
                <span>
                  {products.length} {products.length === 1 ? "piece" : "pieces"}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Product Gallery */}
      <div className='container mx-auto px-6 sm:px-8 lg:px-12 py-12 lg:py-16'>
        {isLoading ? (
          // Loading State
          <div className={`grid ${getGridColumns()} gap-8 lg:gap-12`}>
            {Array.from({ length: gridColumns * 2 }).map((_, index) => (
              <div key={index} className='animate-pulse'>
                <div
                  className='aspect-[3/4] bg-stone-200/50 rounded mb-6'
                  style={{ borderRadius: "2px" }}
                />
                <div className='space-y-3 px-2'>
                  <div className='h-4 bg-stone-200/50 rounded w-3/4' />
                  <div className='h-3 bg-stone-200/50 rounded w-1/3' />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          // Empty State - intentional, calm
          <div className='flex flex-col items-center justify-center py-24 px-4 text-center'>
            <div className='max-w-md'>
              <h3 className='text-lg font-light mb-3 text-stone-600 tracking-wide'>
                No Pieces Found
              </h3>
              <p className='text-sm text-stone-400 leading-relaxed'>
                {emptyStateMessage}
              </p>
            </div>
          </div>
        ) : (
          // Product Gallery Grid
          <div className={`grid ${getGridColumns()} gap-8 lg:gap-12`}>
            {products.map((product) => (
              <GalleryProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Gallery Product Card Component
 *
 * Editorial, minimal card for the gallery grid
 */
interface GalleryProductCardProps {
  product: SortingPageProduct;
}

function GalleryProductCard({ product }: GalleryProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

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
    <Link
      href={`/shop/${product.id}`}
      className='group block no-underline transition-opacity hover:opacity-95 duration-500'>
      {/* Image Container */}
      <div className='relative mb-6 overflow-hidden bg-stone-100/50'>
        <div className='aspect-[3/4]' style={{ borderRadius: "2px" }}>
          <img
            src={displayImageUrl}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-700 ${
              imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
            } group-hover:scale-[1.02]`}
            loading='lazy'
            onLoad={() => setImageLoaded(true)}
          />

          {/* Subtle out of stock overlay */}
          {!product.available && (
            <div className='absolute inset-0 bg-stone-900/20 backdrop-blur-[2px] flex items-center justify-center'>
              <span className='text-xs uppercase tracking-widest text-white font-light'>
                Unavailable
              </span>
            </div>
          )}

          {/* Very subtle discount indicator - no red badges */}
          {hasDiscount && product.available && (
            <div className='absolute top-4 right-4'>
              <span className='text-[10px] uppercase tracking-widest text-stone-500 bg-stone-50/90 backdrop-blur-sm px-2 py-1 rounded-full font-light'>
                Sale
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Product Info - minimal, editorial */}
      <div className='px-2 space-y-2'>
        {/* Product Name - refined, not bold */}
        <h3 className='text-base font-normal text-stone-800 tracking-wide leading-snug group-hover:text-stone-600 transition-colors duration-300'>
          {product.name}
        </h3>

        {/* Category - subtle, optional */}
        {product.categoryName && (
          <p className='text-[11px] uppercase tracking-widest text-stone-400 font-light'>
            {product.categoryName}
          </p>
        )}

        {/* Price - muted hierarchy */}
        <div className='flex items-baseline gap-2 pt-1'>
          {hasDiscount ? (
            <>
              <span className='text-sm text-stone-600 font-light'>
                {formattedDiscountPrice}
              </span>
              <span className='text-xs text-stone-400 line-through font-light'>
                {formattedPrice}
              </span>
            </>
          ) : (
            <span className='text-sm text-stone-600 font-light'>
              {formattedPrice}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
