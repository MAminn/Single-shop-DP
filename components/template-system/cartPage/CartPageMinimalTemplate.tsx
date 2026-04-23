import React from "react";
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import type { CartPageModernTemplateProps } from "./CartPageModernTemplate";

/**
 * CartPageMinimalTemplate
 * Mobile-first minimal cart layout matching the minimal store aesthetic.
 * Clean, no-card design, stone palette, full-width on mobile.
 */
export function CartPageMinimalTemplate({
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
  const [couponApplied, setCouponApplied] = React.useState(false);

  const handleApplyCoupon = () => {
    if (couponCode.trim() && onApplyCoupon) {
      onApplyCoupon(couponCode.trim());
      setCouponApplied(true);
      setCouponCode("");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <ShoppingCart className="w-12 h-12 text-gray-200 mb-4" />
        <h2 className="text-[18px] font-medium text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-[14px] text-gray-400 mb-6">Add items to your cart to continue shopping</p>
        <a
          href="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white text-[13px] font-medium hover:bg-gray-700 transition-colors">
          Continue Shopping
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* Page title */}
        <h1 className="text-[22px] sm:text-[28px] font-medium text-gray-900 mb-6 sm:mb-8">
          Cart <span className="text-gray-400 font-normal text-[16px] sm:text-[18px]">({items.length} {items.length === 1 ? "item" : "items"})</span>
        </h1>

        <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-12">

          {/* ── Left: Items ───────────────────────────────── */}
          <div>
            {/* Column headers (desktop only) */}
            <div className="hidden sm:grid grid-cols-[1fr_120px_100px_40px] gap-4 pb-3 border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-400 font-medium">
              <span>Product</span>
              <span className="text-center">Quantity</span>
              <span className="text-right">Price</span>
              <span />
            </div>

            {/* Items list */}
            <div className="divide-y divide-gray-100">
              {items.map((item) => {
                const lineTotal = item.price * item.quantity;
                return (
                  <div key={item.id} className={`py-5 sm:py-6 transition-opacity ${isUpdating ? "opacity-60 pointer-events-none" : ""}`}>

                    {/* Mobile layout */}
                    <div className="flex gap-3 sm:hidden">
                      {/* Image */}
                      <div className="w-[88px] h-[88px] shrink-0 bg-gray-50 overflow-hidden">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingCart className="w-6 h-6 text-gray-200" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 flex flex-col gap-1">
                        {/* Name row + delete */}
                        <div className="flex items-start gap-1">
                          <p
                            className="flex-1 text-[14px] font-medium leading-snug break-words overflow-hidden"
                            style={{ color: "#111827", fontFamily: "'Poppins', sans-serif" }}>
                            {item.name}
                          </p>
                          <button
                            type="button"
                            onClick={() => onRemoveItem?.(item.id)}
                            aria-label="Remove item"
                            className="shrink-0 w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors -mr-1">
                            <Trash2 className="w-[15px] h-[15px]" />
                          </button>
                        </div>

                        {item.variant && (
                          <p className="text-[11px] text-gray-400 leading-none">{item.variant}</p>
                        )}

                        {/* Unit price */}
                        <p className="text-[12px] text-gray-400">
                          {item.price.toFixed(2)} {currency} each
                        </p>

                        {/* Qty + line total */}
                        <div className="flex flex-col items-center mt-auto pt-1">
                          <div className="flex  items-center border border-gray-200 w-fit">
                            <button
                              type="button"
                              onClick={() => onQuantityChange?.(item.id, Math.max(1, item.quantity - 1))}
                              aria-label="Decrease quantity"
                              className="w-[38px] h-[38px] flex items-center justify-center text-gray-600 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                              disabled={item.quantity <= 1}>
                              <Minus className="w-3 h-3" />
                            </button>
                            <span
                              className="w-8 text-center text-[13px] font-medium"
                              style={{ color: "#111827", fontFamily: "'Poppins', sans-serif" }}>
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => onQuantityChange?.(item.id, item.quantity + 1)}
                              aria-label="Increase quantity"
                              className="w-[38px] h-[38px] flex items-center justify-center text-gray-600 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                              disabled={item.stock != null && item.quantity >= item.stock}>
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <p
                            className="text-[15px] font-semibold"
                            style={{ color: "#111827", fontFamily: "'Poppins', sans-serif" }}>
                            {lineTotal.toFixed(2)} {currency}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Desktop layout */}
                    <div className="hidden sm:grid grid-cols-[1fr_120px_100px_40px] gap-4 items-center">
                      <div className="flex items-center gap-4">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover bg-gray-50 shrink-0" />
                        ) : (
                          <div className="w-16 h-16 bg-gray-50 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p
                            className="text-[14px] font-medium break-words"
                            style={{ color: "#111827", fontFamily: "'Poppins', sans-serif" }}>
                            {item.name}
                          </p>
                          {item.variant && <p className="text-[12px] text-gray-400 mt-0.5">{item.variant}</p>}
                          <p className="text-[12px] text-gray-500 mt-0.5">{item.price.toFixed(2)} {currency} each</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-center border border-gray-200 w-fit mx-auto">
                        <button
                          type="button"
                          onClick={() => onQuantityChange?.(item.id, Math.max(1, item.quantity - 1))}
                          aria-label="Decrease quantity"
                          className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                          disabled={item.quantity <= 1}>
                          <Minus className="w-3 h-3" />
                        </button>
                        <span
                          className="w-8 text-center text-[13px] font-medium"
                          style={{ color: "#111827", fontFamily: "'Poppins', sans-serif" }}>
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onQuantityChange?.(item.id, item.quantity + 1)}
                          aria-label="Increase quantity"
                          className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                          disabled={item.stock != null && item.quantity >= item.stock}>
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <p
                        className="text-[14px] font-semibold text-right"
                        style={{ color: "#111827", fontFamily: "'Poppins', sans-serif" }}>
                        {lineTotal.toFixed(2)} {currency}
                      </p>
                      <button
                        type="button"
                        onClick={() => onRemoveItem?.(item.id)}
                        aria-label="Remove item"
                        className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors justify-self-end">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Promo code (mobile: above summary, desktop: below items) */}
            <div className="mt-6 lg:mt-8">
              <p className="text-[12px] uppercase tracking-wider text-gray-400 font-medium mb-2">Promo Code</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleApplyCoupon(); }}
                  placeholder="Enter code"
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-[13px] text-gray-900 placeholder-gray-300 outline-none focus:border-gray-400 transition-colors bg-white min-w-0"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={!couponCode.trim()}
                  className="px-5 py-2.5 bg-gray-900 text-white text-[12px] font-medium uppercase tracking-wide hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0">
                  Apply
                </button>
              </div>
              {couponApplied && totals.discount && totals.discount > 0 && (
                <p className="text-[12px] text-green-600 mt-1.5">Promo code applied — saving {totals.discount.toFixed(2)} {currency}</p>
              )}
            </div>
          </div>

          {/* ── Right: Order Summary ────────────────────── */}
          <div className="mt-8 lg:mt-0">
            <div className="bg-gray-50 p-6">
              <h2 className="text-[15px] font-semibold text-gray-900 mb-5">Order Summary</h2>

              <div className="space-y-3">
                <div className="flex justify-between text-[13px] text-gray-600">
                  <span>Subtotal</span>
                  <span>{totals.subtotal.toFixed(2)} {currency}</span>
                </div>
                {totals.discount != null && totals.discount > 0 && (
                  <div className="flex justify-between text-[13px] text-green-600">
                    <span>Discount</span>
                    <span>−{totals.discount.toFixed(2)} {currency}</span>
                  </div>
                )}
                <div className="flex justify-between text-[13px] text-gray-600">
                  <span>Shipping</span>
                  <span>{totals.shipping != null && totals.shipping > 0 ? `${totals.shipping.toFixed(2)} ${currency}` : "Calculated at checkout"}</span>
                </div>
                <div className="pt-3 border-t border-gray-200 flex justify-between text-[15px] font-semibold text-gray-900">
                  <span>Total</span>
                  <span>{totals.grandTotal.toFixed(2)} {currency}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onProceedToCheckout}
                disabled={isUpdating || items.length === 0}
                className="mt-6 w-full py-4 bg-gray-900 text-white text-[13px] font-medium uppercase tracking-wider hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {isUpdating ? "Updating…" : "Proceed to Checkout"}
              </button>

              <a
                href="/shop"
                className="mt-3 w-full flex items-center justify-center py-3 text-[12px] text-gray-500 hover:text-gray-800 transition-colors uppercase tracking-wide">
                ← Continue Shopping
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
