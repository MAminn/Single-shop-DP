import { useState, useEffect } from "react";
import { trpc } from "#root/shared/trpc/client";
import { usePageContext } from "vike-react/usePageContext";
import { Loader2, ArrowLeft, ShoppingCart, Store } from "lucide-react";
import AnimatedContent from "#root/components/AnimatedContent";
import { Button } from "#root/components/ui/button";
import { Badge } from "#root/components/ui/badge";
import { Link } from "#root/components/Link";
import { useToast } from "#root/components/ui/use-toast";
import { useCart } from "#root/lib/context/CartContext";

interface ProductType {
  id: string;
  name: string;
  price: string | number;
  stock: number;
  imageUrl: string | null;
  description?: string;
  available: boolean;
  categoryId: string;
  categoryName: string | null;
  vendorId: string;
  vendorName: string | null;
}

export default function ProductDetailPage() {
  const ctx = usePageContext();
  const productId = ctx.urlPathname.split("/").pop();

  console.log("Raw URL pathname:", ctx.urlPathname);
  console.log("Extracted productId:", productId);

  const [product, setProduct] = useState<ProductType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { toast } = useToast();
  const { addItem } = useCart();

  useEffect(() => {
    async function fetchProduct() {
      if (!productId) return;

      try {
        console.log("Fetching product with ID:", productId);
        const result = await trpc.product.search.query({
          limit: 100,
          includeOutOfStock: true,
        });

        if (result.success && result.result) {
          console.log("Total products fetched:", result.result.items.length);

          const productItem = result.result.items.find(
            (item) => item.id === productId
          );

          if (productItem) {
            console.log("Product data fetched:", productItem);
            setProduct({
              ...productItem,
              available: productItem.stock > 0,
              description: "No description available",
            });
          } else {
            console.error(
              "Product not found in results. Available IDs:",
              result.result.items.map((item) => item.id)
            );
            setError("Product not found");
          }
        } else if (!result.success) {
          console.error("Failed to fetch product:", result.error);
          setError(result.error || "Failed to load product information");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("An error occurred while loading the product");
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [productId]);

  const handleAddToCart = () => {
    if (!product || !product.available) return;

    setIsAddingToCart(true);
    try {
      addItem(
        {
          id: product.id,
          name: product.name,
          price:
            typeof product.price === "number"
              ? product.price
              : Number(product.price),
          imageUrl: product.imageUrl || undefined,
          vendorId: Number(product.vendorId),
          stock: product.stock,
        },
        quantity,
        {} // No selected options for now
      );

      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-accent-lb" />
        <span className="ml-3">Loading product...</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container flex flex-col items-center justify-center min-h-[60vh] py-8">
        <h2 className="text-2xl font-bold text-red-500 mb-2">Error</h2>
        <p className="text-gray-600">{error || "Product not found"}</p>
        <Button
          onClick={() => window.history.back()}
          className="mt-4"
          variant="outline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  const isInStock = product.stock > 0;

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
      <div className="container py-8">
        {/* Breadcrumb navigation */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
            className="text-gray-500 hover:text-accent-lb"
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="bg-gray-100 rounded-lg flex items-center justify-center p-4 h-96">
            {product.imageUrl ? (
              <img
                src={
                  product.imageUrl.startsWith("http")
                    ? product.imageUrl
                    : `/uploads/${product.imageUrl}`
                }
                alt={product.name}
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <div className="text-gray-400 flex flex-col items-center">
                <svg
                  className="w-20 h-20"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-labelledby="productImagePlaceholder"
                  role="img"
                >
                  <title id="productImagePlaceholder">
                    Product image placeholder
                  </title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="mt-2">No image available</span>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex flex-col">
            <div className="mb-2">
              {product.categoryName && (
                <Badge className="bg-accent-lb/80 hover:bg-accent-lb">
                  {product.categoryName}
                </Badge>
              )}
              {!isInStock && (
                <Badge className="ml-2 bg-gray-500">Out of Stock</Badge>
              )}
            </div>

            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

            {product.vendorName && (
              <Link
                href={`/featured/brands/@${product.vendorId}`}
                className="text-sm text-gray-500 mb-4 flex items-center hover:text-accent-lb"
              >
                <Store className="inline-block h-4 w-4 mr-1" />
                {product.vendorName}
              </Link>
            )}

            <p className="text-2xl font-bold text-accent-lb mb-4">
              $
              {typeof product.price === "number"
                ? product.price.toFixed(2)
                : Number(product.price).toFixed(2)}
            </p>

            <div className="border-t border-b py-4 my-4">
              <p className="text-gray-600">{product.description}</p>
            </div>

            <div className="mt-auto pt-4">
              <div className="flex items-center mb-4">
                <span className="w-24 text-gray-600">Quantity:</span>
                <div className="flex items-center border rounded-md">
                  <button
                    className="px-3 py-1 border-r"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={!isInStock}
                    type="button"
                  >
                    -
                  </button>
                  <span className="px-4 py-1">{quantity}</span>
                  <button
                    className="px-3 py-1 border-l"
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                    disabled={!isInStock || quantity >= product.stock}
                    type="button"
                  >
                    +
                  </button>
                </div>
                {isInStock && (
                  <span className="ml-4 text-sm text-gray-500">
                    {product.stock} available
                  </span>
                )}
              </div>

              <Button
                className="w-full bg-accent-lb hover:bg-[#021E43]"
                size="lg"
                disabled={!isInStock || isAddingToCart}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {isAddingToCart ? "Adding to Cart..." : "Add to Cart"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AnimatedContent>
  );
}
