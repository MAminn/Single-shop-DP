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
  Tag,
  Check,
  X,
} from "lucide-react";
import { useToast } from "#root/components/ui/use-toast";
import { Input } from "#root/components/ui/input";
import { Label } from "#root/components/ui/label";
import { Alert, AlertDescription } from "#root/components/ui/alert";

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    totalItems,
    subtotal,
    discount,
    total,
    promoCode,
    applyPromoCode,
    removePromoCode,
    shipping,
    tax,
  } = useCart();
  const { toast } = useToast();
  const [processingCheckout, setProcessingCheckout] = useState(false);
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [applyingPromoCode, setApplyingPromoCode] = useState(false);
  const [promoCodeError, setPromoCodeError] = useState<string | null>(null);

  const handleQuantityChange = (
    itemId: string,
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
    itemId: string,
    selectedOptions: CartItem["selectedOptions"]
  ) => {
    removeItem(itemId, selectedOptions);
    toast({
      title: "Item removed",
      description: "The item has been removed from your cart.",
    });
  };

  const handleCheckout = () => {
    window.location.href = "/checkout";
  };

  const handleApplyPromoCode = async () => {
    if (!promoCodeInput.trim()) {
      setPromoCodeError("Please enter a promo code");
      return;
    }

    setApplyingPromoCode(true);
    setPromoCodeError(null);

    try {
      const success = await applyPromoCode(promoCodeInput.trim());

      if (success) {
        toast({
          title: "Promo code applied",
          description:
            "The promo code has been successfully applied to your cart.",
        });
        setPromoCodeInput("");
      } else {
        setPromoCodeError("Invalid promo code. Please try again.");
      }
    } catch (error) {
      setPromoCodeError("Failed to apply promo code. Please try again.");
      console.error("Error applying promo code:", error);
    } finally {
      setApplyingPromoCode(false);
    }
  };

  const handleRemovePromoCode = () => {
    removePromoCode();
    setPromoCodeInput("");
    setPromoCodeError(null);
    toast({
      title: "Promo code removed",
      description: "The promo code has been removed from your cart.",
    });
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
                <Link href="/">Continue Shopping</Link>
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
          <Card className=" p-5">
            <CardHeader>
              <CardTitle>Cart Items</CardTitle>
            </CardHeader>
            <CardContent>
              {items.map((item) => (
                <div key={`${item.id}-${JSON.stringify(item.selectedOptions)}`}>
                  <div className="flex flex-col sm:flex-row gap-4 py-4">
                    <div className="aspect-square h-24 w-24 flex-shrink-0 bg-neutral-100 rounded-md flex items-center justify-center overflow-hidden">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-2xl font-bold text-neutral-300">
                          {item.name.charAt(0)}
                        </div>
                      )}
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
                          {(item.price * item.quantity).toFixed(2)} EGP
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
          <Card className="p-5">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Subtotal</span>
                  <span className="font-semibold">
                    {subtotal.toFixed(2)} EGP
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center gap-1">
                      <Tag className="h-4 w-4" />
                      Discount {promoCode && `(${promoCode.code})`}
                    </span>
                    <span className="font-semibold">
                      -{discount.toFixed(2)} EGP
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-neutral-600">Shipping</span>
                  <span className="font-semibold">
                    {shipping.toFixed(2)} EGP
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-neutral-600">Tax</span>
                  <span className="font-semibold">{tax.toFixed(2)} EGP</span>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{total.toFixed(2)} EGP</span>
                </div>

                <Separator />

                <div className="pt-2">
                  <Label
                    htmlFor="promoCode"
                    className="flex items-center gap-1 mb-2"
                  >
                    <Tag className="h-4 w-4" />
                    Promo Code
                  </Label>

                  {promoCode ? (
                    <div className="flex items-center gap-2 border p-2 rounded-md bg-green-50">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="flex-grow font-medium">
                        {promoCode.code} -
                        {promoCode.discountType === "percentage"
                          ? ` ${promoCode.discountValue}% off`
                          : ` ${promoCode.discountValue} EGP off`}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemovePromoCode}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-2">
                        <Input
                          id="promoCode"
                          value={promoCodeInput}
                          onChange={(e) => setPromoCodeInput(e.target.value)}
                          placeholder="Enter promo code"
                          className="flex-grow"
                        />
                        <Button
                          variant="outline"
                          onClick={handleApplyPromoCode}
                          disabled={applyingPromoCode || !promoCodeInput.trim()}
                        >
                          {applyingPromoCode ? "Applying..." : "Apply"}
                        </Button>
                      </div>

                      {promoCodeError && (
                        <Alert variant="destructive" className="mt-2 py-2">
                          <AlertDescription className="text-xs">
                            {promoCodeError}
                          </AlertDescription>
                        </Alert>
                      )}
                    </>
                  )}
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
