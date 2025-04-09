import { useState } from "react";
import { Loader2, ShoppingBag } from "lucide-react";
import { ProductCard } from "#root/components/ProductCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#root/components/ui/select";
import { Button } from "#root/components/ui/button";
import { useData } from "vike-react/useData";
import type { Data } from "./+data";

interface Product {
  id: string;
  name: string;
  price: number | string;
  stock: number;
  imageUrl: string | null;
  images?: { url: string; isPrimary?: boolean }[];
  available: boolean;
  categoryId: string;
  categoryName: string | null;
  vendorId: string;
  vendorName: string | null;
  categories?: { id: string; name: string }[];
}

type SortCriteria =
  | "featured"
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc";

const Page = () => {
  const data = useData<Data>();
  const [sortCriteria, setSortCriteria] = useState<SortCriteria>("featured");

  // Handle error state
  if (!data.success) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-semibold text-red-800 mb-4">
            Something went wrong
          </h2>
          <p className="text-red-600 mb-6">{data.error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-accent-lb hover:bg-accent-db"
          >
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Now TypeScript knows data is the success variant
  const { products } = data;

  const getSortedProducts = () => {
    if (products.length === 0) return [];

    const sortedProducts = [...products];

    switch (sortCriteria) {
      case "featured":
        break;
      case "name-asc":
        sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "price-asc":
        sortedProducts.sort((a, b) => {
          const priceA =
            typeof a.price === "number" ? a.price : Number(a.price) || 0;
          const priceB =
            typeof b.price === "number" ? b.price : Number(b.price) || 0;
          return priceA - priceB;
        });
        break;
      case "price-desc":
        sortedProducts.sort((a, b) => {
          const priceA =
            typeof a.price === "number" ? a.price : Number(a.price) || 0;
          const priceB =
            typeof b.price === "number" ? b.price : Number(b.price) || 0;
          return priceB - priceA;
        });
        break;
    }

    return sortedProducts;
  };

  const sortedProducts = getSortedProducts();

  return (
    <div className="w-full">
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Featured Products
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto">
            Explore our complete collection of high-quality products.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">All Products</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <Select
              value={sortCriteria}
              onValueChange={(value) => setSortCriteria(value as SortCriteria)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort products" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="name-asc">Name: A-Z</SelectItem>
                <SelectItem value="name-desc">Name: Z-A</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {sortedProducts.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No products found</h2>
            <p className="text-gray-500">
              We couldn't find any products matching your criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
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
  );
};

export default Page;
