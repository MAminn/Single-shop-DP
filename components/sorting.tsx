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

// Define product interface to match what is expected by the ProductCard
interface SortableProduct {
  id: string;
  name: string;
  price: number | string;
  imageUrl?: string | null;
  available: boolean;
  categoryName?: string | null;
  vendorId: string;
  vendorName: string | null;
  stock?: number;
  sku?: string;
  vendor?: string;
  dateAdded?: string;
}

interface SortingProps {
  categoryId?: string;
  vendorId?: string;
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
}: SortingProps) => {
  const [products, setProducts] = useState<SortableProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortCriteria, setSortCriteria] = useState<SortCriteria>("featured");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();


  useEffect(() => {
    setIsLoading(true);
    setProducts([]); // Clear previous products on parameters change

    if (categoryId) {
      // Fetch by category
      trpc.product.search
        .query({
          categoryIds: [categoryId],
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
                stock: item.stock,
                imageUrl: item.imageUrl
                  ? item.imageUrl.startsWith("http")
                    ? item.imageUrl
                    : item.imageUrl.startsWith("/uploads/")
                      ? item.imageUrl
                      : `/uploads/${item.imageUrl}`
                  : undefined,
                vendor: item.vendorName || "",
                vendorId: item.vendorId || "",
                vendorName: item.vendorName || "",
                categoryName: item.categoryName,
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
    } else if (vendorId) {
      // Fetch by vendor

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
                stock: item.stock,
                imageUrl: item.imageUrl
                  ? item.imageUrl.startsWith("http")
                    ? item.imageUrl
                    : item.imageUrl.startsWith("/uploads/")
                      ? item.imageUrl
                      : `/uploads/${item.imageUrl}`
                  : undefined,
                vendor: item.vendorName || "",
                vendorId: item.vendorId || "",
                vendorName: item.vendorName || "",
                categoryName: item.categoryName,
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
    } else {
      // Fetch all products if no categoryId or vendorId
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
                stock: item.stock,
                imageUrl: item.imageUrl
                  ? item.imageUrl.startsWith("http")
                    ? item.imageUrl
                    : item.imageUrl.startsWith("/uploads/")
                      ? item.imageUrl
                      : `/uploads/${item.imageUrl}`
                  : undefined,
                vendor: item.vendorName || "",
                vendorId: item.vendorId || "",
                vendorName: item.vendorName || "",
                categoryName: item.categoryName || "",
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
    }
  }, [categoryId, vendorId, toast]);

  // Create a memoized filtered and sorted products list
  const filteredProducts = useMemo(() => {
    // First filter by price range
    let filtered = [...products];

    if (selectedPriceRange !== "all") {
      const [minStr, maxStr] = selectedPriceRange.split("-");
      const min = Number(minStr);
      const max = Number(maxStr);

      if (!Number.isNaN(min) && !Number.isNaN(max)) {
        filtered = products.filter((product) => {
          const price =
            typeof product.price === "number"
              ? product.price
              : Number(product.price);
          return price >= min && price <= max;
        });
      }
    }

    // Then sort the filtered products
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
            typeof a.price === "number" ? a.price : Number(a.price);
          const priceB =
            typeof b.price === "number" ? b.price : Number(b.price);
          return priceA - priceB;
        });
        break;
      case "price-desc":
        filtered.sort((a, b) => {
          const priceA =
            typeof a.price === "number" ? a.price : Number(a.price);
          const priceB =
            typeof b.price === "number" ? b.price : Number(b.price);
          return priceB - priceA;
        });
        break;
      case "date-asc":
        filtered.sort((a, b) => {
          const dateA = a.dateAdded ? new Date(a.dateAdded).getTime() : 0;
          const dateB = b.dateAdded ? new Date(b.dateAdded).getTime() : 0;
          return dateA - dateB;
        });
        break;
      case "date-desc":
        filtered.sort((a, b) => {
          const dateA = a.dateAdded ? new Date(a.dateAdded).getTime() : 0;
          const dateB = b.dateAdded ? new Date(b.dateAdded).getTime() : 0;
          return dateB - dateA;
        });
        break;
      default:
        break;
    }

    return filtered;
  }, [products, sortCriteria, selectedPriceRange]);

  // Function to reset filters
  const resetFilters = () => {
    setSelectedPriceRange("all");
    setSortCriteria("featured");
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-accent-lb mb-4" />
        <p className="text-gray-500">Loading products...</p>
      </div>
    );
  }

  const hasFiltersApplied =
    selectedPriceRange !== "all" || sortCriteria !== "featured";

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6">
      {/* Filter and Sort Controls */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold">
              {categoryId
                ? "Category Products"
                : vendorId
                  ? "Brand Products"
                  : "All Products"}
            </h2>
            <span className="ml-2 text-sm text-gray-500">
              ({filteredProducts.length} items)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>

            {hasFiltersApplied && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                <FilterX className="h-4 w-4 mr-2" />
                Reset
              </Button>
            )}

            <Select
              value={sortCriteria}
              onValueChange={(value) => setSortCriteria(value as SortCriteria)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                <SelectItem value="date-asc">Oldest First</SelectItem>
                <SelectItem value="date-desc">Newest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Mobile Filter Panel */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            showFilters ? "max-h-96" : "max-h-0"
          }`}
        >
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h3 className="font-medium mb-3">Price Range</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className={`text-sm py-1.5 px-3 rounded-full transition-colors ${
                  selectedPriceRange === "all"
                    ? "bg-accent-lb text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() => setSelectedPriceRange("all")}
              >
                All Prices
              </button>
              <button
                type="button"
                className={`text-sm py-1.5 px-3 rounded-full transition-colors ${
                  selectedPriceRange === "0-50"
                    ? "bg-accent-lb text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() => setSelectedPriceRange("0-50")}
              >
                Under 50 EGP
              </button>
              <button
                type="button"
                className={`text-sm py-1.5 px-3 rounded-full transition-colors ${
                  selectedPriceRange === "50-100"
                    ? "bg-accent-lb text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() => setSelectedPriceRange("50-100")}
              >
                50 - 100 EGP
              </button>
              <button
                type="button"
                className={`text-sm py-1.5 px-3 rounded-full transition-colors ${
                  selectedPriceRange === "100-200"
                    ? "bg-accent-lb text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() => setSelectedPriceRange("100-200")}
              >
                100 - 200 EGP
              </button>
              <button
                type="button"
                className={`text-sm py-1.5 px-3 rounded-full transition-colors ${
                  selectedPriceRange === "200-500"
                    ? "bg-accent-lb text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() => setSelectedPriceRange("200-500")}
              >
                200 - 500 EGP
              </button>
              <button
                type="button"
                className={`text-sm py-1.5 px-3 rounded-full transition-colors ${
                  selectedPriceRange === "500-10000"
                    ? "bg-accent-lb text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() => setSelectedPriceRange("500-10000")}
              >
                500+ EGP
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout with Sidebar */}
      <div className="hidden lg:flex gap-4 mt-4">
        <div className="w-56 bg-gray-50 p-4 rounded-lg h-fit">
          <h3 className="font-medium mb-3">Price Range</h3>
          <div className="space-y-2">
            <button
              type="button"
              className={`text-sm w-full text-left py-1.5 px-3 rounded-md transition-colors ${
                selectedPriceRange === "all"
                  ? "bg-accent-lb text-white"
                  : "hover:bg-gray-200 text-gray-700"
              }`}
              onClick={() => setSelectedPriceRange("all")}
            >
              All Prices
            </button>
            <button
              type="button"
              className={`text-sm w-full text-left py-1.5 px-3 rounded-md transition-colors ${
                selectedPriceRange === "0-50"
                  ? "bg-accent-lb text-white"
                  : "hover:bg-gray-200 text-gray-700"
              }`}
              onClick={() => setSelectedPriceRange("0-50")}
            >
              Under 50 EGP
            </button>
            <button
              type="button"
              className={`text-sm w-full text-left py-1.5 px-3 rounded-md transition-colors ${
                selectedPriceRange === "50-100"
                  ? "bg-accent-lb text-white"
                  : "hover:bg-gray-200 text-gray-700"
              }`}
              onClick={() => setSelectedPriceRange("50-100")}
            >
              50 - 100 EGP
            </button>
            <button
              type="button"
              className={`text-sm w-full text-left py-1.5 px-3 rounded-md transition-colors ${
                selectedPriceRange === "100-200"
                  ? "bg-accent-lb text-white"
                  : "hover:bg-gray-200 text-gray-700"
              }`}
              onClick={() => setSelectedPriceRange("100-200")}
            >
              100 - 200 EGP
            </button>
            <button
              type="button"
              className={`text-sm w-full text-left py-1.5 px-3 rounded-md transition-colors ${
                selectedPriceRange === "200-500"
                  ? "bg-accent-lb text-white"
                  : "hover:bg-gray-200 text-gray-700"
              }`}
              onClick={() => setSelectedPriceRange("200-500")}
            >
              200 - 500 EGP
            </button>
            <button
              type="button"
              className={`text-sm w-full text-left py-1.5 px-3 rounded-md transition-colors ${
                selectedPriceRange === "500-10000"
                  ? "bg-accent-lb text-white"
                  : "hover:bg-gray-200 text-gray-700"
              }`}
              onClick={() => setSelectedPriceRange("500-10000")}
            >
              500+ EGP
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={`product-${product.id}`}
                  className="transition-all duration-300"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-gray-500 mb-4">
                No products match your filters.
              </p>
              <Button variant="outline" onClick={resetFilters}>
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Products Grid */}
      <div className="lg:hidden">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={`product-${product.id}`}
                className="transition-all duration-300"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-gray-500 mb-4">
              No products match your filters.
            </p>
            <Button variant="outline" onClick={resetFilters}>
              Reset Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sorting;
