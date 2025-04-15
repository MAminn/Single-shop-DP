import { useState, useMemo, memo } from "react";
import { Link } from "./Link";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ShoppingCart, Store, Eye } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { useCart } from "#root/lib/context/CartContext";
import { getProductUrl, getVendorUrl } from "#root/lib/utils/route-helpers";

interface ProductImage {
  url: string;
  isPrimary?: boolean;
}

interface Product {
  id: string;
  name: string;
  price: number | string;
  imageUrl?: string | null;
  images?: ProductImage[];
  available: boolean;
  categoryName?: string | null;
  vendorId: string;
  vendorName: string | null;
  categories?: { id: string; name: string }[];
}

interface ProductCardProps {
  product: Product;
  showVendor?: boolean;
}

// Memoize the entire component for better performance
export const ProductCard = memo(
  ({ product, showVendor = true }: ProductCardProps) => {
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const { toast } = useToast();
    const { addItem } = useCart();

    // Memoize the add to cart handler to prevent unnecessary re-renders
    const handleAddToCart = useMemo(
      () => (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!product.available) return;

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
              imageUrl: getDisplayImageUrl(),
              vendorId: Number(product.vendorId),
              stock: 100, // Assuming available products have stock
            },
            1, // quantity
            {} // selectedOptions
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
      },
      [product, addItem, toast]
    );

    // Memoize image URL calculation
    const getDisplayImageUrl = useMemo(
      () => (): string => {
        // If we have multiple images, find the primary one or use the first
        if (product.images && product.images.length > 0) {
          const primaryImage = product.images.find((img) => img.isPrimary);
          const imageToUse = primaryImage || product.images[0];

          if (imageToUse?.url) {
            if (imageToUse.url.startsWith("http")) {
              return imageToUse.url;
            }

            if (imageToUse.url.startsWith("/uploads/")) {
              return imageToUse.url;
            }

            return `/uploads/${imageToUse.url}`;
          }
        }

        // Fallback to legacy imageUrl if available
        if (product.imageUrl) {
          if (product.imageUrl.startsWith("http")) {
            return product.imageUrl;
          }

          if (product.imageUrl.startsWith("/uploads/")) {
            return product.imageUrl;
          }

          return `/uploads/${product.imageUrl}`;
        }

        return "";
      },
      [product.images, product.imageUrl]
    );

    // Memoize expensive calculations
    const formattedPrice = useMemo(
      () =>
        typeof product.price === "number"
          ? product.price.toFixed(2)
          : Number(product.price).toFixed(2),
      [product.price]
    );

    const hasImage = useMemo(
      () => !!(product.images?.length || product.imageUrl),
      [product.images, product.imageUrl]
    );
    const displayImageUrl = useMemo(
      () => getDisplayImageUrl(),
      [getDisplayImageUrl]
    );

    // Handle image load event
    const handleImageLoad = () => {
      setImageLoaded(true);
    };

    return (
      <div
        className="group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col h-full border border-gray-100"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link
          href={getProductUrl(product.id)}
          className="overflow-hidden w-full aspect-square relative bg-gray-50 flex items-center justify-center"
        >
          {hasImage ? (
            <>
              {/* Low quality image placeholder */}
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
              )}
              <img
                src={displayImageUrl}
                alt={product.name}
                width="400"
                height="400"
                loading="lazy"
                decoding="async"
                onLoad={handleImageLoad}
                className={`w-full h-full object-cover transform transition-transform duration-300 
                ${isHovered ? "scale-105" : "scale-100"}
                ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                fetchPriority="auto"
              />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
              <Eye className="h-10 w-10" />
            </div>
          )}

          {!product.available && (
            <Badge className="absolute top-2 right-2 bg-gray-500/90 backdrop-blur-sm">
              Out of Stock
            </Badge>
          )}

          {/* Display primary category from categories array if available, otherwise fall back to categoryName */}
          {product.categories && product.categories.length > 0 ? (
            <Badge className="absolute top-2 left-2 bg-accent-lb/90 hover:bg-accent-lb backdrop-blur-sm">
              {product.categories[0]?.name || "Category"}
            </Badge>
          ) : (
            product.categoryName && (
              <Badge className="absolute top-2 left-2 bg-accent-lb/90 hover:bg-accent-lb backdrop-blur-sm">
                {product.categoryName}
              </Badge>
            )
          )}

          {/* Quick add button that appears on hover */}
          {product.available && (
            <div
              className={`absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent transform transition-all duration-200 ${isHovered ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}
            >
              <Button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className="w-full bg-white text-accent-lb hover:bg-accent-lb hover:text-white transition-colors"
                size="sm"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {isAddingToCart ? "Adding..." : "Quick Add"}
              </Button>
            </div>
          )}
        </Link>

        <div className="flex flex-col flex-grow p-4">
          <div className="flex-grow">
            <h3 className="font-medium text-gray-900 text-sm md:text-base mb-1 line-clamp-2 group-hover:text-accent-lb transition-colors">
              <Link
                href={getProductUrl(product.id)}
                className="hover:text-accent-lb"
              >
                {product.name}
              </Link>
            </h3>

            {showVendor && product.vendorName && (
              <Link
                href={getVendorUrl(product.vendorId)}
                className="text-xs text-gray-500 mb-2 flex items-center hover:text-accent-lb transition-colors"
              >
                <Store className="inline-block h-3 w-3 mr-1" />
                {product.vendorName}
              </Link>
            )}
          </div>

          <div className="flex justify-between items-center mt-2">
            <span className="text-lg font-bold text-gray-900 tracking-tight">
              {formattedPrice} EGP
            </span>

            <Button
              size="sm"
              variant={product.available ? "outline" : "ghost"}
              disabled={!product.available || isAddingToCart}
              onClick={handleAddToCart}
              className={
                product.available
                  ? "border-accent-lb text-accent-lb hover:bg-accent-lb hover:text-white transition-colors"
                  : "text-gray-400 border-gray-300"
              }
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }
);
