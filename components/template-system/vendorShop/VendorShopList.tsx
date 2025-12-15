import type React from "react";
import { useState } from "react";
import { Button } from "#root/components/ui/button";
import { Badge } from "#root/components/ui/badge";
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
  MapPin,
  Calendar,
  Mail,
  Phone,
  ExternalLink,
  Search,
  List,
  Loader2,
  ShoppingBag,
} from "lucide-react";
import type { VendorShopVendor, VendorShopProduct } from "./VendorShopGrid";

/**
 * Props for VendorShopList
 */
export interface VendorShopListProps {
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
 * Vendor Shop List Template
 *
 * Catalog-heavy layout featuring:
 * - Compact vendor header
 * - Full-width list view of products
 * - Detailed product information in rows
 * - Quick-view product specs
 * - Efficient browsing for large inventories
 *
 * Best for: Vendors with many products, catalog-heavy stores, B2B
 */
export function VendorShopList({
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
}: VendorShopListProps) {
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
    <div className={`vendor-shop-list bg-gray-50 min-h-screen ${className}`}>
      <div className='container mx-auto py-6 px-4'>
        {/* Compact Header */}
        <div className='bg-white rounded-lg shadow-sm mb-6 p-6'>
          <div className='flex flex-col md:flex-row md:items-center gap-6'>
            {/* Logo */}
            <div className='flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center p-2 border'>
              {vendor.logoImagePath ? (
                <img
                  src={
                    vendor.logoImagePath.startsWith("http")
                      ? vendor.logoImagePath
                      : `/uploads/${vendor.logoImagePath}`
                  }
                  alt={vendor.name}
                  className='w-full h-full object-contain'
                />
              ) : (
                <Store className='h-10 w-10 text-blue-600' />
              )}
            </div>

            {/* Vendor Info */}
            <div className='flex-1 min-w-0'>
              <div className='flex flex-wrap items-center gap-x-3 gap-y-2 mb-2'>
                <h1 className='text-2xl font-bold text-gray-900'>
                  {vendor.name}
                </h1>
                <Badge className='bg-blue-600 text-white hover:bg-blue-700'>
                  Verified
                </Badge>
              </div>

              {vendor.description && (
                <p className='text-gray-600 text-sm line-clamp-2 mb-2'>
                  {vendor.description}
                </p>
              )}

              {/* Quick Contact */}
              <div className='flex flex-wrap gap-4 text-sm text-gray-500'>
                {vendor.location && (
                  <div className='flex items-center'>
                    <MapPin className='h-4 w-4 mr-1.5' />
                    {vendor.location}
                  </div>
                )}
                {vendor.createdAt && (
                  <div className='flex items-center'>
                    <Calendar className='h-4 w-4 mr-1.5' />
                    Member since{" "}
                    {new Date(vendor.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                )}
                {vendor.contactPhone && (
                  <div className='flex items-center'>
                    <Phone className='h-4 w-4 mr-1.5' />
                    {vendor.contactPhone}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className='flex gap-3'>
              {vendor.ownerEmail && (
                <Button
                  variant='outline'
                  size='sm'
                  asChild
                  className='text-gray-600 border-gray-300 hover:border-blue-600 hover:text-blue-600'>
                  <a href={`mailto:${vendor.ownerEmail}`}>
                    <Mail className='h-4 w-4 mr-1' />
                    Contact
                  </a>
                </Button>
              )}
              {vendor.websiteUrl && (
                <Button
                  variant='outline'
                  size='sm'
                  asChild
                  className='text-gray-600 border-gray-300 hover:border-blue-600 hover:text-blue-600'>
                  <a
                    href={vendor.websiteUrl}
                    target='_blank'
                    rel='noopener noreferrer'>
                    <ExternalLink className='h-4 w-4 mr-1' />
                    Website
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className='bg-white rounded-lg shadow-sm p-4 mb-6'>
          <div className='flex flex-col sm:flex-row gap-4 items-center'>
            <div className='flex-1 w-full'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                <Input
                  type='text'
                  placeholder='Search products in this store...'
                  value={localSearchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>

            <div className='flex items-center gap-3 w-full sm:w-auto'>
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className='w-full sm:w-[180px]'>
                  <SelectValue placeholder='Sort by' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='newest'>Newest First</SelectItem>
                  <SelectItem value='price'>Price: Low to High</SelectItem>
                  <SelectItem value='name'>Name: A to Z</SelectItem>
                </SelectContent>
              </Select>

              <div className='bg-gray-100 px-3 py-2 rounded-md text-sm font-medium text-gray-700'>
                {products.length} products
              </div>
            </div>
          </div>
        </div>

        {/* Products List */}
        <div className='space-y-4'>
          {isLoading ? (
            <div className='bg-white rounded-lg shadow-sm p-20 flex items-center justify-center'>
              <div className='text-center'>
                <Loader2 className='h-10 w-10 animate-spin text-blue-600 mx-auto mb-4' />
                <span className='text-gray-600'>Loading products...</span>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className='bg-white rounded-lg shadow-sm p-20 text-center'>
              <List className='h-16 w-16 text-gray-300 mx-auto mb-4' />
              <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                No products found
              </h3>
              <p className='text-gray-600'>
                {searchTerm
                  ? "Try adjusting your search"
                  : "This vendor hasn't added any products yet"}
              </p>
            </div>
          ) : (
            <>
              {products.map((product) => (
                <div
                  key={product.id}
                  className='bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow'>
                  <div className='p-4 md:p-6 flex flex-col md:flex-row gap-4 md:gap-6'>
                    {/* Product Image */}
                    <div className='flex-shrink-0 w-full md:w-48 h-48 bg-gray-100 rounded-lg overflow-hidden'>
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className='w-full h-full object-cover'
                        />
                      ) : (
                        <div className='w-full h-full flex items-center justify-center'>
                          <ShoppingBag className='h-16 w-16 text-gray-300' />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className='flex-1 min-w-0'>
                      <div className='flex flex-col h-full'>
                        <div className='flex-1'>
                          <div className='flex items-start justify-between gap-4 mb-2'>
                            <h3 className='text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer'>
                              {product.name}
                            </h3>
                            <div className='flex-shrink-0'>
                              {product.discountPrice ? (
                                <div className='text-right'>
                                  <div className='text-xl font-bold text-blue-600'>
                                    ${product.discountPrice.toFixed(2)}
                                  </div>
                                  <div className='text-sm text-gray-500 line-through'>
                                    ${product.price.toFixed(2)}
                                  </div>
                                </div>
                              ) : (
                                <div className='text-xl font-bold text-gray-900'>
                                  ${product.price.toFixed(2)}
                                </div>
                              )}
                            </div>
                          </div>

                          {product.categoryName && (
                            <div className='mb-3'>
                              <Badge
                                variant='outline'
                                className='text-xs text-gray-600'>
                                {product.categoryName}
                              </Badge>
                            </div>
                          )}

                          <div className='flex flex-wrap gap-4 text-sm text-gray-600 mb-4'>
                            {typeof product.stock !== "undefined" && (
                              <div>
                                <span className='font-medium'>Stock:</span>{" "}
                                {product.stock > 0 ? (
                                  <span className='text-green-600'>
                                    {product.stock} available
                                  </span>
                                ) : (
                                  <span className='text-red-600'>
                                    Out of stock
                                  </span>
                                )}
                              </div>
                            )}
                            <div>
                              <span className='font-medium'>Status:</span>{" "}
                              {product.available ? (
                                <span className='text-green-600'>
                                  Available
                                </span>
                              ) : (
                                <span className='text-gray-500'>
                                  Unavailable
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className='flex gap-3 mt-4'>
                          <Button
                            size='sm'
                            className='bg-blue-600 hover:bg-blue-700'
                            disabled={!product.available}>
                            Add to Cart
                          </Button>
                          <Button variant='outline' size='sm'>
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className='bg-white rounded-lg shadow-sm p-4'>
                  <div className='flex justify-center items-center gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() =>
                        onPageChange && onPageChange(currentPage - 1)
                      }
                      disabled={currentPage === 1}>
                      Previous
                    </Button>

                    <div className='flex items-center gap-1'>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <Button
                            key={page}
                            variant={
                              page === currentPage ? "default" : "outline"
                            }
                            size='sm'
                            onClick={() => onPageChange && onPageChange(page)}
                            className='min-w-[40px]'>
                            {page}
                          </Button>
                        )
                      )}
                    </div>

                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() =>
                        onPageChange && onPageChange(currentPage + 1)
                      }
                      disabled={currentPage === totalPages}>
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

VendorShopList.displayName = "VendorShopList";
