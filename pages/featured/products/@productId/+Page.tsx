"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { trpc } from "#root/shared/trpc/client";
import { getTemplateComponent } from "#root/components/template-system/templateConfig";
import { useTemplate } from "#root/frontend/contexts/TemplateContext";
import { useCart } from "#root/lib/context/CartContext";
import { useTracking } from "#root/frontend/contexts/TrackingContext";
import { TrackingEventName } from "#root/shared/types/pixel-tracking";
import { STORE_CURRENCY } from "#root/shared/config/branding";
import type { ProductPageProduct } from "#root/components/template-system/productPage/ProductPageModernSplit";
import type { FeaturedProduct } from "#root/components/template-system/home/HomeFeaturedProducts";

export default function ProductDetailPage() {
  const pageContext = usePageContext();
  const productId = pageContext.routeParams?.productId as string;
  const { getTemplateId } = useTemplate();
  const { addItem, items } = useCart();
  const { trackEvent } = useTracking();
  const hasTrackedView = useRef<string | null>(null);

  const [productData, setProductData] = useState<ProductPageProduct | null>(
    null,
  );
  const [relatedProducts, setRelatedProducts] = useState<FeaturedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductData = useCallback(async () => {
    if (!productId) {
      setError("Product ID is required");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch product details
      const productResponse = await trpc.product.getById.query({ productId });

      if (!productResponse.success) {
        setError(productResponse.error || "Failed to fetch product");
        setIsLoading(false);
        return;
      }

      const product = productResponse.result;

      // Fetch reviews
      const reviewsResponse = await trpc.product.getReviews.query({
        productId,
      });
      const reviewsData = reviewsResponse.success
        ? reviewsResponse.result
        : null;

      // Fetch related products
      const relatedProductsResponse = await trpc.product.view.query({
        categoryId: product.categoryId,
        limit: 4,
      });
      const relatedProductsData = relatedProductsResponse.success
        ? relatedProductsResponse.result
        : null;

      // Extract reviews and their statistics
      const reviewStats = {
        averageRating: reviewsData?.averageRating || 0,
        totalReviews: reviewsData?.totalReviews || 0,
      };

      // Filter related products to exclude current product and map to correct format
      const mappedRelatedProducts: FeaturedProduct[] =
        relatedProductsData?.products
          ?.filter(
            (rp: { product: { id: string } }) => rp.product.id !== productId,
          )
          .map((rp) => ({
            id: rp.product.id,
            name: rp.product.name,
            price: Number(rp.product.price),
            discountPrice: rp.product.discountPrice
              ? Number(rp.product.discountPrice)
              : null,
            imageUrl: rp.file?.diskname
              ? `/uploads/${rp.file.diskname}`
              : undefined,
            images: rp.file?.diskname
              ? [{ url: `/uploads/${rp.file.diskname}`, isPrimary: true }]
              : [],
            categoryName: rp.category.name,
            stock: rp.product.stock || 0,
            available: (rp.product.stock || 0) > 0,
          })) || [];

      // Map product data to ProductPageProduct interface
      const mappedProduct: ProductPageProduct = {
        id: product.id,
        name: product.name,
        price: Number(product.price),
        discountPrice: product.discountPrice
          ? Number(product.discountPrice)
          : null,
        stock: product.stock || 0,
        description: product.description ?? "No description available.",
        imageUrl: product.images?.[0]?.url ?? undefined,
        images: product.images ?? [],
        categoryName: product.categoryName ?? null,
        features: [],
        specifications: [],
        available: (product.stock || 0) > 0,
        rating: reviewStats.averageRating,
        reviewCount: reviewStats.totalReviews,
      };

      setProductData(mappedProduct);
      setRelatedProducts(mappedRelatedProducts);
      setIsLoading(false);
      setError(null);

      // Fire product_viewed event once per product
      if (hasTrackedView.current !== productId) {
        hasTrackedView.current = productId;
        trackEvent(TrackingEventName.PRODUCT_VIEWED, {
          ecommerce: {
            currency: STORE_CURRENCY,
            value: Number(mappedProduct.discountPrice ?? mappedProduct.price),
            items: [
              {
                itemId: mappedProduct.id,
                itemName: mappedProduct.name,
                price: Number(mappedProduct.discountPrice ?? mappedProduct.price),
                category: mappedProduct.categoryName ?? undefined,
              },
            ],
          },
        });
      }
    } catch (err) {
      console.error("Error fetching product data:", err);
      setError("Failed to load product data");
      setIsLoading(false);
    }
  }, [productId, trackEvent]);

  useEffect(() => {
    fetchProductData();
  }, [fetchProductData]);

  const activeTemplateId = getTemplateId("productPage") ?? "product-perce";
  const TemplateEntry = getTemplateComponent("productPage", activeTemplateId);

  if (!TemplateEntry) {
    return <div>Product page template not found.</div>;
  }

  const Template = TemplateEntry.component;

  if (error) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-red-600 mb-2'>Error</h2>
          <p className='text-gray-600'>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <Template
      product={productData ?? undefined}
      relatedProducts={relatedProducts}
      isLoading={isLoading}
      onAddToCart={(product: ProductPageProduct) => {
        const success = addItem(
          {
            id: product.id,
            name: product.name,
            price: Number(product.discountPrice ?? product.price),
            stock: product.stock,
            imageUrl: product.imageUrl,
            categoryName: product.categoryName ?? undefined,
            available: product.available,
          },
          1, // quantity
          {}, // selectedOptions
        );

        if (success) {
          trackEvent(TrackingEventName.PRODUCT_ADDED_TO_CART, {
            ecommerce: {
              currency: STORE_CURRENCY,
              value: Number(product.discountPrice ?? product.price),
              items: [
                {
                  itemId: product.id,
                  itemName: product.name,
                  price: Number(product.discountPrice ?? product.price),
                  quantity: 1,
                  category: product.categoryName ?? undefined,
                },
              ],
            },
          });
        }
      }}
      onAddToWishlist={(product: ProductPageProduct) =>
        console.log("Add to wishlist", product.id)
      }
      onImageClick={(url: string, index: number) =>
        console.log("Image clicked:", url, index)
      }
    />
  );
}
