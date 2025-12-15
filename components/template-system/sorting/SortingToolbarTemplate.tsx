import React, { useState, useEffect } from "react";
import { Button } from "#root/components/ui/button";
import { Card } from "#root/components/ui/card";
import { Badge } from "#root/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#root/components/ui/select";
import { ProductCard } from "#root/components/shop/ProductCard";
import type { FeaturedProduct } from "../home/HomeFeaturedProducts";
import { Grid3x3, List, SlidersHorizontal, Search } from "lucide-react";
import { Input } from "#root/components/ui/input";
import { Link } from "#root/components/utils/Link";

/**
 * Extended product type for sorting pages
 */
export interface SortingPageProduct extends FeaturedProduct {
  brand?: string;
  rating?: number;
  reviewCount?: number;
  description?: string;
}

/**
 * Props for SortingToolbarTemplate
 */
export interface SortingToolbarTemplateProps {
  products: SortingPageProduct[];
  isLoading?: boolean;
  emptyStateMessage?: string;

  // Result count
  showResultCount?: boolean;

  // Sorting
  defaultSort?: string;
  onSortChange?: (value: string) => void;

  // View mode
  defaultView?: "grid" | "list";
  onViewChange?: (view: "grid" | "list") => void;

  // Search
  showSearch?: boolean;
  searchPlaceholder?: string;
  defaultSearchValue?: string;
  onSearchChange?: (value: string) => void;

  // Filters
  showFiltersButton?: boolean;
  onOpenFilters?: () => void;

  // Grid configuration
  gridColumns?: 2 | 3 | 4;

  // Styling
  className?: string;
}

/**
 * Sort options configuration
 */
const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Best Rating" },
] as const;

/**
 * SortingToolbarTemplate Component
 *
 * A reusable sorting-focused product listing layout for "All Products" and search results pages.
 * Features a top toolbar with sorting, view switching, search, and optional filters.
 */
