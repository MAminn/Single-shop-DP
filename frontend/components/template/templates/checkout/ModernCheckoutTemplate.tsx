import type React from 'react';
import { useState } from "react";
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
  Tag,
  X,
  Shield,
  Star,
  Clock,
} from "lucide-react";
import { useCart } from "#root/lib/context/CartContext";
import { trpc } from "#root/shared/trpc/client";
import type { TemplateData, CheckoutTemplateData, CheckoutItem } from '../../templateRegistry';

interface ModernCheckoutTemplateProps {
  data?: TemplateData;
}

const ModernCheckoutTemplate: React.FC<ModernCheckoutTemplateProps> = ({ data }) => {
  // Type guard to ensure we have checkout data
  const checkoutData = data as CheckoutTemplateData | undefined;
  const {
    clearCart,
    items: contextItems,
    totalItems: contextTotalItems,
    subtotal: contextSubtotal,
    discount: contextDiscount,
    total: contextTotal,
    promoCode: contextPromoCode,
    shipping: contextShipping,
    tax: contextTax,
  } = useCart();
  const { toast } = useToast();
  
  // Use provided data or fallback to context data
  const items = checkoutData?.items || contextItems;
  const totalItems = checkoutData?.totalItems ?? contextTotalItems;
  const subtotal = checkoutData?.subtotal ?? contextSubtotal;
  const discount = checkoutData?.discount ?? contextDiscount;
  const shipping = checkoutData?.shipping ?? contextShipping;
  const tax = checkoutData?.tax ?? contextTax;
  const total = checkoutData?.total ?? contextTotal;
  const promoCode = checkoutData?.promoCode ?? contextPromoCode;
  const formData = checkoutData?.formData || {
    fullName: '',
    phoneNumber: '',
    postalCode: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    notes: '',
    paymentMethod: 'credit_card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingPostalCode: '',
    billingCountry: '',
    sameAsShipping: true,
    specialInstructions: ''
  };
  const isSubmitting = checkoutData?.isSubmitting || false;
  const showOrderConfirmation = checkoutData?.showOrderConfirmation || false;
  const orderDetails = checkoutData?.orderDetails || null;
  const isLoading = checkoutData?.isLoading || false;
  const error = checkoutData?.error || null;

  const [localFormData, setLocalFormData] = useState(formData);
  const [localIsSubmitting, setLocalIsSubmitting] = useState(isSubmitting);
  const [localShowOrderConfirmation, setLocalShowOrderConfirmation] = useState(showOrderConfirmation);
  const [localOrderDetails, setLocalOrderDetails] = useState(orderDetails);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setLocalFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (localIsSubmitting) return;

    setLocalIsSubmitting(true);

    if (
      !localFormData.fullName ||
      !localFormData.phoneNumber ||
      !localFormData.address ||
      !localFormData.city
    ) {
      toast({
        title: "Missing information",
        description:
          "Please fill in all required fields (Name, Phone, Address, City).",
      });
      setLocalIsSubmitting(false);
      return;
    }

    try {
      const orderItems = items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      }));

      const orderData = {
        customerName: localFormData.fullName,
        customerEmail: localFormData.email || "not-provided@example.com",
        customerPhone: localFormData.phoneNumber,
        shippingAddress: localFormData.address,
        shippingCity: localFormData.city,
        shippingState: localFormData.state,
        shippingPostalCode: localFormData.postalCode,
        shippingCountry: localFormData.country,
        items: orderItems,
        notes: localFormData.notes,
        promoCodeId: promoCode?.id,
      };

      const result = await trpc.order.create.mutate(orderData);

      if (!result.success) {
        throw new Error(result.error || "Failed to create order");
      }

      const orderResult = result.result;
      setLocalOrderDetails({
        id:
          typeof orderResult.id === "string"
            ? Number.parseInt(orderResult.id, 10)
            : orderResult.id,
        date: new Date().toISOString(),
        customerInfo: {
          fullName: localFormData.fullName,
          phoneNumber: localFormData.phoneNumber,
          email: localFormData.email,
          address: localFormData.address,
          city: localFormData.city,
          state: localFormData.state,
          postalCode: localFormData.postalCode,
          country: localFormData.country,
        },
        items: items as CheckoutItem[],
        subtotal: subtotal,
        shipping: shipping,
        tax: tax,
        discount: discount,
        total: total,
        status: "pending",
        promoCode: promoCode || undefined,
        notes: localFormData.notes,
      });

      setLocalShowOrderConfirmation(true);
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
      setLocalIsSubmitting(false);
    }
  };

  if (localShowOrderConfirmation && localOrderDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <div className="container mx-auto p-4 max-w-4xl">
          <div className="relative">
            {/* Success Animation Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-3xl blur-3xl" />
            
            <Card className="relative backdrop-blur-sm bg-white/90 border-0 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12" />
                
                <div className="relative flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Check className="text-white h-8 w-8" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl font-bold">Order Confirmed!</CardTitle>
                    <p className="text-green-100 text-lg">
                      Order #{localOrderDetails.id}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm text-green-100">
                        Estimated delivery: 3-5 business days
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-8">
                <div className="space-y-8">
                  {/* Customer Information */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
                    <h3 className="font-bold text-xl flex items-center gap-3 mb-6 text-gray-800">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      Customer Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white rounded-xl p-4 shadow-sm">
                        <p className="text-sm font-medium text-gray-500 mb-1">Name</p>
                        <p className="text-lg font-semibold text-gray-800">{localOrderDetails.customerInfo.fullName}</p>
                      </div>
                      <div className="bg-white rounded-xl p-4 shadow-sm">
                        <p className="text-sm font-medium text-gray-500 mb-1">Phone</p>
                        <p className="text-lg font-semibold text-gray-800">{localOrderDetails.customerInfo.phoneNumber}</p>
                      </div>
                      <div className="bg-white rounded-xl p-4 shadow-sm md:col-span-2">
                        <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                        <p className="text-lg font-semibold text-gray-800">{localOrderDetails.customerInfo.email || "Not provided"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6">
                    <h3 className="font-bold text-xl flex items-center gap-3 mb-6 text-gray-800">
                      <div className="p-2 bg-purple-500 rounded-lg">
                        <Home className="h-5 w-5 text-white" />
                      </div>
                      Shipping Address
                    </h3>
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="space-y-2">
                        <p className="text-lg font-semibold text-gray-800">{localOrderDetails.customerInfo.address}</p>
                        <p className="text-gray-600">
                          {localOrderDetails.customerInfo.city},{" "}
                          {localOrderDetails.customerInfo.state}{" "}
                          {localOrderDetails.customerInfo.postalCode}
                        </p>
                        <p className="text-gray-600">{localOrderDetails.customerInfo.country}</p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6">
                    <h3 className="font-bold text-xl flex items-center gap-3 mb-6 text-gray-800">
                      <div className="p-2 bg-orange-500 rounded-lg">
                        <ShoppingBag className="h-5 w-5 text-white" />
                      </div>
                      Order Items
                    </h3>
                    <div className="space-y-4">
                      {localOrderDetails.items.map((item) => (
                        <div key={`${item.id}-${JSON.stringify(item.selectedOptions)}`} className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <ShoppingBag className="h-8 w-8" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-lg text-gray-800">{item.name}</h4>
                              <p className="text-gray-600">Quantity: {item.quantity}</p>
                              {Object.keys(item.selectedOptions).length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {Object.entries(item.selectedOptions).map(([key, value]) => (
                                    <span key={key} className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                      {key}: {value}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-gray-800">${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-6">
                    <h3 className="font-bold text-xl mb-6 text-gray-800">Order Summary</h3>
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="space-y-4">
                        <div className="flex justify-between text-lg">
                          <span className="text-gray-600">Subtotal:</span>
                          <span className="font-semibold">${localOrderDetails.subtotal.toFixed(2)}</span>
                        </div>
                        {localOrderDetails.discount && localOrderDetails.discount > 0 && (
                          <div className="flex justify-between text-lg text-green-600">
                            <span>Discount:</span>
                            <span className="font-semibold">-${localOrderDetails.discount.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-lg">
                          <span className="text-gray-600">Shipping:</span>
                          <span className="font-semibold">${localOrderDetails.shipping.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-lg">
                          <span className="text-gray-600">Tax:</span>
                          <span className="font-semibold">${localOrderDetails.tax.toFixed(2)}</span>
                        </div>
                        <Separator className="my-4" />
                        <div className="flex justify-between text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                          <span>Total:</span>
                          <span>${localOrderDetails.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="p-8 bg-gray-50">
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <Link href="/" className="flex-1">
                    <Button variant="outline" className="w-full h-12 text-lg font-semibold border-2 hover:bg-gray-100">
                      <Home className="h-5 w-5 mr-2" />
                      Continue Shopping
                    </Button>
                  </Link>
                  <Link href="/dashboard/orders" className="flex-1">
                    <Button className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      <Truck className="h-5 w-5 mr-2" />
                      Track Order
                    </Button>
                  </Link>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="container mx-auto p-4 max-w-2xl">
          <Card className="text-center py-16 bg-white/80 backdrop-blur-sm border-0 shadow-2xl rounded-3xl">
            <CardContent>
              <div className="mb-8">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
                  <ShoppingBag className="h-12 w-12 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Your cart is empty
                </h2>
                <p className="text-gray-600 text-lg mb-8">
                  Add some amazing items to your cart before proceeding to checkout.
                </p>
              </div>
              <Link href="/">
                <Button className="h-12 px-8 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Start Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="mb-8">
          <Link href="/cart" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold text-lg">
            <ArrowLeft className="h-5 w-5" />
            Back to Cart
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12" />
                
                <CardTitle className="relative flex items-center gap-3 text-2xl font-bold">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  Secure Checkout
                </CardTitle>
                <div className="relative flex items-center gap-2 mt-2">
                  <Shield className="h-4 w-4" />
                  <span className="text-blue-100">SSL Encrypted & Secure</span>
                </div>
              </CardHeader>
              
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Customer Information */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
                    <h3 className="font-bold text-xl flex items-center gap-3 mb-6 text-gray-800">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      Customer Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="fullName" className="text-sm font-semibold text-gray-700 mb-2 block">Full Name *</Label>
                        <Input
                          id="fullName"
                          name="fullName"
                          value={localFormData.fullName}
                          onChange={handleInputChange}
                          required
                          placeholder="Enter your full name"
                          className="h-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phoneNumber" className="text-sm font-semibold text-gray-700 mb-2 block">Phone Number *</Label>
                        <Input
                          id="phoneNumber"
                          name="phoneNumber"
                          value={localFormData.phoneNumber}
                          onChange={handleInputChange}
                          required
                          placeholder="Enter your phone number"
                          className="h-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="email" className="text-sm font-semibold text-gray-700 mb-2 block">Email Address</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={localFormData.email}
                          onChange={handleInputChange}
                          placeholder="Enter your email address"
                          className="h-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Shipping Information */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6">
                    <h3 className="font-bold text-xl flex items-center gap-3 mb-6 text-gray-800">
                      <div className="p-2 bg-purple-500 rounded-lg">
                        <Home className="h-5 w-5 text-white" />
                      </div>
                      Shipping Address
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="address" className="text-sm font-semibold text-gray-700 mb-2 block">Street Address *</Label>
                        <Input
                          id="address"
                          name="address"
                          value={localFormData.address}
                          onChange={handleInputChange}
                          required
                          placeholder="Enter your street address"
                          className="h-12 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="city" className="text-sm font-semibold text-gray-700 mb-2 block">City *</Label>
                          <Input
                            id="city"
                            name="city"
                            value={localFormData.city}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter your city"
                            className="h-12 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="state" className="text-sm font-semibold text-gray-700 mb-2 block">State/Province</Label>
                          <Input
                            id="state"
                            name="state"
                            value={localFormData.state}
                            onChange={handleInputChange}
                            placeholder="Enter your state/province"
                            className="h-12 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="postalCode" className="text-sm font-semibold text-gray-700 mb-2 block">Postal Code</Label>
                          <Input
                            id="postalCode"
                            name="postalCode"
                            value={localFormData.postalCode}
                            onChange={handleInputChange}
                            placeholder="Enter your postal code"
                            className="h-12 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="country" className="text-sm font-semibold text-gray-700 mb-2 block">Country</Label>
                          <Input
                            id="country"
                            name="country"
                            value={localFormData.country}
                            onChange={handleInputChange}
                            placeholder="Enter your country"
                            className="h-12 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Notes */}
                  <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-6">
                    <Label htmlFor="notes" className="text-sm font-semibold text-gray-700 mb-2 block">Order Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={localFormData.notes}
                      onChange={handleInputChange}
                      placeholder="Any special instructions for your order..."
                      rows={4}
                      className="border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-14 text-lg font-bold bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={localIsSubmitting}
                  >
                    {localIsSubmitting ? (
                      <>
                        <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                        Processing Your Order...
                      </>
                    ) : (
                      <>
                        <Shield className="mr-3 h-6 w-6" />
                        Place Secure Order
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <ModernOrderSummary
              items={items as CheckoutItem[]}
              subtotal={subtotal}
              shipping={shipping}
              tax={tax}
              discount={discount}
              total={total}
              promoCode={promoCode}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

function ModernOrderSummary({
  items,
  subtotal,
  shipping,
  tax,
  discount = 0,
  total,
  promoCode,
}: {
  items: CheckoutItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount?: number;
  total: number;
  promoCode?: {
    id: string;
    code: string;
    discountType: "percentage" | "fixed_amount";
    discountValue: number;
  } | null;
}) {
  return (
    <Card className="sticky top-4 bg-white/80 backdrop-blur-sm border-0 shadow-2xl rounded-3xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
        <CardTitle className="relative flex items-center gap-3 text-xl font-bold">
          <div className="p-2 bg-white/20 rounded-lg">
            <ShoppingBag className="h-5 w-5" />
          </div>
          Order Summary
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Items */}
        <div className="space-y-4">
          {items.map((item) => {
            const displayPrice = item.discountPrice || item.price;
            const hasDiscount = item.discountPrice && Number(item.discountPrice) < Number(item.price);
            const optionsKey = JSON.stringify(item.selectedOptions);

            return (
              <div key={`${item.id}-${optionsKey}`} className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-4">
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-white rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ShoppingBag className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-800 truncate">{item.name}</h4>
                    <p className="text-sm text-gray-600 font-medium">Qty: {item.quantity}</p>
                    {Object.keys(item.selectedOptions).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {Object.entries(item.selectedOptions).map(([key, value]) => (
                          <span key={key} className="text-xs bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                            {key}: {value}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      {hasDiscount && (
                        <span className="text-sm text-gray-400 line-through">
                          ${item.price.toFixed(2)}
                        </span>
                      )}
                      <span className="font-bold text-gray-800">
                        ${(Number(displayPrice) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Promo Code */}
        {promoCode && (
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <Tag className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-green-800">
                  {promoCode.code}
                </span>
              </div>
              <span className="font-bold text-green-600">
                -{promoCode.discountType === "percentage" ? `${promoCode.discountValue}%` : `$${promoCode.discountValue}`}
              </span>
            </div>
          </div>
        )}

        <Separator className="my-6" />

        {/* Totals */}
        <div className="space-y-4">
          <div className="flex justify-between text-lg">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-semibold">${subtotal.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-lg text-green-600">
              <span>Discount:</span>
              <span className="font-semibold">-${discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg">
            <span className="text-gray-600">Shipping:</span>
            <span className="font-semibold">${shipping.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg">
            <span className="text-gray-600">Tax:</span>
            <span className="font-semibold">${tax.toFixed(2)}</span>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4">
            <div className="flex justify-between text-2xl font-bold">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Total:</span>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-4">
          <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Shield className="h-4 w-4 text-green-500" />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>Trusted</span>
            </div>
            <div className="flex items-center gap-1">
              <Truck className="h-4 w-4 text-blue-500" />
              <span>Fast Delivery</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ModernCheckoutTemplate;