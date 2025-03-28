import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#root/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "#root/components/ui/dialog";
import { Button } from "#root/components/ui/button";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useToast } from "#root/components/ui/use-toast";
import { useCart } from "#root/lib/context/CartContext";
import type { Product } from "#root/lib/mock-data/products";
import { trpc } from "#root/shared/trpc/client";

interface SortingProps {
  categoryId?: string;
}

type SortCriteria =
  | "featured"
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc"
  | "date-asc"
  | "date-desc";

const Sorting: React.FC<SortingProps> = ({ categoryId }: SortingProps) => {
  const [sortCriteria, setSortCriteria] = useState<SortCriteria>("featured");
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const { toast } = useToast();
  const { addItem } = useCart();

  useEffect(() => {
    trpc.product.view
      .query({
        categoryId,
      })
      .then((res) => {
        if (res.success) {
          setProducts(
            res.result.map(({ file, vendor, product, variants }) => ({
              id: product.id,
              sku: product.id,
              name: product.name,
              price: Number(product.price),
              stock: product.stock,
              imageUrl: file ? `/uploads/${file.diskname}` : undefined,
              variants: variants.map(({ name, values }) => ({
                name,
                values,
              })),
              vendor: vendor.name,
            }))
          );
        }
      });
  }, [categoryId]);

  useEffect(() => {
    setProducts(getSortedProducts(sortCriteria));
  }, [sortCriteria]);

  const getSortedProducts = (criteria: SortCriteria) => {
    const sortedProducts = [...products];

    switch (criteria) {
      case "featured":
        break;
      case "name-asc":
        sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "price-asc":
        sortedProducts.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sortedProducts.sort((a, b) => b.price - a.price);
        break;
      case "date-asc":
        sortedProducts.sort((a, b) => {
          const dateA = a.dateAdded ? new Date(a.dateAdded).getTime() : 0;
          const dateB = b.dateAdded ? new Date(b.dateAdded).getTime() : 0;
          return dateA - dateB;
        });
        break;
      case "date-desc":
        sortedProducts.sort((a, b) => {
          const dateA = a.dateAdded ? new Date(a.dateAdded).getTime() : 0;
          const dateB = b.dateAdded ? new Date(b.dateAdded).getTime() : 0;
          return dateB - dateA;
        });
        break;
      default:
        break;
    }

    return sortedProducts;
  };

  const incrementQuantity = () => {
    if (selectedProduct && quantity < (selectedProduct.stock || 0)) {
      setQuantity(quantity + 1);
    } else {
      toast({
        title: "Stock limit reached",
        description:
          "You cannot add more of this item than available in stock.",
      });
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setSelectedOptions({});
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;

    const productVariants = selectedProduct.variants ?? [];

    if (productVariants) {
      for (const [selectedVariant, selectedItem] of Object.entries(
        selectedOptions
      )) {
        const variant = productVariants.find(
          (variant) => variant.name === selectedVariant
        );

        if (!variant) continue;

        if (!variant.values.includes(selectedItem)) {
          toast({
            title: "Invalid selection",
            description: `Please select a valid option for ${variant.name}.`,
          });
          return;
        }
      }

      for (const variant of productVariants) {
        if (!selectedOptions[variant.name]) {
          toast({
            title: "Missing selection",
            description: `Please select an option for ${variant.name}.`,
          });
          return;
        }
      }
    }

    const success = addItem(selectedProduct, quantity, selectedOptions);

    if (success) {
      toast({
        title: "Added to cart",
        description: `${quantity} x ${selectedProduct.name} added to your cart.`,
      });
    } else {
      toast({
        title: "Could not add to cart",
        description: "The requested quantity is not available in stock.",
      });
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent, product: Product) => {
    if (event.key === "Enter" || event.key === " ") {
      handleProductSelect(product);
    }
  };

  return (
    <div className="space-y-4 w-full h-full">
      <div className="flex-wrap flex flex-col md:flex-row justify-end mt-6 items-center w-full gap-2">
        <span className="text-sm font-medium ">Sort by:</span>
        <Select
          value={sortCriteria}
          onValueChange={(value) => setSortCriteria(value as SortCriteria)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select sort criteria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="name-asc">Alphabetical: A-Z</SelectItem>
            <SelectItem value="name-desc">Alphabetical: Z-A</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="date-asc">Date: Old to New</SelectItem>
            <SelectItem value="date-desc">Date: New to Old</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 justify-items-center items-center w-full h-full gap-4 ">
        {products.map((product) => (
          <Dialog key={product.id}>
            <DialogTrigger asChild>
              <button
                className="border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col gap-2 justify-center items-center object-cover w-[80%] h-full cursor-pointer"
                onClick={() => handleProductSelect(product)}
                onKeyDown={(e) => handleKeyPress(e, product)}
                tabIndex={0}
                type="button"
                aria-label={`View ${product.name} details`}
              >
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt="product-pic"
                    className="w-full h-full object-cover rounded-md"
                  />
                )}
                {!product.imageUrl && (
                  <div className="bg-gray-200 rounded-md w-full h-40 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-400">
                      {product.name.charAt(0)}
                    </span>
                  </div>
                )}
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <p className="text-gray-600">${product.price.toFixed(2)}</p>
                {product.stock <= 10 && product.stock > 0 && (
                  <p className="text-orange-500 text-sm">
                    Only {product.stock} left
                  </p>
                )}
                {product.dateAdded && (
                  <p className="text-sm text-gray-500">
                    Added: {new Date(product.dateAdded).toLocaleDateString()}
                  </p>
                )}
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{selectedProduct?.name}</DialogTitle>
                <DialogDescription>
                  {selectedProduct?.category && (
                    <span className="text-sm text-gray-500">
                      Category: {selectedProduct.category}
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-center">
                  {selectedProduct?.imageUrl ? (
                    <img
                      src={selectedProduct.imageUrl}
                      alt={selectedProduct.name}
                      className="max-h-64 object-contain"
                    />
                  ) : (
                    <div className="bg-gray-200 rounded-md w-full h-64 flex items-center justify-center">
                      <span className="text-6xl font-bold text-gray-400">
                        {selectedProduct?.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-4">
                  <p className="text-2xl font-bold">
                    ${selectedProduct?.price.toFixed(2)}
                  </p>

                  {product.variants?.map((variant) => {
                    return (
                      <div key={variant.name} className="space-y-2">
                        <span id="size-label" className="text-sm font-medium">
                          {variant.name}
                        </span>
                        <div
                          className="flex flex-wrap gap-2"
                          role="radiogroup"
                          aria-labelledby="size-label"
                        >
                          {variant.values.map((value) => (
                            <button
                              key={value}
                              type="button"
                              className={`px-3 py-1 border rounded-md ${
                                selectedOptions[variant.name] === value
                                  ? "bg-black text-white"
                                  : "bg-white"
                              }`}
                              onClick={() =>
                                setSelectedOptions({
                                  ...selectedOptions,
                                  [variant.name]: value,
                                })
                              }
                              aria-pressed={
                                selectedOptions[variant.name] === value
                              }
                            >
                              {value}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <span id="quantity-label" className="text-sm font-medium">
                        Quantity
                      </span>
                      <div
                        className="flex items-center"
                        aria-labelledby="quantity-label"
                      >
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={decrementQuantity}
                          disabled={quantity <= 1}
                          aria-label="Decrease quantity"
                          type="button"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center">{quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={incrementQuantity}
                          disabled={
                            selectedProduct
                              ? quantity >= selectedProduct.stock
                              : true
                          }
                          aria-label="Increase quantity"
                          type="button"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      className="flex-1"
                      onClick={handleAddToCart}
                      type="button"
                    >
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                    <DialogClose asChild>
                      <Button
                        variant="outline"
                        className="flex-1"
                        type="button"
                      >
                        Cancel
                      </Button>
                    </DialogClose>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  );
};

export default Sorting;
