
import React, { useState, useEffect } from "react";
import { trpc } from "#root/shared/trpc/client";
import useTemplate from "#root/frontend/components/template/useTemplate";
import TemplateRenderer from "#root/frontend/components/template/TemplateRenderer";

export { Page };

interface FeaturedProduct {
  id: string;
  name: string;
  price: number;
  discountPrice?: number | string | null;
  stock: number;
  imageUrl?: string;
  images?: { url: string; isPrimary?: boolean }[];
  vendor: string;
  vendorId: string;
  vendorName: string;
  categoryName: string;
  available: boolean;
  categories?: { id: string; name: string }[];
}

function Page() {
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { activeTemplate } = useTemplate('home');

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await trpc.product.search.query({
          limit: 8,
          includeOutOfStock: false,
        });

        if (result.success && result.result) {
          setFeaturedProducts(
            result.result.items.map((item) => ({
              id: item.id,
              name: item.name,
              price: Number(item.price),
              discountPrice: item.discountPrice
                ? Number(item.discountPrice)
                : null,
              stock: item.stock,
              imageUrl: item.imageUrl
                ? item.imageUrl.startsWith("http")
                  ? item.imageUrl
                  : `/uploads/${item.imageUrl}`
                : undefined,
              images: item.images,
              vendor: item.vendorName || "",
              vendorId: item.vendorId || "",
              vendorName: item.vendorName || "",
              categoryName: item.categoryName || "",
              categories: item.categories,
              available: item.stock > 0,
            }))
          );
        } else {
          setError("Failed to fetch featured products");
        }
      } catch (err) {
        setError("Error fetching featured products");
        console.error("Error fetching featured products:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Prepare data for template
  const templateData = {
    featuredProducts,
    isLoading,
    error
  };

  return (
    <TemplateRenderer
      category="home"
      templateId={activeTemplate}
      data={templateData}
    />
  );
}
