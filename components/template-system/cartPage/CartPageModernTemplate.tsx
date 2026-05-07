import React from "react";
import { Button } from "#root/components/ui/button";
import { Input } from "#root/components/ui/input";
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, Gift } from "lucide-react";
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
  appliedOffers?: Array<{ name: string; discountAmount: number; freeShipping: boolean }>;
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
      <div className='min-h-[60vh] flex items-center justify-center'>
        <ShoppingCart className='w-10 h-10 text-muted-foreground animate-pulse' />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className='min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center'>
        <ShoppingCart className='w-14 h-14 text-muted-foreground/40' />
        <h2 className='text-2xl font-bold'>{t("cart.empty")}</h2>
        <p className='text-muted-foreground'>{t("cart.empty_cta")}</p>
        <Button onClick={() => (window.location.href = "/shop")} className='mt-2'>
          {t("cart.continue_shopping")}
        </Button>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background'>
      <div className='mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12'>
        <h1 className='text-2xl sm:text-3xl font-bold mb-8'>
          {t("cart.title")}
          <span className='ms-3 text-base font-normal text-muted-foreground'>
            ({items.length} {items.length === 1 ? "item" : "items"})
          </span>
        </h1>

        <div className='lg:grid lg:grid-cols-[1fr_380px] lg:gap-12'>

          {/* ── Items list ─────────────────────────────────── */}
          <div>
            {/* Desktop column headers */}
            <div className='hidden sm:grid grid-cols-[1fr_140px_90px_36px] gap-4 pb-3 border-b text-xs uppercase tracking-widest text-muted-foreground font-medium'>
              <span>{t("cart.product") || "Product"}</span>
              <span className='text-center'>{t("cart.quantity") || "Quantity"}</span>
              <span className='text-right'>{t("cart.total") || "Total"}</span>
              <span />
            </div>

            <div className='divide-y'>
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`py-5 sm:py-6 transition-opacity ${isUpdating ? "opacity-50 pointer-events-none" : ""}`}
                >
                  {/* ── Mobile layout ── */}
                  <div className='flex gap-4 sm:hidden'>
                    <div className='w-20 h-20 shrink-0 bg-muted rounded-lg overflow-hidden'>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className='w-full h-full object-cover' />
                      ) : (
                        <div className='w-full h-full flex items-center justify-center'>
                          <ShoppingCart className='w-5 h-5 text-muted-foreground/30' />
                        </div>
                      )}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-start justify-between gap-2'>
                        <div className='min-w-0'>
                          <p className='font-semibold text-sm leading-snug break-words'>{item.name}</p>
                          {item.variant && <p className='text-xs text-muted-foreground mt-0.5'>{item.variant}</p>}
                          <p className='text-sm font-medium text-muted-foreground mt-1'>
                            {currency}{item.price.toFixed(2)} {t("checkout.each") || "each"}
                          </p>
                        </div>
                        <button
                          type='button'
                          onClick={() => onRemoveItem?.(item.id)}
                          disabled={isUpdating}
                          aria-label='Remove item'
                          className='shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors'>
                          <Trash2 className='w-4 h-4' />
                        </button>
                      </div>
                      <div className='flex items-center justify-between mt-3'>
                        <div className='flex items-center border rounded-lg'>
                          <button
                            type='button'
                            onClick={() => onQuantityChange?.(item.id, Math.max(1, item.quantity - 1))}
                            disabled={isUpdating || item.quantity <= 1}
                            aria-label='Decrease quantity'
                            className='w-9 h-9 flex items-center justify-center hover:bg-muted transition-colors rounded-l-lg disabled:opacity-40'>
                            <Minus className='w-3 h-3' />
                          </button>
                          <span className='w-10 text-center text-sm font-medium'>{item.quantity}</span>
                          <button
                            type='button'
                            onClick={() => onQuantityChange?.(item.id, item.quantity + 1)}
                            disabled={isUpdating || (item.stock != null && item.quantity >= item.stock)}
                            aria-label='Increase quantity'
                            className='w-9 h-9 flex items-center justify-center hover:bg-muted transition-colors rounded-r-lg disabled:opacity-40'>
                            <Plus className='w-3 h-3' />
                          </button>
                        </div>
                        <p className='text-sm font-bold'>{currency}{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  {/* ── Desktop layout ── */}
                  <div className='hidden sm:grid grid-cols-[1fr_140px_90px_36px] gap-4 items-center'>
                    <div className='flex items-center gap-4'>
                      <div className='w-16 h-16 shrink-0 bg-muted rounded-lg overflow-hidden'>
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className='w-full h-full object-cover' />
                        ) : (
                          <div className='w-full h-full flex items-center justify-center'>
                            <ShoppingCart className='w-5 h-5 text-muted-foreground/30' />
                          </div>
                        )}
                      </div>
                      <div className='min-w-0'>
                        <p className='font-semibold text-sm'>{item.name}</p>
                        {item.variant && <p className='text-xs text-muted-foreground mt-0.5'>{item.variant}</p>}
                        <p className='text-xs text-muted-foreground mt-0.5'>
                          {currency}{item.price.toFixed(2)} {t("checkout.each") || "each"}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center border rounded-lg w-fit mx-auto'>
                      <button
                        type='button'
                        onClick={() => onQuantityChange?.(item.id, Math.max(1, item.quantity - 1))}
                        disabled={isUpdating || item.quantity <= 1}
                        aria-label='Decrease quantity'
                        className='w-9 h-9 flex items-center justify-center hover:bg-muted transition-colors rounded-l-lg disabled:opacity-40'>
                        <Minus className='w-3 h-3' />
                      </button>
                      <span className='w-10 text-center text-sm font-medium'>{item.quantity}</span>
                      <button
                        type='button'
                        onClick={() => onQuantityChange?.(item.id, item.quantity + 1)}
                        disabled={isUpdating || (item.stock != null && item.quantity >= item.stock)}
                        aria-label='Increase quantity'
                        className='w-9 h-9 flex items-center justify-center hover:bg-muted transition-colors rounded-r-lg disabled:opacity-40'>
                        <Plus className='w-3 h-3' />
                      </button>
                    </div>
                    <p className='text-sm font-bold text-right'>{currency}{(item.price * item.quantity).toFixed(2)}</p>
                    <button
                      type='button'
                      onClick={() => onRemoveItem?.(item.id)}
                      disabled={isUpdating}
                      aria-label='Remove item'
                      className='p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors justify-self-end'>
                      <Trash2 className='w-4 h-4' />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon code */}
            <div className='mt-6 pt-6 border-t'>
              <p className='text-sm font-medium mb-2'>{t("cart.coupon_code")}</p>
              <div className='flex gap-2'>
                <Input
                  placeholder={t("cart.enter_code")}
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleApplyCoupon(); }}
                  disabled={isUpdating}
                  className='text-sm'
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
          </div>

          {/* ── Order Summary ──────────────────────────────── */}
          <div className='mt-8 lg:mt-0 lg:sticky lg:top-6 lg:self-start'>
            <div className='border rounded-xl bg-card p-6 space-y-4'>
              <h2 className='font-semibold text-base'>{t("cart.order_summary")}</h2>

              <div className='space-y-2.5 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>{t("cart.subtotal")}</span>
                  <span className='font-medium'>{currency}{totals.subtotal.toFixed(2)}</span>
                </div>

                {totals.discount !== undefined && totals.discount > 0 && (
                  <div className='flex justify-between text-emerald-600'>
                    <span>{t("cart.discount")}</span>
                    <span className='font-medium'>-{currency}{totals.discount.toFixed(2)}</span>
                  </div>
                )}

                {totals.appliedOffers && totals.appliedOffers.map((offer) => (
                  <div key={offer.name} className='flex items-start justify-between gap-3 text-red-600'>
                    <span className='flex items-center gap-1.5 min-w-0 font-medium'>
                      <Gift className='w-3.5 h-3.5 shrink-0' />
                      <span className='truncate'>{offer.name}</span>
                    </span>
                    <span className='font-semibold shrink-0'>
                      {offer.freeShipping && offer.discountAmount === 0
                        ? t("cart.free_shipping") || "Free shipping"
                        : `-${currency}${offer.discountAmount.toFixed(2)}`}
                    </span>
                  </div>
                ))}

                {totals.shipping !== undefined && (
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>{t("cart.shipping")}</span>
                    <span className='font-medium'>
                      {totals.shipping === 0 ? t("cart.free") : `${currency}${totals.shipping.toFixed(2)}`}
                    </span>
                  </div>
                )}
              </div>

              <div className='border-t pt-4 flex justify-between font-bold text-base'>
                <span>{t("cart.total")}</span>
                <span>{currency}{totals.grandTotal.toFixed(2)}</span>
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
                variant='ghost'
                className='w-full text-muted-foreground'
                onClick={() => (window.location.href = "/shop")}>
                {t("cart.continue_shopping")}
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
