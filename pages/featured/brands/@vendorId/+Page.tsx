import { useState, useEffect, useCallback } from "react";
import { trpc } from "#root/shared/trpc/client";
import { Store, Loader2, Filter } from "lucide-react";
import AnimatedContent from "#root/components/AnimatedContent";
import { Button } from "#root/components/ui/button";
import { usePageContext } from "vike-react/usePageContext";
import { ProductCard } from "#root/components/ProductCard";
import { Badge } from "#root/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "#root/components/ui/sheet";
import CategoryFilter from "#root/components/shop/CategoryFilter";
import { Pagination } from "#root/components/Pagination";

interface VendorData {
  id: string;
  name: string;
  description: string | null;
  logoImagePath: string | null;
  createdAt?: Date;
  ownerEmail?: string | null;
}

interface Product {
  id: string;
  name: string;
  price: number | string;
  stock: number;
  imageUrl: string | null;
  available: boolean;
  categoryId: string;
  categoryName: string | null;
  vendorId: string;
  vendorName: string | null;
}

export default function BrandDetailPage() {
  const ctx = usePageContext();
  const vendorId = ctx.urlPathname.split("/").pop()?.replace(/^@/, "");

  console.log("Raw URL pathname:", ctx.urlPathname);
  console.log("Extracted vendorId:", vendorId);

  const [vendor, setVendor] = useState<VendorData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const limit = 12;

  const fetchVendor = useCallback(async () => {
    if (!vendorId) {
      console.error("No vendorId available from URL");
      setError("No vendor ID provided");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Fetching vendor with ID:", vendorId);
      console.log("TRPC query parameters:", { vendorId });

      const result = await trpc.vendor.viewById.query({ vendorId });
      console.log("Vendor fetch result:", result);

      if (result.success) {
        console.log("Vendor data fetched successfully:", result.result);
        setVendor(result.result);
      } else {
        console.error("Failed to fetch vendor:", result.error);
        setError(result.error || "Failed to fetch brand information");
      }
    } catch (err) {
      console.error("Exception while fetching vendor:", err);
      setError("An error occurred while fetching brand data");
    } finally {
      setIsLoading(false);
    }
  }, [vendorId]);

  const fetchProducts = useCallback(async () => {
    if (!vendorId) return;

    setIsProductsLoading(true);
    try {
      console.log(
        "Fetching products for vendor:",
        vendorId,
        "page:",
        currentPage,
        "categories:",
        categoryIds
      );

      const result = await trpc.product.search.query({
        offset: (currentPage - 1) * limit,
        limit,
        vendorId,
        categoryIds: categoryIds.length > 0 ? categoryIds : undefined,
        includeOutOfStock: true,
      });

      if (result.success) {
        console.log(
          "Products fetched successfully:",
          result.result?.items?.length || 0,
          "of",
          result.result?.totalCount || 0,
          "First product:",
          result.result?.items?.[0] || "No products"
        );
        setProducts(result.result?.items || []);
        setTotalProducts(result.result?.totalCount || 0);
        setTotalPages(Math.ceil((result.result?.totalCount || 0) / limit));
      } else {
        console.error("Failed to fetch products:", result.error);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setIsProductsLoading(false);
    }
  }, [vendorId, currentPage, categoryIds]);

  useEffect(() => {
    fetchVendor();
  }, [fetchVendor]);

  useEffect(() => {
    if (vendor?.id) {
      fetchProducts();
    }
  }, [fetchProducts, vendor]);

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-accent-lb" />
        <span className="ml-3">Loading vendor information...</span>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="container flex flex-col items-center justify-center min-h-[60vh] py-8">
        <h2 className="text-2xl font-bold text-red-500 mb-2">Error</h2>
        <p className="text-gray-600">{error || "Brand not found"}</p>
        <Button
          onClick={() => {
            window.location.href = "/featured/brands";
          }}
          className="mt-4"
        >
          Back to Brands
        </Button>
      </div>
    );
  }

  return (
    <AnimatedContent
      distance={100}
      direction="vertical"
      reverse={false}
      config={{ tension: 60, friction: 30 }}
      initialOpacity={0}
      animateOpacity
      scale={1}
      threshold={0.1}
    >
      <div className="container py-8">
        {/* Brand Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center gap-6 pb-6 border-b">
          <div className="w-20 h-20 flex-shrink-0 bg-accent-lb/10 rounded-lg flex items-center justify-center">
            {vendor.logoImagePath ? (
              <img
                src={
                  vendor.logoImagePath.startsWith("http")
                    ? vendor.logoImagePath
                    : `/uploads/${vendor.logoImagePath}`
                }
                alt={vendor.name}
                className="w-16 h-16 object-contain"
              />
            ) : (
              <Store className="h-10 w-10 text-accent-lb" />
            )}
          </div>

          <div className="flex-grow">
            <h1 className="text-3xl font-bold mb-2">{vendor.name}</h1>
            {vendor.description && (
              <p className="text-gray-600 max-w-3xl">{vendor.description}</p>
            )}
          </div>
        </div>

        {/* Filters and Products */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Mobile Filters */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 lg:hidden mb-4"
              >
                <Filter className="h-4 w-4" />
                Filter Products
                {categoryIds.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {categoryIds.length}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Filter Products</SheetTitle>
              </SheetHeader>
              <div className="py-4">
                <CategoryFilter
                  selectedCategoryIds={categoryIds}
                  onSelectCategory={(ids) => setCategoryIds(ids)}
                />
              </div>
            </SheetContent>
          </Sheet>

          {/* Desktop Filters */}
          <div className="hidden lg:block w-[250px] flex-shrink-0">
            <div className="sticky top-24">
              <h3 className="text-lg font-semibold mb-4">Categories</h3>
              <CategoryFilter
                selectedCategoryIds={categoryIds}
                onSelectCategory={(ids) => setCategoryIds(ids)}
              />
            </div>
          </div>

          {/* Products */}
          <div className="flex-grow">
            {isProductsLoading ? (
              <div className="flex justify-center my-12">
                <Loader2 className="h-8 w-8 animate-spin text-accent-lb" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <Store className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  No products found
                </h3>
                <p className="text-gray-500 mb-4">
                  This brand doesn't have any products matching your criteria
                </p>
                {categoryIds.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setCategoryIds([])}
                    className="mx-auto"
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="mb-4 flex justify-between items-center">
                  <h2 className="text-xl font-semibold">
                    Products from {vendor.name}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Showing {products.length} of {totalProducts} products
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={{
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        imageUrl: product.imageUrl?.startsWith("http")
                          ? product.imageUrl
                          : product.imageUrl
                            ? `/uploads/${product.imageUrl}`
                            : null,
                        available: product.available,
                        categoryName: product.categoryName,
                        vendorId: product.vendorId,
                        vendorName: product.vendorName,
                      }}
                      showVendor={false}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={(page) => setCurrentPage(page)}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </AnimatedContent>
  );
}
