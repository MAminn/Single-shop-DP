import { useState, useEffect, useCallback } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { trpc } from "#root/shared/trpc/client";
import TemplateRenderer from "#root/frontend/components/template/TemplateRenderer";
import useTemplate from "#root/frontend/components/template/useTemplate";
import type { ProductTemplateData } from "#root/frontend/components/template/templateRegistry";
import { string } from "zod";
import { number } from "zod";
import { user } from "#root/shared/database/drizzle/schema";

export default function ProductDetailPage() {
  const pageContext = usePageContext();
  const productId = pageContext.routeParams?.productId as string;
  const { activeTemplate } = useTemplate('product');
  
  const [templateData, setTemplateData] = useState<ProductTemplateData>({
    product: {
      id: '',
      name: '',
      description: '',
      price: 0,
      discountPrice: null,
      images: [],
      stock: 0,
      available: false,
      categoryId: '',
      categoryName: '',
      vendorId: '',
      vendorName: '',
      variants: [],
      specifications: {},
      features: []
    },
    reviews: [],
    reviewStats: {
      averageRating: 0,
      totalReviews: 0
    },
    relatedProducts: [],
    selectedOptions: {},
    quantity: 1,
    currentImageIndex: 0,
    isZoomed: false,
    isAddingToCart: false,
    isSubmittingReview: false,
    isLoading: true,
    error: null
  });

  const fetchProductData = useCallback(async () => {
    if (!productId) {
      setTemplateData(prev => ({
        ...prev,
        isLoading: false,
        error: "Product ID is required"
      }));
      return;
    }

    setTemplateData(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }));

    try {
      // Fetch product details
      const productResponse = await trpc.product.getById.query({ productId });
      
      if (!productResponse.success) {
        setTemplateData(prev => ({
          ...prev,
          isLoading: false,
          error: productResponse.error || "Failed to fetch product"
        }));
        return;
      }

      const product = productResponse.result;

      // Fetch reviews
      const reviewsResponse = await trpc.product.getReviews.query({ productId });
      const reviewsData = reviewsResponse.success ? reviewsResponse.result : null;

      // Fetch related products
      const relatedProductsResponse = await trpc.product.view.query({ 
        categoryId: product.categoryId,
        limit: 4 
      });
      const relatedProductsData = relatedProductsResponse.success ? relatedProductsResponse.result : null;

      // Extract reviews and their statistics
      const reviews = reviewsData?.reviews?.map((review: {
        id: string;
        productId: string;
        userId: string | null;
        userName: string;
        rating: number;
        comment: string;
        createdAt: Date;
      }) => ({
        id: review.id,
        userName: review.userName,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt.toISOString()
      })) || [];
      const reviewStats = {
        averageRating: reviewsData?.averageRating || 0,
        totalReviews: reviewsData?.totalReviews || 0
      };

      // Filter related products to exclude current product and map to correct format
      const relatedProducts = relatedProductsData?.products?.filter((rp: { product: { id: string } }) => rp.product.id !== productId).map((rp) => ({
        id: rp.product.id,
        name: rp.product.name,
        price: Number(rp.product.price),
        discountPrice: rp.product.discountPrice ? Number(rp.product.discountPrice) : undefined,
        imageUrl: rp.file?.diskname ? `/uploads/${rp.file.diskname}` : undefined,
        images: rp.file?.diskname ? [{ url: `/uploads/${rp.file.diskname}`, isPrimary: true }] : [],
        vendorName: rp.vendor.name,
        categoryName: rp.category.name
      })) || [];

      // Update template data
      setTemplateData(prev => ({
        ...prev,
        product: {
          id: product.id,
          name: product.name,
          description: product.description,
          price: Number(product.price),
          discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
          images: product.images || [],
          stock: product.stock || 0,
          available: product.available,
          categoryId: product.categoryId,
          categoryName: product.categoryName,
          vendorId: product.vendorId,
          vendorName: product.vendorName,
          variants: product.variants || [],
          specifications: {},
          features: []
        },
        reviews,
        reviewStats,
        relatedProducts,
        isLoading: false,
        error: null
      }));
    } catch (err) {
      console.error("Error fetching product data:", err);
      setTemplateData(prev => ({
        ...prev,
        isLoading: false,
        error: "Failed to load product data"
      }));
    }
  }, [productId]);

  useEffect(() => {
    fetchProductData();
  }, [fetchProductData]);

  const handleDataUpdate = useCallback((updates: Partial<ProductTemplateData>) => {
    setTemplateData(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  return (
    <TemplateRenderer
      category="product"
      templateId={activeTemplate}
      data={templateData}
      onDataUpdate={handleDataUpdate}
    />
  );
}
