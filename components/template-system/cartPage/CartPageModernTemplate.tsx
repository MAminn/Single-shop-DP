import React from "react";
import { Button } from "#root/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "#root/components/ui/card";
import { Input } from "#root/components/ui/input";
import { Separator } from "#root/components/ui/separator";
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight } from "lucide-react";

/**
 * Cart item interface
 */
export interface CartPageCartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  variant?: string | null;
  stock?: number | null;
  available: boolean;
}

/**
 * Cart totals interface
 */
export interface CartPageTotals {
  subtotal: number;
  discount?: number;
  shipping?: number;
  tax?: number;
  grandTotal: number;
}

/**
 * Props for CartPageModernTemplate
 */
export interface CartPageModernTemplateProps {
  items: CartPageCartItem[];
  totals: CartPageTotals;
  isLoading?: boolean;
  isUpdating?: boolean;
  currency?: string;
  onQuantityChange?: (id: string, quantity: number) => void;
  onRemoveItem?: (id: string) => void;
  onApplyCoupon?: (code: string) => void;
  onProceedToCheckout?: () => void;
}

/**
 * CartPageModernTemplate Component
 *
 * Modern cart page layout with item management and checkout flow
 */
export function CartPageModernTemplate({
  items = [],
  totals,
  isLoading = false,
  isUpdating = false,
  currency = "$",
  onQuantityChange,
  onRemoveItem,
  onApplyCoupon,
  onProceedToCheckout,
}: CartPageModernTemplateProps) {
  const [couponCode, setCouponCode] = React.useState("");

  const handleApplyCoupon = () => {
    if (couponCode.trim() && onApplyCoupon) {
      onApplyCoupon(couponCode);
      setCouponCode("");
    }
  };

  if (isLoading) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='flex items-center justify-center min-h-[400px]'>
          <div className='text-center'>
            <ShoppingCart className='w-16 h-16 mx-auto mb-4 text-muted-foreground animate-pulse' />
            <p className='text-muted-foreground'>Loading cart...</p>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='flex items-center justify-center min-h-[400px]'>
          <div className='text-center'>
            <ShoppingCart className='w-16 h-16 mx-auto mb-4 text-muted-foreground' />
            <h2 className='text-2xl font-bold mb-2'>Your cart is empty</h2>
            <p className='text-muted-foreground mb-6'>
              Add some items to get started!
            </p>
            <Button
              onClick={() => (window.location.href = "/shop")}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold mb-8'>Shopping Cart</h1>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Cart Items */}
        <div className='lg:col-span-2 space-y-4'>
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className='p-6'>
                <div className='flex gap-4'>
                  {/* Product Image */}
                  {item.imageUrl && (
                    <div className='w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0'>
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className='w-full h-full object-cover'
                      />
                    </div>
                  )}

                  {/* Product Details */}
                  <div className='flex-1 min-w-0'>
                    <h3 className='font-semibold text-lg mb-1 truncate'>
                      {item.name}
                    </h3>
                    {item.variant && (
                      <p className='text-sm text-muted-foreground mb-2'>
                        {item.variant}
                      </p>
                    )}
                    <p className='text-lg font-bold text-primary'>
                      {currency}
                      {item.price.toFixed(2)}
                    </p>
                    {item.stock !== null && item.stock !== undefined && (
                      <p className='text-sm text-muted-foreground mt-1'>
                        {item.stock > 0
                          ? `${item.stock} in stock`
                          : "Out of stock"}
                      </p>
                    )}
                  </div>

                  {/* Quantity Controls */}
                  <div className='flex flex-col items-end gap-4'>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => onRemoveItem?.(item.id)}
                      disabled={isUpdating}>
                      <Trash2 className='w-4 h-4' />
                    </Button>

                    <div className='flex items-center gap-2 border rounded-lg'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() =>
                          onQuantityChange?.(
                            item.id,
                            Math.max(1, item.quantity - 1),
                          )
                        }
                        disabled={isUpdating || item.quantity <= 1}>
                        <Minus className='w-4 h-4' />
                      </Button>
                      <span className='w-12 text-center font-medium'>
                        {item.quantity}
                      </span>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() =>
                          onQuantityChange?.(item.id, item.quantity + 1)
                        }
                        disabled={
                          isUpdating ||
                          (item.stock != null && item.quantity >= item.stock)
                        }>
                        <Plus className='w-4 h-4' />
                      </Button>
                    </div>

                    <p className='font-semibold'>
                      {currency}
                      {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className='lg:col-span-1'>
          <Card className='sticky top-4'>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <div className='flex justify-between'>
                  <span>Subtotal</span>
                  <span>
                    {currency}
                    {totals.subtotal.toFixed(2)}
                  </span>
                </div>
                {totals.discount !== undefined && totals.discount > 0 && (
                  <div className='flex justify-between text-green-600'>
                    <span>Discount</span>
                    <span>
                      -{currency}
                      {totals.discount.toFixed(2)}
                    </span>
                  </div>
                )}
                {totals.shipping !== undefined && (
                  <div className='flex justify-between'>
                    <span>Shipping</span>
                    <span>
                      {totals.shipping === 0
                        ? "Free"
                        : `${currency}${totals.shipping.toFixed(2)}`}
                    </span>
                  </div>
                )}
                {totals.tax !== undefined && totals.tax > 0 && (
                  <div className='flex justify-between'>
                    <span>Tax</span>
                    <span>
                      {currency}
                      {totals.tax.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              <Separator />

              <div className='flex justify-between text-lg font-bold'>
                <span>Total</span>
                <span>
                  {currency}
                  {totals.grandTotal.toFixed(2)}
                </span>
              </div>

              {/* Coupon Code */}
              <div className='space-y-2'>
                <label className='text-sm font-medium'>Coupon Code</label>
                <div className='flex gap-2'>
                  <Input
                    placeholder='Enter code'
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={isUpdating}
                  />
                  <Button
                    variant='outline'
                    onClick={handleApplyCoupon}
                    disabled={isUpdating || !couponCode.trim()}>
                    Apply
                  </Button>
                </div>
              </div>

              <Button
                className='w-full'
                size='lg'
                onClick={onProceedToCheckout}
                disabled={isUpdating || items.length === 0}>
                Proceed to Checkout
                <ArrowRight className='w-4 h-4 ml-2' />
              </Button>

              <Button
                variant='outline'
                className='w-full'
                onClick={() => (window.location.href = "/shop")}>
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
