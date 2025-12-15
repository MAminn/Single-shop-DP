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
import { ProductCard } from "#root/components/shop/ProductCard";
import {
  Store,
  MapPin,
  Calendar,
  Mail,
  Phone,
  ExternalLink,
  Search,
  Grid3x3,
  Loader2,
} from "lucide-react";

/**
 * Vendor data interface
 */
export interface VendorShopVendor {
  id: string;
  name: string;
  description: string | null;
  logoImagePath: string | null;
  createdAt?: Date;
  ownerEmail?: string | null;
  location?: string | null;
  contactPhone?: string | null;
  websiteUrl?: string | null;
}

/**
 * Product interface for vendor shop
 */
export interface VendorShopProduct {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  stock?: number;
  imageUrl?: string;
  vendorId: string;
  vendorName: string | null;
  categoryName?: string;
  available: boolean;
}

/**
 * Props for VendorShopGrid
 */
export interface VendorShopGridProps {
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
 * Vendor Shop Grid Template
 *
 * Standard marketplace vendor page layout featuring:
 * - Gradient banner with vendor logo
 * - Sidebar with vendor details
 * - Product grid with search and sort
 * - Pagination
 * - Verified badge
 *
 * Best for: General marketplace, multi-vendor platforms, default layout
 */
export function VendorShopGrid({
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
}: VendorShopGridProps) {
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
    <div className={`vendor-shop-grid bg-gray-50 min-h-screen ${className}`}>
      <div className='container mx-auto py-8 px-4'>
        {/* Vendor Header */}
        <div className='bg-white rounded-xl shadow-sm mb-8 overflow-hidden'>
          {/* Banner with gradient */}
          <div className='bg-gradient-to-r from-blue-600/10 to-purple-600/10 h-32 md:h-40 relative'>
            {/* Vendor Logo */}
            <div className='absolute -bottom-12 left-6 md:left-10 w-24 h-24 md:w-32 md:h-32 bg-white rounded-xl shadow-md flex items-center justify-center p-3 border-4 border-white'>
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
                <Store className='h-12 w-12 md:h-16 md:w-16 text-blue-600' />
              )}
            </div>
          </div>

          {/* Vendor Info */}
          <div className='pt-16 md:pt-10 pb-6 px-6 md:px-10 md:flex md:justify-between md:items-end'>
            <div className='md:max-w-2xl'>
              <div className='flex flex-wrap items-center gap-x-3 gap-y-2 mb-2'>
                <h1 className='text-2xl md:text-3xl font-bold text-gray-900'>
                  {vendor.name}
                </h1>
                <Badge className='bg-blue-600 text-white hover:bg-blue-700'>
                  Verified Seller
                </Badge>
              </div>

              {vendor.description && (
                <p className='text-gray-600 mb-4 md:mb-0 max-w-2xl leading-relaxed'>
                  {vendor.description}
                </p>
              )}
            </div>

            <div className='flex gap-3 mt-4 md:mt-0'>
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
                    Visit Website
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className='grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-8'>
          {/* Sidebar */}
          <aside className='order-2 lg:order-1'>
            <div className='bg-white rounded-xl shadow-sm p-6 sticky top-24'>
              <h2 className='text-lg font-semibold border-b pb-3 mb-4'>
                Vendor Details
              </h2>

              <div className='space-y-4'>
                {vendor.location && (
                  <div className='flex items-start'>
                    <MapPin className='h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0' />
                    <div>
                      <span className='block text-sm font-medium text-gray-900'>
                        Location
                      </span>
                      <span className='block text-sm text-gray-600'>
                        {vendor.location}
                      </span>
                    </div>
                  </div>
                )}

                {vendor.createdAt && (
                  <div className='flex items-start'>
                    <Calendar className='h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0' />
                    <div>
                      <span className='block text-sm font-medium text-gray-900'>
                        Member Since
                      </span>
                      <span className='block text-sm text-gray-600'>
                        {new Date(vendor.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}

                {vendor.contactPhone && (
                  <div className='flex items-start'>
                    <Phone className='h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0' />
                    <div>
                      <span className='block text-sm font-medium text-gray-900'>
                        Phone
                      </span>
                      <span className='block text-sm text-gray-600'>
                        {vendor.contactPhone}
                      </span>
                    </div>
                  </div>
                )}

                {vendor.ownerEmail && (
                  <div className='flex items-start'>
                    <Mail className='h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0' />
                    <div>
                      <span className='block text-sm font-medium text-gray-900'>
                        Email
                      </span>
                      <span className='block text-sm text-gray-600 break-all'>
                        {vendor.ownerEmail}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className='mt-6 pt-6 border-t'>
                <div className='grid grid-cols-1 gap-3'>
                  <div className='bg-gray-50 rounded-lg p-3'>
                    <div className='text-2xl font-bold text-gray-900'>
                      {products.length}
                    </div>
                    <div className='text-sm text-gray-600'>Products</div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Products Section */}
          <main className='order-1 lg:order-2'>
            <div className='bg-white rounded-xl shadow-sm p-6'>
              {/* Toolbar */}
              <div className='flex flex-col sm:flex-row gap-4 mb-6 pb-6 border-b'>
                <div className='flex-1'>
                  <div className='relative'>
                    <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                    <Input
                      type='text'
                      placeholder='Search products...'
                      value={localSearchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className='pl-10'
                    />
                  </div>
                </div>

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
              </div>

              {/* Products Grid */}
              {isLoading ? (
                <div className='flex items-center justify-center py-20'>
                  <div className='text-center'>
                    <Loader2 className='h-10 w-10 animate-spin text-blue-600 mx-auto mb-4' />
                    <span className='text-gray-600'>Loading products...</span>
                  </div>
                </div>
              ) : products.length === 0 ? (
                <div className='text-center py-20'>
                  <Grid3x3 className='h-16 w-16 text-gray-300 mx-auto mb-4' />
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
                  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={{
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          discountPrice: product.discountPrice,
                          imageUrl: product.imageUrl,
                          images: product.imageUrl
                            ? [{ url: product.imageUrl }]
                            : [],
                          available: product.available,
                          vendorId: product.vendorId,
                          vendorName: product.vendorName,
                        }}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className='flex justify-center items-center gap-2 mt-8 pt-6 border-t'>
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
                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1
                        ).map((page) => (
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
                        ))}
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
                  )}
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

VendorShopGrid.displayName = "VendorShopGrid";
