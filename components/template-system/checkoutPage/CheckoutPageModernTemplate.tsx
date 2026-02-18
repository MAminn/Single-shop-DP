import React from "react";
import { Button } from "#root/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "#root/components/ui/card";
import { Separator } from "#root/components/ui/separator";
import { Badge } from "#root/components/ui/badge";
import { Alert, AlertDescription } from "#root/components/ui/alert";
import {
  CheckCircle2,
  AlertCircle,
  ShoppingCart,
  CreditCard,
} from "lucide-react";

/**
 * Customer information interface
 */
export interface CheckoutCustomerInfo {
  name: string;
  email: string;
  phone?: string | null;
}

/**
 * Address interface
 */
export interface CheckoutAddress {
  line1: string;
  line2?: string | null;
  city: string;
  state?: string | null;
  postalCode: string;
  country: string;
}

/**
 * Order summary item interface
 */
export interface CheckoutOrderSummaryItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

/**
 * Checkout totals interface
 */
export interface CheckoutTotals {
  subtotal: number;
  discount?: number;
  shipping?: number;
  tax?: number;
  grandTotal: number;
}

/**
 * Props for CheckoutPageModernTemplate
 */
export interface CheckoutPageModernTemplateProps {
  customer?: CheckoutCustomerInfo;
  shippingAddress?: CheckoutAddress;
  billingAddress?: CheckoutAddress;
  items: CheckoutOrderSummaryItem[];
  totals: CheckoutTotals;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  onSubmit?: (formValues: Record<string, string>) => void | Promise<void>;
  onEditCart?: () => void;
  currency?: string;
}

/**
 * CheckoutPageModernTemplate Component
 *
 * Modern checkout page layout with order review and submission
 */
export function CheckoutPageModernTemplate({
  customer,
  shippingAddress,
  billingAddress,
  items = [],
  totals,
  isSubmitting = false,
  errorMessage = null,
  onSubmit,
  onEditCart,
  currency = "EGP",
}: CheckoutPageModernTemplateProps) {
  const formatAddress = (address?: CheckoutAddress) => {
    if (!address) return "Not provided";

    const parts = [
      address.line1,
      address.line2,
      address.city,
      address.state,
      address.postalCode,
      address.country,
    ].filter(Boolean);

    return parts.join(", ");
  };

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold mb-8'>Checkout</h1>

      {errorMessage && (
        <Alert variant='destructive' className='mb-6'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Checkout Details */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <CheckCircle2 className='w-5 h-5 text-green-600' />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              {customer ? (
                <>
                  <div>
                    <p className='text-sm text-muted-foreground'>Name</p>
                    <p className='font-medium'>{customer.name}</p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>Email</p>
                    <p className='font-medium'>{customer.email}</p>
                  </div>
                  {customer.phone && (
                    <div>
                      <p className='text-sm text-muted-foreground'>Phone</p>
                      <p className='font-medium'>{customer.phone}</p>
                    </div>
                  )}
                </>
              ) : (
                <p className='text-muted-foreground'>
                  No customer information provided
                </p>
              )}
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <CheckCircle2 className='w-5 h-5 text-green-600' />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-sm'>{formatAddress(shippingAddress)}</p>
            </CardContent>
          </Card>

          {/* Billing Address */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <CreditCard className='w-5 h-5 text-green-600' />
                Billing Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              {billingAddress &&
              shippingAddress &&
              JSON.stringify(billingAddress) ===
                JSON.stringify(shippingAddress) ? (
                <p className='text-sm text-muted-foreground'>
                  Same as shipping address
                </p>
              ) : (
                <p className='text-sm'>{formatAddress(billingAddress)}</p>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle className='flex items-center gap-2'>
                  <ShoppingCart className='w-5 h-5' />
                  Order Items ({items.length})
                </CardTitle>
                {onEditCart && (
                  <Button variant='outline' size='sm' onClick={onEditCart}>
                    Edit Cart
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              {items.map((item) => (
                <div
                  key={item.id}
                  className='flex justify-between items-center'>
                  <div className='flex-1'>
                    <p className='font-medium'>{item.name}</p>
                    <p className='text-sm text-muted-foreground'>
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <div className='text-right'>
                    <p className='font-medium'>
                      {currency}
                      {(item.price * item.quantity).toFixed(2)}
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      {currency}
                      {item.price.toFixed(2)} each
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
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
                      {totals.shipping === 0 ? (
                        <Badge variant='secondary'>Free</Badge>
                      ) : (
                        `${currency} ${totals.shipping.toFixed(2)}`
                      )}
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

              <Button
                className='w-full'
                size='lg'
                onClick={() => onSubmit?.({})}
                disabled={isSubmitting || items.length === 0}>
                {isSubmitting ? (
                  <>
                    <span className='animate-pulse'>Processing...</span>
                  </>
                ) : (
                  "Place Order"
                )}
              </Button>

              <p className='text-xs text-center text-muted-foreground'>
                By placing your order, you agree to our terms and conditions
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