export function SortingToolbarTemplate({
  products = [],
  isLoading = false,
  emptyStateMessage = "No products found",
  showResultCount = true,
  defaultSort = "featured",
  onSortChange,
  defaultView = "grid",
  onViewChange,
  showSearch = true,
  searchPlaceholder = "Search products...",
  defaultSearchValue = "",
  onSearchChange,
  showFiltersButton = true,
  onOpenFilters,
  gridColumns = 4,
  className = "",
}: SortingToolbarTemplateProps) {
  const [currentView, setCurrentView] = useState<"grid" | "list">(defaultView);
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
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue, onSearchChange]);

  // Handle view change
  const handleViewChange = (view: "grid" | "list") => {
    setCurrentView(view);
    if (onViewChange) {
      onViewChange(view);
    }
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    setCurrentSort(value);
    if (onSortChange) {
      onSortChange(value);
    }
  };

  // Get grid column classes
  const getGridColumns = () => {
    switch (gridColumns) {
      case 2:
        return "grid-cols-1 md:grid-cols-2";
      case 3:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      case 4:
      default:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
    }
  };

  return (
    <div className={`w-full space-y-6 ${className}`}>
      {/* Toolbar */}
      <Card className='w-full shadow-sm'>
        <div className='p-4'>
          {/* Desktop Toolbar */}
          <div className='hidden lg:flex items-center justify-between gap-4'>
            <div className='flex items-center gap-6'>
              {/* Result Count */}
              {showResultCount && (
                <div className='text-sm text-muted-foreground font-medium'>
                  {isLoading ? (
                    <span className='inline-block h-5 w-24 bg-gray-200 animate-pulse rounded' />
                  ) : (
                    <span>
                      {products.length}{" "}
                      {products.length === 1 ? "product" : "products"}
                    </span>
                  )}
                </div>
              )}

              {/* Search Input */}
              {showSearch && (
                <div className='relative flex-1 max-w-md'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                  <Input
                    type='text'
                    placeholder={searchPlaceholder}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className='pl-10 pr-4 h-10'
                  />
                </div>
              )}
            </div>

            <div className='flex items-center gap-3'>
              {/* Sort Dropdown */}
              <Select value={currentSort} onValueChange={handleSortChange}>
                <SelectTrigger className='w-[200px] h-10'>
                  <SelectValue placeholder='Sort by' />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* View Toggle */}
              <div className='flex items-center gap-1 border rounded-md p-1'>
                <Button
                  variant={currentView === "grid" ? "default" : "ghost"}
                  size='sm'
                  onClick={() => handleViewChange("grid")}
                  className='h-8 w-8 p-0'>
                  <Grid3x3 className='h-4 w-4' />
                </Button>
                <Button
                  variant={currentView === "list" ? "default" : "ghost"}
                  size='sm'
                  onClick={() => handleViewChange("list")}
                  className='h-8 w-8 p-0'>
                  <List className='h-4 w-4' />
                </Button>
              </div>

              {/* Filters Button (Optional) */}
              {showFiltersButton && onOpenFilters && (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={onOpenFilters}
                  className='h-10'>
                  <SlidersHorizontal className='h-4 w-4 mr-2' />
                  Filters
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Toolbar */}
          <div className='lg:hidden space-y-3'>
            {/* Search Input */}
            {showSearch && (
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                  type='text'
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className='pl-10 pr-4 h-10'
                />
              </div>
            )}

            <div className='flex items-center gap-2'>
              {/* Sort Dropdown */}
              <Select value={currentSort} onValueChange={handleSortChange}>
                <SelectTrigger className='flex-1 h-10'>
                  <SelectValue placeholder='Sort by' />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* View Toggle */}
              <div className='flex items-center gap-1 border rounded-md p-1'>
                <Button
                  variant={currentView === "grid" ? "default" : "ghost"}
                  size='sm'
                  onClick={() => handleViewChange("grid")}
                  className='h-8 w-8 p-0'>
                  <Grid3x3 className='h-4 w-4' />
                </Button>
                <Button
                  variant={currentView === "list" ? "default" : "ghost"}
                  size='sm'
                  onClick={() => handleViewChange("list")}
                  className='h-8 w-8 p-0'>
                  <List className='h-4 w-4' />
                </Button>
              </div>

              {/* Filters Button */}
              {showFiltersButton && onOpenFilters && (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={onOpenFilters}
                  className='h-10 px-3'>
                  <SlidersHorizontal className='h-4 w-4' />
                </Button>
              )}
            </div>

            {/* Result Count on Mobile */}
            {showResultCount && (
              <div className='text-sm text-muted-foreground font-medium text-center'>
                {isLoading ? (
                  <span className='inline-block h-5 w-24 bg-gray-200 animate-pulse rounded mx-auto' />
                ) : (
                  <span>
                    {products.length}{" "}
                    {products.length === 1 ? "product" : "products"}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Product Grid/List */}
      {isLoading ? (
        // Loading State
        <div className={`grid ${getGridColumns()} gap-6`}>
          {Array.from({ length: gridColumns * 2 }).map((_, index) => (
            <Card key={index} className='overflow-hidden'>
              <div className='animate-pulse'>
                <div className='aspect-square bg-gray-200' />
                <div className='p-4 space-y-3'>
                  <div className='h-4 bg-gray-200 rounded w-3/4' />
                  <div className='h-4 bg-gray-200 rounded w-1/2' />
                  <div className='h-8 bg-gray-200 rounded w-full' />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : products.length === 0 ? (
        // Empty State
        <div className='flex flex-col items-center justify-center py-16 px-4 text-center'>
          <div className='w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center'>
            <Search className='h-8 w-8 text-gray-400' />
          </div>
          <h3 className='text-xl font-semibold mb-2 text-gray-900'>
            No Products Found
          </h3>
          <p className='text-muted-foreground mb-6 max-w-md'>
            {emptyStateMessage}
          </p>
        </div>
      ) : (
        // Product Display
        <>
          {currentView === "grid" ? (
            // Grid View
            <div className={`grid ${getGridColumns()} gap-6`}>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  showVendor={true}
                />
              ))}
            </div>
          ) : (
            // List View
            <div className='space-y-4'>
              {products.map((product) => (
                <ProductListItem key={product.id} product={product} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/**
 * Product List Item Component
 *
 * Horizontal card layout for list view mode
 */
interface ProductListItemProps {
  product: SortingPageProduct;
}

function ProductListItem({ product }: ProductListItemProps) {
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
    <Card className='overflow-hidden hover:shadow-lg transition-shadow duration-300'>
      <Link href={`/product/${product.id}`} className='no-underline'>
        <div className='flex flex-col sm:flex-row'>
          {/* Image Section */}
          <div className='sm:w-64 sm:flex-shrink-0'>
            <div className='aspect-square sm:h-full relative bg-gray-100'>
              <img
                src={displayImageUrl}
                alt={product.name}
                className='w-full h-full object-cover'
                loading='lazy'
              />
              {hasDiscount && (
                <Badge className='absolute top-3 right-3 bg-red-500 hover:bg-red-600'>
                  Sale
                </Badge>
              )}
              {!product.available && (
                <div className='absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
                  <Badge variant='secondary'>Out of Stock</Badge>
                </div>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className='flex-1 p-6 flex flex-col'>
            {/* Category Badge */}
            {product.categoryName && (
              <Badge variant='outline' className='w-fit mb-3'>
                {product.categoryName}
              </Badge>
            )}

            {/* Product Name */}
            <h3 className='text-xl font-semibold mb-2 text-gray-900 hover:text-primary line-clamp-2'>
              {product.name}
            </h3>

            {product.vendorName && (
              <p className='text-sm text-muted-foreground mb-3 flex items-center gap-1'>
                <span>by</span>
                <span className='text-primary'>{product.vendorName}</span>
              </p>
            )}

            {/* Description */}
            {product.description && (
              <p className='text-sm text-muted-foreground mb-4 line-clamp-2 flex-1'>
                {product.description}
              </p>
            )}

            {/* Rating */}
            {product.rating !== undefined && (
              <div className='flex items-center gap-2 mb-4'>
                <div className='flex items-center'>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <span
                      key={index}
                      className={
                        index < Math.floor(product.rating || 0)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }>
                      ★
                    </span>
                  ))}
                </div>
                <span className='text-sm text-muted-foreground'>
                  {product.rating?.toFixed(1)}
                </span>
                {product.reviewCount !== undefined && (
                  <span className='text-sm text-muted-foreground'>
                    ({product.reviewCount} reviews)
                  </span>
                )}
              </div>
            )}

            {/* Price Section */}
            <div className='flex items-center gap-3 mt-auto'>
              {hasDiscount ? (
                <>
                  <span className='text-2xl font-bold text-red-600'>
                    {formattedDiscountPrice}
                  </span>
                  <span className='text-lg text-muted-foreground line-through'>
                    {formattedPrice}
                  </span>
                </>
              ) : (
                <span className='text-2xl font-bold text-gray-900'>
                  {formattedPrice}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </Card>
  );
}
