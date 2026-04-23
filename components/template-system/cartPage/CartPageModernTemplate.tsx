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
import { useMinimalI18n } from "#root/lib/i18n/MinimalI18nContext";

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
  currency = "EGP",
  onQuantityChange,
  onRemoveItem,
  onApplyCoupon,
  onProceedToCheckout,
}: CartPageModernTemplateProps) {
  const [couponCode, setCouponCode] = React.useState("");
  const { t } = useMinimalI18n();

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
            <p className='text-muted-foreground'>{t("cart.loading")}</p>
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
            <h2 className='text-2xl font-bold mb-2'>{t("cart.empty")}</h2>
            <p className='text-muted-foreground mb-6'>
              {t("cart.empty_cta")}
            </p>
            <Button onClick={() => (window.location.href = "/shop")}>
              {t("cart.continue_shopping")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold mb-8'>{t("cart.title")}</h1>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Cart Items */}
        <div className='lg:col-span-2 space-y-3'>
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className='p-4 sm:p-6'>
                <div className={`flex gap-3 sm:gap-4 transition-opacity ${isUpdating ? "opacity-60 pointer-events-none" : ""}`}>
                  {/* Product Image */}
                  <div className='w-[80px] h-[80px] sm:w-24 sm:h-24 bg-muted rounded-lg overflow-hidden shrink-0'>
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className='w-full h-full object-cover'
                      />
                    ) : (
                      <div className='w-full h-full flex items-center justify-center'>
                        <ShoppingCart className='w-6 h-6 text-muted-foreground/30' />
                      </div>
                    )}
                  </div>

                  {/* Details + controls stacked */}
                  <div className='flex-1 min-w-0'>
                    {/* Name row + trash */}
                    <div className='flex items-start justify-between gap-1'>
                      <div className='min-w-0 flex-1'>
                        <h3 className='font-semibold text-[15px] sm:text-base leading-snug text-foreground break-words'>
                          {item.name}
                        </h3>
                        {item.variant && (
                          <p className='text-xs text-muted-foreground mt-0.5'>
                            {item.variant}
                          </p>
                        )}
                        <p className='text-[15px] sm:text-base font-bold text-foreground mt-1'>
                          {currency}{item.price.toFixed(2)}
                        </p>
                      </div>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive -mt-1 -mr-1'
                        onClick={() => onRemoveItem?.(item.id)}
                        disabled={isUpdating}
                        aria-label='Remove item'>
                        <Trash2 className='w-4 h-4' />
                      </Button>
                    </div>

                    {/* Qty stepper + line total */}
                    <div className='flex items-center justify-between mt-3 gap-2'>
                      <div className='flex items-center border rounded-lg'>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-9 w-9'
                          onClick={() =>
                            onQuantityChange?.(item.id, Math.max(1, item.quantity - 1))
                          }
                          disabled={isUpdating || item.quantity <= 1}
                          aria-label='Decrease quantity'>
                          <Minus className='w-3.5 h-3.5' />
                        </Button>
                        <span className='w-8 text-center text-sm font-medium text-foreground'>
                          {item.quantity}
                        </span>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-9 w-9'
                          onClick={() =>
                            onQuantityChange?.(item.id, item.quantity + 1)
                          }
                          disabled={
                            isUpdating ||
                            (item.stock != null && item.quantity >= item.stock)
                          }
                          aria-label='Increase quantity'>
                          <Plus className='w-3.5 h-3.5' />
                        </Button>
                      </div>
                      <p className='font-semibold text-[15px] sm:text-base text-foreground'>
                        {currency}{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className='lg:col-span-1'>
          <Card className='sticky top-4'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base sm:text-lg'>{t("cart.order_summary")}</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2.5'>
                <div className='flex items-center justify-between gap-4 text-sm'>
                  <span className='shrink-0 text-muted-foreground'>{t("cart.subtotal")}</span>
                  <span className='font-medium text-foreground'>{currency}{totals.subtotal.toFixed(2)}</span>
                </div>
                {totals.discount !== undefined && totals.discount > 0 && (
                  <div className='flex items-center justify-between gap-4 text-sm text-green-600'>
                    <span className='shrink-0'>{t("cart.discount")}</span>
                    <span className='font-medium'>-{currency}{totals.discount.toFixed(2)}</span>
                  </div>
                )}
                {totals.shipping !== undefined && (
                  <div className='flex items-center justify-between gap-4 text-sm'>
                    <span className='shrink-0 text-muted-foreground'>{t("cart.shipping")}</span>
                    <span className='font-medium text-foreground'>
                      {totals.shipping === 0
                        ? t("cart.free")
                        : `${currency}${totals.shipping.toFixed(2)}`}
                    </span>
                  </div>
                )}
              </div>

              <Separator />

              <div className='flex items-center justify-between gap-4 font-bold'>
                <span className='shrink-0 text-foreground'>{t("cart.total")}</span>
                <span className='text-foreground'>{currency}{totals.grandTotal.toFixed(2)}</span>
              </div>

              {/* Coupon Code */}
              <div className='space-y-2'>
                <label className='text-sm font-medium text-foreground'>{t("cart.coupon_code")}</label>
                <div className='flex gap-2'>
                  <Input
                    placeholder={t("cart.enter_code")}
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={isUpdating}
                    className='text-sm min-w-0'
                  />
                  <Button
                    variant='outline'
                    onClick={handleApplyCoupon}
                    disabled={isUpdating || !couponCode.trim()}
                    className='shrink-0'>
                    {t("cart.apply")}
                  </Button>
                </div>
              </div>

              <Button
                className='w-full'
                size='lg'
                onClick={onProceedToCheckout}
                disabled={isUpdating || items.length === 0}>
                {t("cart.proceed_to_checkout")}
                <ArrowRight className='w-4 h-4 ms-2' />
              </Button>

              <Button
                variant='outline'
                className='w-full'
                onClick={() => (window.location.href = "/shop")}>
                {t("cart.continue_shopping")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
