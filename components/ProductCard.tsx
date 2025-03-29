import { useState } from "react";
import { Link } from "./Link";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ShoppingCart, Store, Eye } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { useCart } from "#root/lib/context/CartContext";

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
  const { toast } = useToast();
  const { addItem } = useCart();

  const handleAddToCart = () => {
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

  return (
    <div className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col h-full border border-gray-100">
      <Link
        href={`/products/${product.id}`}
        className="overflow-hidden w-full h-48 relative bg-gray-100 flex items-center justify-center"
      >
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
            <Eye className="h-10 w-10" />
          </div>
        )}

        {!product.available && (
          <Badge className="absolute top-2 right-2 bg-gray-500">
            Out of Stock
          </Badge>
        )}

        {product.categoryName && (
          <Badge className="absolute top-2 left-2 bg-accent-lb/80 hover:bg-accent-lb">
            {product.categoryName}
          </Badge>
        )}
      </Link>

      <div className="flex flex-col flex-grow p-4">
        <div className="flex-grow">
          <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
            <Link
              href={`/products/${product.id}`}
              className="hover:text-accent-lb"
            >
              {product.name}
            </Link>
          </h3>

          {showVendor && (
            <Link
              href={`/featured/brands/@${product.vendorId}`}
              className="text-xs text-gray-500 mb-2 flex items-center hover:text-accent-lb"
            >
              <Store className="inline-block h-3 w-3 mr-1" />
              {product.vendorName}
            </Link>
          )}
        </div>

        <div className="flex justify-between items-center mt-2">
          <span className="text-lg font-bold text-gray-900">
            $
            {typeof product.price === "number"
              ? product.price.toFixed(2)
              : Number(product.price).toFixed(2)}
          </span>

          <Button
            size="sm"
            variant={product.available ? "default" : "outline"}
            disabled={!product.available || isAddingToCart}
            onClick={handleAddToCart}
            className={
              product.available ? "bg-accent-lb hover:bg-[#021E43]" : ""
            }
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            {isAddingToCart ? "Adding..." : "Add"}
          </Button>
        </div>
      </div>
    </div>
  );
};
