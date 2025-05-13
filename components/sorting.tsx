import { useEffect, useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#root/components/ui/select";
import { Link } from "#root/components/Link";
import { Badge } from "#root/components/ui/badge";
import { useToast } from "#root/components/ui/use-toast";
import { useCart } from "#root/lib/context/CartContext";
import { trpc } from "#root/shared/trpc/client";
import { getProductUrl } from "#root/lib/utils/route-helpers";
import { Loader2, FilterX, SlidersHorizontal } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";

// Define product interface to match what is expected by the ProductCard
interface SortableProduct {
  id: string;
  name: string;
  price: number | string;
  discountPrice?: number | string | null;
  imageUrl?: string | null;
  available: boolean;
  categoryName?: string | null;
  vendorId: string;
  vendorName: string | null;
  stock?: number;
  sku?: string;
  vendor?: string;
  dateAdded?: string;
  categories?: { id: string; name: string }[];
  images?: { url: string; isPrimary?: boolean }[];
}

interface Category {
  id: string;
  name: string;
  displayName?: string;
  slug?: string;
  imageId?: string | null;
  filename?: string | null;
  type?: "men" | "women";
  productCount?: number;
}

interface SortingProps {
  categoryId?: string;
  vendorId?: string;
  categoryType?: "men" | "women";
  categories?: Category[];
}

type SortCriteria =
  | "featured"
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc"
  | "date-asc"
  | "date-desc";

const Sorting: React.FC<SortingProps> = ({
  categoryId,
  vendorId,
  categoryType,
  categories = [],
}: SortingProps) => {
  const [products, setProducts] = useState<SortableProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortCriteria, setSortCriteria] = useState<SortCriteria>("featured");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    setProducts([]); // Clear previous products on parameters change

    // If categoryType is specified, fetch products directly using the categoryType parameter
    if (categoryType) {
      trpc.product.search
        .query({
          categoryType,
          limit: 100,
          includeOutOfStock: true,
        })
        .then((res) => {
          if (res.success && res.result) {
            console.log(`${categoryType} products:`, res.result);
            setProducts(
              res.result.items.map((item) => ({
                id: item.id,
                sku: item.id,
                name: item.name,
                price: Number(item.price),
                discountPrice: item.discountPrice
                  ? Number(item.discountPrice)
                  : null,
                stock: item.stock,
                imageUrl: item.imageUrl
                  ? item.imageUrl.startsWith("http")
                    ? item.imageUrl
                    : item.imageUrl.startsWith("/uploads/")
                      ? item.imageUrl
                      : `/uploads/${item.imageUrl}`
                  : undefined,
                images: item.images,
                vendor: item.vendorName || "",
                vendorId: item.vendorId || "",
                vendorName: item.vendorName || "",
                categoryName: item.categoryName,
                categories: item.categories,
                available: item.stock > 0,
              }))
            );
          } else if (!res.success) {
            console.error(
              `Failed to fetch ${categoryType} products:`,
              res.error
            );
            toast({
              title: "Error",
              description: "Failed to fetch products",
              variant: "destructive",
            });
          }
          setIsLoading(false);
        })
        .catch((err) => {
          console.error(
            `Exception while fetching ${categoryType} products:`,
            err
          );
          setIsLoading(false);
        });
      return;
    }

    // Handle specific category
    if (categoryId) {
      trpc.product.search
        .query({
          categoryIds: [categoryId],
          limit: 100,
          includeOutOfStock: true,
        })
        .then((res) => {
          if (res.success && res.result) {
            console.log("Category search results:", res.result);
            setProducts(
              res.result.items.map((item) => ({
                id: item.id,
                sku: item.id,
                name: item.name,
                price: Number(item.price),
                discountPrice: item.discountPrice
                  ? Number(item.discountPrice)
                  : null,
                stock: item.stock,
                imageUrl: item.imageUrl
                  ? item.imageUrl.startsWith("http")
                    ? item.imageUrl
                    : item.imageUrl.startsWith("/uploads/")
                      ? item.imageUrl
                      : `/uploads/${item.imageUrl}`
                  : undefined,
                images: item.images,
                vendor: item.vendorName || "",
                vendorId: item.vendorId || "",
                vendorName: item.vendorName || "",
                categoryName: item.categoryName,
                categories: item.categories,
                available: item.stock > 0,
              }))
            );
          } else if (!res.success) {
            console.error("Failed to fetch category products:", res.error);
            toast({
              title: "Error",
              description: "Failed to fetch products",
              variant: "destructive",
            });
          }
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Exception while fetching category products:", err);
          setIsLoading(false);
        });
      return;
    }

    // Handle vendor
    if (vendorId) {
      // Ensure vendorId is valid
      if (typeof vendorId !== "string" || !vendorId) {
        console.error("Invalid vendorId:", vendorId);
        toast({
          title: "Error",
          description: "Invalid vendor identifier",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      trpc.product.search
        .query({
          vendorId: vendorId.toString(),
          limit: 100,
          includeOutOfStock: true,
        })
        .then((res) => {
          if (res.success && res.result) {
            setProducts(
              res.result.items.map((item) => ({
                id: item.id,
                sku: item.id,
                name: item.name,
                price: Number(item.price),
                discountPrice: item.discountPrice
                  ? Number(item.discountPrice)
                  : null,
                stock: item.stock,
                imageUrl: item.imageUrl
                  ? item.imageUrl.startsWith("http")
                    ? item.imageUrl
                    : item.imageUrl.startsWith("/uploads/")
                      ? item.imageUrl
                      : `/uploads/${item.imageUrl}`
                  : undefined,
                images: item.images,
                vendor: item.vendorName || "",
                vendorId: item.vendorId || "",
                vendorName: item.vendorName || "",
                categoryName: item.categoryName,
                categories: item.categories,
                available: item.stock > 0,
              }))
            );
          } else if (!res.success) {
            console.error("Failed to fetch vendor products:", res.error);
            toast({
              title: "Error",
              description: "Failed to fetch products",
              variant: "destructive",
            });
          }
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Exception while fetching vendor products:", err);
          setIsLoading(false);
        });
      return;
    }

    // Fetch all products if no categoryId, vendorId, or categoryType
    trpc.product.search
      .query({
        limit: 100,
        includeOutOfStock: true,
      })
      .then((res) => {
        if (res.success && res.result) {
          setProducts(
            res.result.items.map((item) => ({
              id: item.id,
              sku: item.id,
              name: item.name,
              price: Number(item.price),
              discountPrice: item.discountPrice
                ? Number(item.discountPrice)
                : null,
              stock: item.stock,
              imageUrl: item.imageUrl
                ? item.imageUrl.startsWith("http")
                  ? item.imageUrl
                  : item.imageUrl.startsWith("/uploads/")
                    ? item.imageUrl
                    : `/uploads/${item.imageUrl}`
                : undefined,
              images: item.images,
              vendor: item.vendorName || "",
              vendorId: item.vendorId || "",
              vendorName: item.vendorName || "",
              categoryName: item.categoryName,
              categories: item.categories,
              available: item.stock > 0,
            }))
          );
        } else if (!res.success) {
          console.error("Failed to fetch all products:", res.error);
          toast({
            title: "Error",
            description: "Failed to fetch products",
            variant: "destructive",
          });
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Exception while fetching all products:", err);
        setIsLoading(false);
      });
  }, [categoryId, vendorId, categoryType, toast]);

  const toggleCategoryFilter = (categoryId: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      }
      return [...prev, categoryId];
    });
  };

  const resetFilters = () => {
    setSelectedPriceRange("all");
    setSelectedCategories([]);
  };

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Apply category filters if any are selected
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((product) => {
        // Check if the product belongs to any of the selected categories
        if (product.categories && product.categories.length > 0) {
          return product.categories.some((cat) =>
            selectedCategories.includes(cat.id)
          );
        }
        return false;
      });
    }

    // Price range filtering
    if (selectedPriceRange !== "all") {
      const [minStr, maxStr] = selectedPriceRange.split("-");
      const min = Number(minStr);
      const max = Number(maxStr);

      if (!Number.isNaN(min) && !Number.isNaN(max)) {
        filtered = products.filter((product) => {
          const price =
            product.discountPrice !== undefined &&
            product.discountPrice !== null
              ? typeof product.discountPrice === "number"
                ? product.discountPrice
                : Number(product.discountPrice)
              : typeof product.price === "number"
                ? product.price
                : Number(product.price);
          return price >= min && price <= max;
        });
      }
    }

    // Sorting
    switch (sortCriteria) {
      case "featured":
        break;
      case "name-asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "price-asc":
        filtered.sort((a, b) => {
          const priceA =
            a.discountPrice !== undefined && a.discountPrice !== null
              ? typeof a.discountPrice === "number"
                ? a.discountPrice
                : Number(a.discountPrice) || 0
              : typeof a.price === "number"
                ? a.price
                : Number(a.price) || 0;
          const priceB =
            b.discountPrice !== undefined && b.discountPrice !== null
              ? typeof b.discountPrice === "number"
                ? b.discountPrice
                : Number(b.discountPrice) || 0
              : typeof b.price === "number"
                ? b.price
                : Number(b.price) || 0;
          return priceA - priceB;
        });
        break;
      case "price-desc":
        filtered.sort((a, b) => {
          const priceA =
            a.discountPrice !== undefined && a.discountPrice !== null
              ? typeof a.discountPrice === "number"
                ? a.discountPrice
                : Number(a.discountPrice) || 0
              : typeof a.price === "number"
                ? a.price
                : Number(a.price) || 0;
          const priceB =
            b.discountPrice !== undefined && b.discountPrice !== null
              ? typeof b.discountPrice === "number"
                ? b.discountPrice
                : Number(b.discountPrice) || 0
              : typeof b.price === "number"
                ? b.price
                : Number(b.price) || 0;
          return priceB - priceA;
        });
        break;
      case "date-asc":
        filtered.sort((a, b) => {
          const dateA = a.dateAdded
            ? new Date(a.dateAdded).getTime()
            : Date.now();
          const dateB = b.dateAdded
            ? new Date(b.dateAdded).getTime()
            : Date.now();
          return dateA - dateB;
        });
        break;
      case "date-desc":
        filtered.sort((a, b) => {
          const dateA = a.dateAdded
            ? new Date(a.dateAdded).getTime()
            : Date.now();
          const dateB = b.dateAdded
            ? new Date(b.dateAdded).getTime()
            : Date.now();
          return dateB - dateA;
        });
        break;
    }

    return filtered;
  }, [products, sortCriteria, selectedPriceRange, selectedCategories]);

  // Close the mobile filter modal when the window size changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowMobileFilters(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSortChange = (value: string) => {
    setSortCriteria(value as SortCriteria);
  };

  const handlePriceRangeChange = (value: string) => {
    setSelectedPriceRange(value);
  };

  return (
    <div className="w-full">
      {/* Mobile filter toggle button */}
      <div className="block md:hidden mb-4">
        <Button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          variant="outline"
          className="w-full"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          {showMobileFilters ? "Hide Filters" : "Show Filters"}
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar filters - hidden on mobile until toggled */}
        <div
          className={`${
            showMobileFilters ? "block" : "hidden"
          } md:block w-full md:w-64 shrink-0`}
        >
          <div className="bg-white rounded-lg border p-4 sticky top-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Filters</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-8 px-2 text-xs"
              >
                <FilterX className="h-3 w-3 mr-1" />
                Reset
              </Button>
            </div>

            {/* Categories Filter */}
            {categories && categories.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-2">Categories</h4>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() =>
                          toggleCategoryFilter(category.id)
                        }
                      />
                      <label
                        htmlFor={`category-${category.id}`}
                        className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {category.name}
                        {category.productCount !== undefined && (
                          <span className="text-gray-500 ml-1">
                            ({category.productCount})
                          </span>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Price Range Filter */}
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-2">Price Range</h4>
              <Select
                value={selectedPriceRange}
                onValueChange={handlePriceRangeChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select price range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="0-50">Under 50 EGP</SelectItem>
                  <SelectItem value="50-100">50 - 100 EGP</SelectItem>
                  <SelectItem value="100-200">100 - 200 EGP</SelectItem>
                  <SelectItem value="200-500">200 - 500 EGP</SelectItem>
                  <SelectItem value="500-1000">500 - 1000 EGP</SelectItem>
                  <SelectItem value="1000-999999">Over 1000 EGP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Close filter button on mobile */}
            <div className="block md:hidden">
              <Button
                onClick={() => setShowMobileFilters(false)}
                className="w-full"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold">
                {filteredProducts.length} Products
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <Select value={sortCriteria} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort products" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="name-asc">Name: A-Z</SelectItem>
                  <SelectItem value="name-desc">Name: Z-A</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="date-desc">Newest</SelectItem>
                  <SelectItem value="date-asc">Oldest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border">
              <h3 className="text-lg font-medium mb-2">No products found</h3>
              <p className="text-gray-500 mb-6">
                Try adjusting your filters to find what you're looking for
              </p>
              <Button onClick={resetFilters} variant="outline">
                <FilterX className="h-4 w-4 mr-2" />
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  showVendor={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sorting;
