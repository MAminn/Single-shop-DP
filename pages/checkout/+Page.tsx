import { useState, useEffect } from "react";
import { Button } from "#root/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "#root/components/ui/card";
import { Input } from "#root/components/ui/input";
import { Label } from "#root/components/ui/label";
import { Separator } from "#root/components/ui/separator";
import { Textarea } from "#root/components/ui/textarea";
import { useToast } from "#root/components/ui/use-toast";
import { Link } from "#root/components/Link";
import { useCart, type CartItem } from "#root/lib/context/CartContext";
import {
  ArrowLeft,
  Check,
  CreditCard,
  Home,
  Loader2,
  Phone,
  ShoppingBag,
  Truck,
  User,
} from "lucide-react";
import { CheckoutService } from "#root/lib/services/CheckoutService";
import { trpc } from "#root/shared/trpc/client";

interface OrderData {
  id: number;
  date: string;
  customerInfo: {
    fullName: string;
    phoneNumber: string;
    email: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: string;
  notes?: string;
}

export default function CheckoutPage() {
  const { items, subtotal, totalItems, clearCart } = useCart();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);
  const [orderDetails, setOrderDetails] = useState<OrderData | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    notes: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const shipping = 5;
  const tax = subtotal * 0.05;
  const total = subtotal + shipping + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    if (
      !formData.fullName ||
      !formData.phoneNumber ||
      !formData.address ||
      !formData.city
    ) {
      toast({
        title: "Missing information",
        description:
          "Please fill in all required fields (Name, Phone, Address, City).",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const orderItems = items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      }));

      const result = await trpc.order.create.mutate({
        customerName: formData.fullName,
        customerEmail: formData.email || "not-provided@example.com",
        customerPhone: formData.phoneNumber,
        shippingAddress: formData.address,
        shippingCity: formData.city,
        shippingState: formData.state,
        shippingPostalCode: formData.postalCode,
        shippingCountry: formData.country,
        items: orderItems,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to create order");
      }

      const orderData = result.result;
      setOrderDetails({
        id:
          typeof orderData.id === "string"
            ? Number.parseInt(orderData.id, 10)
            : orderData.id,
        date: new Date().toISOString(),
        customerInfo: {
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
        },
        items: items,
        subtotal: subtotal,
        shipping: shipping,
        tax: tax,
        total: total,
        status: "pending",
        notes: formData.notes,
      });

      setIsComplete(true);
      setShowOrderConfirmation(true);
      clearCart();
      localStorage.setItem("cart", JSON.stringify([]));
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create your order. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showOrderConfirmation && orderDetails) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <Card className="mb-8">
          <CardHeader className="bg-green-50 border-b">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="text-white h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl">Order Confirmed!</CardTitle>
                <p className="text-sm text-gray-500">
                  Order #{orderDetails.id}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 px-6">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <User className="h-4 w-4" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p>{orderDetails.customerInfo.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p>{orderDetails.customerInfo.phoneNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p>{orderDetails.customerInfo.email || "Not provided"}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <Home className="h-4 w-4" />
                  Shipping Address
                </h3>
                <div className="pl-6">
                  <p>{orderDetails.customerInfo.address}</p>
                  <p>
                    {orderDetails.customerInfo.city},{" "}
                    {orderDetails.customerInfo.state}{" "}
                    {orderDetails.customerInfo.postalCode}
                  </p>
                  <p>{orderDetails.customerInfo.country}</p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <ShoppingBag className="h-4 w-4" />
                  Order Items
                </h3>
                <div className="space-y-3 pl-6">
                  {orderDetails.items.map((item: CartItem, index: number) => (
                    <div
                      key={`${item.id}-${index}`}
                      className="flex justify-between items-center"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                          {item.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">
                            {Object.entries(item.selectedOptions)
                              .filter(([_, value]) => value)
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(", ")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p>
                          {item.price.toFixed(2)} EGP × {item.quantity}
                        </p>
                        <p className="font-medium">
                          {(item.price * item.quantity).toFixed(2)} EGP
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <CreditCard className="h-4 w-4" />
                  Order Summary
                </h3>
                <div className="space-y-2 pl-6">
                  <div className="flex justify-between">
                    <p className="text-gray-500">Subtotal</p>
                    <p>{orderDetails.subtotal.toFixed(2)} EGP</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-500">Shipping</p>
                    <p>{orderDetails.shipping.toFixed(2)} EGP</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-500">Tax</p>
                    <p>{orderDetails.tax.toFixed(2)} EGP</p>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <p>Total</p>
                    <p>{orderDetails.total.toFixed(2)} EGP</p>
                  </div>
                </div>
              </div>

              {orderDetails.notes && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2">Order Notes</h3>
                    <p className="text-gray-700 pl-6">{orderDetails.notes}</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3 justify-between">
            <p className="text-sm text-gray-500">
              A confirmation email will be sent to{" "}
              {orderDetails.customerInfo.email || "your email"}.
            </p>
            <Button asChild>
              <Link href="/">Continue Shopping</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto p-4 text-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Your cart is empty</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Add some items to your cart before checkout.</p>
            <Button asChild>
              <Link href="/">Continue Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            <Card className="mb-6 p-5 ">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Information
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  No account needed - continue as a guest or{" "}
                  <Link href="/login" className="text-primary underline">
                    login
                  </Link>{" "}
                  if you have an account
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 123-4567"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john.doe@example.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email is optional but recommended to receive order
                    confirmations
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6 p-5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="123 Main St, Apt 4B"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="New York"
                      required
                    />
                  </div>
                  {/* <div className="space-y-2">
                    <Label htmlFor="state">State/Province *</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="NY"
                      required
                    />
                  </div> */}
                </div>

                {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code *</Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      placeholder="10001"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      placeholder="United States"
                      required
                    />
                  </div>
                </div> */}
              </CardContent>
            </Card>

            <Card className="mb-6 p-5">
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="notes">Order Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Special delivery instructions or other notes"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="lg:hidden">
              <OrderSummary
                items={items}
                subtotal={subtotal}
                shipping={shipping}
                tax={tax}
                total={total}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-between mt-8">
              <Button variant="outline" type="button" asChild>
                <Link href="/cart">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Return to Cart
                </Link>
              </Button>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    Processing...
                  </>
                ) : (
                  "Place Order"
                )}
              </Button>
            </div>
          </form>
        </div>

        <div className="hidden lg:block">
          <OrderSummary
            items={items}
            subtotal={subtotal}
            shipping={shipping}
            tax={tax}
            total={total}
          />
        </div>
      </div>
    </div>
  );
}

function OrderSummary({
  items,
  subtotal,
  shipping,
  tax,
  total,
}: {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}) {
  return (
    <Card className="sticky top-4 p-5">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 ">
          {items.length > 0 && (
            <div className="space-y-2">
              <p className="font-medium">
                {items.length} {items.length === 1 ? "Item" : "Items"}
              </p>
              {items.slice(0, 3).map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="flex justify-between text-sm"
                >
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span>{(item.price * item.quantity).toFixed(2)} EGP</span>
                </div>
              ))}
              {items.length > 3 && (
                <p className="text-sm text-neutral-500">
                  and {items.length - 3} more items...
                </p>
              )}
            </div>
          )}

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-neutral-600">Subtotal</span>
              <span className="font-medium">{subtotal.toFixed(2)} EGP</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Shipping</span>
              <span className="font-medium">{shipping.toFixed(2)} EGP</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Tax</span>
              <span className="font-medium">{tax.toFixed(2)} EGP</span>
            </div>
          </div>

          <Separator />

          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{total.toFixed(2)} EGP</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
