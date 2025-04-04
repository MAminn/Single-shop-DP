import { useState } from "react";
import { Link } from "./Link";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ShoppingCart, Store, Eye } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { useCart } from "#root/lib/context/CartContext";
import { getProductUrl, getVendorUrl } from "#root/lib/utils/route-helpers";

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

interface ProductCardProps {
  product: Product;
  showVendor?: boolean;
}

export const ProductCard = ({
  product,
  showVendor = true,
}: ProductCardProps) => {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { toast } = useToast();
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
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
          imageUrl: product.imageUrl?.toString(),
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
  };

  const formattedPrice =
    typeof product.price === "number"
      ? product.price.toFixed(2)
      : Number(product.price).toFixed(2);

  return (
    <div
      className="group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full border border-gray-100"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        href={getProductUrl(product.id)}
        className="overflow-hidden w-full aspect-square relative bg-gray-50 flex items-center justify-center"
      >
        {product.imageUrl ? (
          <img
            src={
              product.imageUrl.startsWith("http")
                ? product.imageUrl
                : product.imageUrl.startsWith("/uploads/")
                  ? product.imageUrl
                  : `/uploads/${product.imageUrl}`
            }
            alt={product.name}
            className={`w-full h-full object-cover transform transition-transform duration-500 
              ${isHovered ? "scale-110" : "scale-100"}`}
          />
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

        {product.categoryName && (
          <Badge className="absolute top-2 left-2 bg-accent-lb/90 hover:bg-accent-lb backdrop-blur-sm">
            {product.categoryName}
          </Badge>
        )}

        {/* Quick add button that appears on hover */}
        {product.available && (
          <div
            className={`absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent transform transition-all duration-300 ${isHovered ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}
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
            ${formattedPrice}
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
};
