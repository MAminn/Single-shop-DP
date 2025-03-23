import { useState } from "react";
import { Button } from "#root/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "#root/components/ui/card";
import { Separator } from "#root/components/ui/separator";
import { Link } from "#root/components/Link";
import { useCart, type CartItem } from "#root/lib/context/CartContext";
import {
  ChevronRight,
  Minus,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  XCircle,
} from "lucide-react";
import { useToast } from "#root/components/ui/use-toast";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalItems, subtotal } = useCart();
  const { toast } = useToast();
  const [processingCheckout, setProcessingCheckout] = useState(false);

  const handleQuantityChange = (
    itemId: number,
    newQuantity: number,
    selectedOptions: CartItem["selectedOptions"]
  ) => {
    const success = updateQuantity(itemId, newQuantity, selectedOptions);

    if (!success) {
      toast({
        title: "Quantity update failed",
        description: "The requested quantity exceeds available stock.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveItem = (
    itemId: number,
    selectedOptions: CartItem["selectedOptions"]
  ) => {
    removeItem(itemId, selectedOptions);
    toast({
      title: "Item removed",
      description: "The item has been removed from your cart.",
    });
  };

  const handleCheckout = async () => {
    setProcessingCheckout(true);

    try {
      // This would be replaced with actual checkout logic
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Successful checkout
      toast({
        title: "Order placed successfully",
        description: "Thank you for your purchase!",
      });

      // Redirect to confirmation page (in a real app)
      // window.location.href = "/checkout/confirmation";
    } catch (error) {
      toast({
        title: "Checkout failed",
        description:
          "There was an error processing your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingCheckout(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>
        <Card className="text-center py-12">
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <ShoppingCart className="h-12 w-12 text-neutral-300" />
              <h2 className="text-xl font-semibold">Your cart is empty</h2>
              <p className="text-neutral-500 mb-4">
                Add items to your cart to begin the checkout process.
              </p>
              <Button asChild>
                <Link href="/shop">Continue Shopping</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">
        Shopping Cart ({totalItems} {totalItems === 1 ? "item" : "items"})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Cart Items</CardTitle>
            </CardHeader>
            <CardContent>
              {items.map((item) => (
                <div key={`${item.id}-${JSON.stringify(item.selectedOptions)}`}>
                  <div className="flex flex-col sm:flex-row gap-4 py-4">
                    <div className="aspect-square h-24 w-24 flex-shrink-0 bg-neutral-100 rounded-md flex items-center justify-center">
                      <div className="text-2xl font-bold text-neutral-300">
                        {item.name.charAt(0)}
                      </div>
                    </div>

                    <div className="flex-grow">
                      <div className="flex flex-col sm:flex-row sm:justify-between">
                        <div>
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-sm text-neutral-500">
                            {item.vendor || "Unknown Vendor"}
                          </p>
                          <div className="text-sm mt-1">
                            {Object.entries(item.selectedOptions).map(
                              ([key, value]) =>
                                value && (
                                  <span key={key} className="mr-3">
                                    <span className="font-medium capitalize">
                                      {key}:
                                    </span>{" "}
                                    {value}
                                  </span>
                                )
                            )}
                          </div>
                        </div>
                        <div className="font-semibold mt-2 sm:mt-0">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-3">
                        <div className="flex items-center border rounded-md">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleQuantityChange(
                                item.id,
                                item.quantity - 1,
                                item.selectedOptions
                              )
                            }
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleQuantityChange(
                                item.id,
                                item.quantity + 1,
                                item.selectedOptions
                              )
                            }
                            disabled={item.stock <= item.quantity}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleRemoveItem(item.id, item.selectedOptions)
                          }
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Separator />
                </div>
              ))}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <Link href="/">
                  <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
                  Continue Shopping
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Shipping</span>
                  <span className="font-semibold">Free</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Tax</span>
                  <span className="font-semibold">
                    ${(subtotal * 0.05).toFixed(2)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${(subtotal + subtotal * 0.05).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                size="lg"
                onClick={handleCheckout}
                disabled={processingCheckout}
              >
                {processingCheckout ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-50 border-t-white rounded-full"></div>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    Proceed to Checkout
                  </span>
                )}
              </Button>
            </CardFooter>
          </Card>

          <div className="mt-4 text-sm text-neutral-500">
            <p className="mb-2">We accept:</p>
            <div className="flex gap-2">
              <div className="h-8 w-12 bg-neutral-200 rounded-md"></div>
              <div className="h-8 w-12 bg-neutral-200 rounded-md"></div>
              <div className="h-8 w-12 bg-neutral-200 rounded-md"></div>
              <div className="h-8 w-12 bg-neutral-200 rounded-md"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
