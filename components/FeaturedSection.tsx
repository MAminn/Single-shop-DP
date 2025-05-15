import React from "react";
import { ProductCard } from "./ProductCard";
import { Button } from "./ui/button";
import { Link } from "./Link";
import { ChevronRight } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number | string;
  discountPrice?: number | string | null;
  imageUrl?: string | null;
  images?: { url: string; isPrimary?: boolean }[];
  available: boolean;
  categoryName?: string | null;
  vendorId: string;
  vendorName: string | null;
  categories?: { id: string; name: string }[];
}

interface FeaturedSectionProps {
  title: string;
  description?: string;
  products: Product[];
  viewAllLink?: string;
  viewAllText?: string;
  backgroundColor?: "white" | "gray" | "accent";
  limit?: number;
}

export function FeaturedSection({
  title,
  description,
  products,
  viewAllLink = "/featured/products",
  viewAllText = "View All",
  backgroundColor = "white",
  limit = 4,
}: FeaturedSectionProps) {
  // Limit the number of products shown
  const displayProducts = products.slice(0, limit);

  // Background color classes based on the theme
  const bgColorClasses = {
    white: "bg-white",
    gray: "bg-gray-50",
    accent: "bg-accent-lb/5",
  };

  return (
    <section className={`py-16 ${bgColorClasses[backgroundColor]}`}>
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center md:text-left md:flex md:items-end md:justify-between">
          <div className="max-w-2xl md:pr-8">
            <h2 className="text-3xl font-bold mb-2">{title}</h2>
            {description && <p className="text-gray-600">{description}</p>}
          </div>

          {viewAllLink && (
            <Button
              asChild
              variant="outline"
              className="mt-4 md:mt-0 group border-accent-lb text-accent-lb hover:bg-accent-lb hover:text-white"
            >
              <Link href={viewAllLink}>
                {viewAllText}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {displayProducts.map((product) => (
            <div key={product.id} className="h-full">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Mobile view more button */}
        {viewAllLink && products.length > limit && (
          <div className="text-center mt-8 md:hidden">
            <Button
              asChild
              variant="default"
              className="bg-accent-lb hover:bg-accent-db"
            >
              <Link href={viewAllLink}>View More Products</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
