import React, { useState, useEffect } from "react";
import { trpc } from "#root/shared/trpc/client";
import { getStoreOwnerId } from "#root/shared/config/store";
import { getTemplateComponent } from "#root/components/template-system";
import { useTemplate } from "#root/frontend/contexts/TemplateContext";
import type { LandingTemplateModernProps } from "#root/components/template-system";
import { DEFAULT_HOMEPAGE_CONTENT } from "#root/shared/types/homepage-content";
import type { HomepageContent } from "#root/shared/types/homepage-content";
import type { CategoryStripItem } from "#root/components/shop/CategoryStrip";
import type { NewArrivalProduct } from "#root/components/shop/NewArrivals";

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
    [],
  );
  const [homepageContent, setHomepageContent] = useState<HomepageContent>(
    DEFAULT_HOMEPAGE_CONTENT,
  );
  const [categories, setCategories] = useState<CategoryStripItem[]>([]);
  const [newArrivals, setNewArrivals] = useState<NewArrivalProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [newArrivalsLoading, setNewArrivalsLoading] = useState(true);
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
            })),
          );
        }

        // Fetch homepage content
        const merchantId = getStoreOwnerId();
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

  // Fetch categories separately (parallel loading)
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const categoriesResult = await trpc.category.view.query();

        if (categoriesResult.success && categoriesResult.result) {
          const mappedCategories: CategoryStripItem[] = categoriesResult.result
            .filter((cat: any) => !cat.deleted)
            .slice(0, 8) // Limit to 8 categories for the strip
            .map((cat: any) => ({
              id: cat.id,
              name: cat.name,
              slug: cat.slug,
              imageUrl: cat.filename || null,
            }));

          setCategories(mappedCategories);
        }
      } catch (err) {
        console.error("Error loading categories:", err);
        // Continue without categories
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch new arrivals (newest products, parallel loading)
  useEffect(() => {
    const fetchNewArrivals = async () => {
      setNewArrivalsLoading(true);
      try {
        const result = await trpc.product.search.query({
          limit: 8,
          sortBy: "newest",
          includeOutOfStock: true,
        });

        if (result.success && result.result) {
          setNewArrivals(
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
              categoryName: item.categoryName || null,
              available: item.stock > 0,
            })),
          );
        }
      } catch (err) {
        console.error("Error loading new arrivals:", err);
      } finally {
        setNewArrivalsLoading(false);
      }
    };

    fetchNewArrivals();
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
    categories,
    categoriesLoading,
    newArrivals,
    newArrivalsLoading,
    onCtaClick: (link: string) => {
      window.location.href = link;
    },
  };

  return <Template {...templateProps} />;
}
