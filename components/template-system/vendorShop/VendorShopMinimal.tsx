import type React from "react";
import { useState } from "react";
import { Button } from "#root/components/ui/button";
import { Input } from "#root/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#root/components/ui/select";
import {
  Store,
  Search,
  Loader2,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";
import type { VendorShopVendor, VendorShopProduct } from "./VendorShopGrid";

/**
 * Props for VendorShopMinimal
 */
export interface VendorShopMinimalProps {
  vendor: VendorShopVendor;
  products: VendorShopProduct[];
  isLoading?: boolean;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  sortBy?: string;
  onSortChange?: (value: string) => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

/**
 * Vendor Shop Minimal Template
 *
 * Premium, brand-focused layout featuring:
 * - Clean, spacious design with generous whitespace
 * - Typography-driven vendor presentation
 * - Elegant product grid with subtle interactions
 * - Minimalist aesthetic for luxury/premium brands
 * - Focus on product photography
 *
 * Best for: Premium brands, boutique vendors, design-conscious merchants
 */
export function VendorShopMinimal({
  vendor,
  products = [],
  isLoading = false,
  searchTerm = "",
  onSearchChange,
  sortBy = "newest",
  onSortChange,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className = "",
}: VendorShopMinimalProps) {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  const handleSearchChange = (value: string) => {
    setLocalSearchTerm(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  const handleSortChange = (value: string) => {
    if (onSortChange) {
      onSortChange(value);
    }
  };

  return (
    <div className={`vendor-shop-minimal bg-white min-h-screen ${className}`}>
      <div className='container mx-auto max-w-7xl'>
        {/* Minimal Header */}
        <div className='py-16 md:py-24 border-b'>
          <div className='text-center max-w-3xl mx-auto px-4'>
            {/* Logo */}
            {vendor.logoImagePath ? (
              <div className='mb-8'>
                <img
                  src={
                    vendor.logoImagePath.startsWith("http")
                      ? vendor.logoImagePath
                      : `/uploads/${vendor.logoImagePath}`
                  }
                  alt={vendor.name}
                  className='h-20 md:h-24 mx-auto object-contain'
                />
              </div>
            ) : (
              <div className='mb-8'>
                <Store className='h-16 w-16 md:h-20 md:w-20 text-gray-900 mx-auto' />
              </div>
            )}

            {/* Vendor Name */}
            <h1 className='text-4xl md:text-5xl font-light tracking-tight text-gray-900 mb-6'>
              {vendor.name}
            </h1>

            {/* Description */}
            {vendor.description && (
              <p className='text-lg md:text-xl text-gray-600 font-light leading-relaxed mb-8'>
                {vendor.description}
              </p>
            )}

            {/* Links */}
            <div className='flex items-center justify-center gap-6 text-sm'>
              {vendor.websiteUrl && (
                <a
                  href={vendor.websiteUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-gray-900 hover:text-gray-600 transition-colors inline-flex items-center group'>
                  Visit Website
                  <ExternalLink className='h-3.5 w-3.5 ml-1.5 opacity-50 group-hover:opacity-100 transition-opacity' />
                </a>
              )}
              {vendor.location && (
                <span className='text-gray-500'>{vendor.location}</span>
              )}
            </div>
          </div>
        </div>

        {/* Minimal Toolbar */}
        <div className='py-12 border-b'>
          <div className='max-w-4xl mx-auto px-4'>
            <div className='flex flex-col md:flex-row gap-4 items-center'>
              {/* Search */}
              <div className='flex-1 w-full'>
                <div className='relative'>
                  <Search className='absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                  <Input
                    type='text'
                    placeholder='Search...'
                    value={localSearchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className='pl-11 border-gray-200 focus:border-gray-900 rounded-full h-11'
                  />
                </div>
              </div>

              {/* Sort */}
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className='w-full md:w-[200px] border-gray-200 rounded-full h-11'>
                  <SelectValue placeholder='Sort by' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='newest'>Newest</SelectItem>
                  <SelectItem value='price'>Price</SelectItem>
                  <SelectItem value='name'>Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className='py-16 px-4'>
          {isLoading ? (
            <div className='flex items-center justify-center py-32'>
              <div className='text-center'>
                <Loader2 className='h-8 w-8 animate-spin text-gray-900 mx-auto mb-6' />
                <span className='text-gray-600 text-sm font-light'>
                  Loading...
                </span>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className='text-center py-32'>
              <ShoppingBag className='h-16 w-16 text-gray-200 mx-auto mb-6' />
              <h3 className='text-2xl font-light text-gray-900 mb-3'>
                No products found
              </h3>
              <p className='text-gray-500 font-light'>
                {searchTerm
                  ? "Try adjusting your search"
                  : "Collection coming soon"}
              </p>
            </div>
          ) : (
            <>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 max-w-6xl mx-auto'>
                {products.map((product) => (
                  <div
                    key={product.id}
                    className='group cursor-pointer'
                    role='button'
                    tabIndex={0}>
                    {/* Product Image */}
                    <div className='aspect-square bg-gray-50 mb-6 overflow-hidden'>
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
                        />
                      ) : (
                        <div className='w-full h-full flex items-center justify-center'>
                          <ShoppingBag className='h-20 w-20 text-gray-200' />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className='text-center'>
                      {product.categoryName && (
                        <div className='text-xs uppercase tracking-wider text-gray-500 mb-2 font-light'>
                          {product.categoryName}
                        </div>
                      )}

                      <h3 className='text-lg font-light text-gray-900 mb-3 group-hover:text-gray-600 transition-colors'>
                        {product.name}
                      </h3>

                      <div className='flex items-center justify-center gap-3'>
                        {product.discountPrice ? (
                          <>
                            <span className='text-base font-normal text-gray-900'>
                              ${product.discountPrice.toFixed(2)}
                            </span>
                            <span className='text-sm text-gray-400 line-through font-light'>
                              ${product.price.toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className='text-base font-normal text-gray-900'>
                            ${product.price.toFixed(2)}
                          </span>
                        )}
                      </div>

                      {!product.available && (
                        <div className='text-xs text-gray-400 mt-2 font-light'>
                          Out of stock
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Minimal Pagination */}
              {totalPages > 1 && (
                <div className='flex justify-center items-center gap-3 mt-20 pt-12 border-t'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() =>
                      onPageChange && onPageChange(currentPage - 1)
                    }
                    disabled={currentPage === 1}
                    className='text-gray-900 hover:text-gray-600 hover:bg-transparent font-light'>
                    Previous
                  </Button>

                  <div className='flex items-center gap-2'>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => onPageChange && onPageChange(page)}
                          className={`min-w-[32px] h-8 rounded-full text-sm font-light transition-colors ${
                            page === currentPage
                              ? "bg-gray-900 text-white"
                              : "text-gray-900 hover:bg-gray-100"
                          }`}
                          type='button'>
                          {page}
                        </button>
                      )
                    )}
                  </div>

                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() =>
                      onPageChange && onPageChange(currentPage + 1)
                    }
                    disabled={currentPage === totalPages}
                    className='text-gray-900 hover:text-gray-600 hover:bg-transparent font-light'>
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

VendorShopMinimal.displayName = "VendorShopMinimal";
