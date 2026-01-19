import React, { useState, useEffect } from "react";
import { trpc } from "#root/shared/trpc/client";
import { getTemplateComponent } from "#root/components/template-system";
import { useTemplate } from "#root/frontend/contexts/TemplateContext";
import type { LandingTemplateModernProps } from "#root/components/template-system";
import { DEFAULT_HOMEPAGE_CONTENT } from "#root/shared/types/homepage-content";
import type { HomepageContent } from "#root/shared/types/homepage-content";

export { Page };

interface FeaturedProduct {
  id: string;
  name: string;
  price: number;
  discountPrice?: number | string | null;
  stock: number;
  imageUrl?: string;
  images?: { url: string; isPrimary?: boolean }[];
  categoryName: string;
  available: boolean;
  categories?: { id: string; name: string }[];
}

function Page() {
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>(
    []
  );
  const [homepageContent, setHomepageContent] = useState<HomepageContent>(
    DEFAULT_HOMEPAGE_CONTENT
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getTemplateId } = useTemplate();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch featured products
        const productsResult = await trpc.product.search.query({
          limit: 8,
          includeOutOfStock: false,
        });

        if (productsResult.success && productsResult.result) {
          setFeaturedProducts(
            productsResult.result.items.map((item) => ({
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
              categoryName: item.categoryName || "",
              categories: item.categories,
              available: item.stock > 0,
            }))
          );
        }

        // Fetch homepage content
        // TODO: Replace with actual merchantId from context/auth
        const merchantId = "00000000-0000-0000-0000-000000000000";
        try {
          const contentResult = await trpc.homepage.getContent.query({
            merchantId,
          });

          if (contentResult.success && contentResult.result) {
            setHomepageContent(contentResult.result);
          }
        } catch (err) {
          console.warn("Using default homepage content:", err);
          // Continue with default content
        }
      } catch (err) {
        setError("Error loading homepage data");
        console.error("Error loading homepage data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get the selected landing template (default to landing-modern)
  const selectedId = getTemplateId("landing") ?? "landing-modern";
  const templateEntry = getTemplateComponent("landing", selectedId);

  if (!templateEntry) {
    return <div>Error: Landing page template not found.</div>;
  }

  const Template = templateEntry.component;

  // Prepare props for LandingTemplateModern
  const templateProps: LandingTemplateModernProps = {
    content: homepageContent,
    featuredProducts,
    onCtaClick: (link: string) => {
      window.location.href = link;
    },
  };

  return <Template {...templateProps} />;
}
