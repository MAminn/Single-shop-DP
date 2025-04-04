import { ProductDetail } from "#root/components/shop/ProductDetail";
import AnimatedContent from "#root/components/AnimatedContent";
import { ErrorSection } from "#root/components/error-section";
import { useProductId } from "#root/hooks/useProductId";

export default function ProductDetailPage() {
  const { productId, isLoading, error } = useProductId();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-8 w-8 border-4 border-accent-lb border-t-transparent rounded-full"></div>
        <span className="ml-3">Loading...</span>
      </div>
    );
  }

  if (error || !productId) {
    return (
      <ErrorSection error={error || "Product not found. Invalid product ID."} />
    );
  }

  return (
    <AnimatedContent
      distance={100}
      direction="vertical"
      reverse={false}
      config={{ tension: 60, friction: 30 }}
      initialOpacity={0}
      animateOpacity
      scale={1}
      threshold={0.1}
    >
      <ProductDetail productId={productId} />
    </AnimatedContent>
  );
}
