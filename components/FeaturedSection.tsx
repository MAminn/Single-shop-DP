import React from "react";
import { ProductCard } from "./ProductCard";
import { Button } from "./ui/button";
import { Link } from "./Link";
import { ChevronRight } from "lucide-react";
import AnimatedContent from "./AnimatedContent";

interface Product {
  id: string;
  name: string;
  price: number | string;
  imageUrl?: string | null;
  available: boolean;
  categoryName?: string | null;
  vendorId: string;
  vendorName: string | null;
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
        <AnimatedContent
          distance={30}
          direction="vertical"
          reverse={false}
          config={{ tension: 60, friction: 30 }}
          initialOpacity={0}
          animateOpacity
          scale={1}
          threshold={0.1}
        >
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
                  <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            )}
          </div>
        </AnimatedContent>

        {/* Products grid with staggered animation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {displayProducts.map((product, index) => (
            <AnimatedContent
              key={product.id}
              distance={20}
              direction="vertical"
              reverse={false}
              config={{ tension: 60, friction: 30 }}
              initialOpacity={0}
              animateOpacity
              scale={1}
              threshold={0.1}
              delay={index * 100}
              className="h-full"
            >
              <ProductCard product={product} />
            </AnimatedContent>
          ))}
        </div>

        {/* Mobile view more button */}
        {viewAllLink && products.length > limit && (
          <div className="text-center mt-8 md:hidden">
            <Button
              asChild
              variant="default"
              className="bg-accent-lb hover:bg-accent-db transition-colors"
            >
              <Link href={viewAllLink}>View More Products</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
