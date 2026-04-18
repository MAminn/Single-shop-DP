"use client";

import { useEffect, useRef } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { Link } from "#root/components/utils/Link";
import {
  CheckCircle,
  Package,
  ArrowRight,
  Home,
  ShoppingBag,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { Button } from "#root/components/ui/button";
import { useTracking } from "#root/frontend/contexts/TrackingContext";
import { TrackingEventName } from "#root/shared/types/pixel-tracking";
import { STORE_CURRENCY } from "#root/shared/config/branding";

type PaymentState = "none" | "success" | "pending" | "cancelled" | "failed";

function getPaymentState(param: string | null): PaymentState {
  if (!param) return "none";
  switch (param.toLowerCase()) {
    case "success":
      return "success";
    case "pending":
      return "pending";
    case "cancelled":
    case "canceled":
      return "cancelled";
    case "failed":
      return "failed";
    default:
      return "none";
  }
}

export default function OrderConfirmationPage() {
  const pageContext = usePageContext();
  const searchParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null;
  const orderId = searchParams?.get("id") ?? "";
  const orderTotal = searchParams?.get("total") ?? "";
  const customerEmail = searchParams?.get("email") ?? "";
  const paymentState = getPaymentState(searchParams?.get("payment") ?? null);
  const shortId = orderId ? orderId.substring(0, 8).toUpperCase() : "";

  // Determine what icon/color/messaging to show
  const isPaymentSuccess =
    paymentState === "success" || paymentState === "none";
  const isPaymentPending = paymentState === "pending";
  const isPaymentFailed =
    paymentState === "cancelled" || paymentState === "failed";

  // ─── Fire checkout_completed once per order ────────────────────────────
  // Uses sessionStorage keyed by orderId to survive page refresh.
  // Ref guards against React strict-mode double-effects within the same mount.
  const { trackEvent } = useTracking();
  const hasTrackedCompletion = useRef<string | null>(null);

  useEffect(() => {
    if (!orderId || !isPaymentSuccess) return;
    if (hasTrackedCompletion.current === orderId) return;

    // Persist guard: prevent re-firing on page refresh
    const storageKey = `tracked_checkout_completed:${orderId}`;
    try {
      if (sessionStorage.getItem(storageKey)) return;
    } catch {
      /* SSR or private browsing — fall through to ref guard */
    }

    hasTrackedCompletion.current = orderId;

    try {
      sessionStorage.setItem(storageKey, "1");
    } catch {
      /* best-effort */
    }

    const totalValue = orderTotal ? Number.parseFloat(orderTotal) : undefined;

    // Retrieve cart items saved by checkout page for richer Purchase events
    let purchaseItems:
      | {
          itemId: string;
          itemName: string;
          price?: number;
          quantity?: number;
          category?: string;
        }[]
      | undefined;
    try {
      const raw = sessionStorage.getItem(`checkout_items:${orderId}`);
      if (raw) {
        purchaseItems = JSON.parse(raw);
        // Clean up after reading
        sessionStorage.removeItem(`checkout_items:${orderId}`);
      }
    } catch {
      /* best-effort */
    }

    trackEvent(TrackingEventName.CHECKOUT_COMPLETED, {
      ecommerce: {
        currency: STORE_CURRENCY,
        value: totalValue,
        transactionId: orderId,
        items: purchaseItems,
      },
    });
  }, [orderId, orderTotal, isPaymentSuccess, trackEvent]);

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16'>
      <div className='max-w-lg w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 pb-10 md:p-12 md:pb-14 text-center'>
        {/* Icon */}
        {isPaymentSuccess && (
          <div className='mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6'>
            <CheckCircle className='w-8 h-8 text-green-600' />
          </div>
        )}
        {isPaymentPending && (
          <div className='mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-6'>
            <Clock className='w-8 h-8 text-amber-600' />
          </div>
        )}
        {isPaymentFailed && (
          <div className='mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6'>
            <XCircle className='w-8 h-8 text-red-600' />
          </div>
        )}

        {/* Heading */}
        {isPaymentSuccess && (
          <>
            <h1 className='text-2xl md:text-3xl font-semibold text-gray-900 mb-2'>
              Order Confirmed!
            </h1>
            <p className='text-gray-500 mb-6'>
              Thank you for your purchase. Your order has been placed
              successfully.
              {paymentState === "success" && " Payment received."}
            </p>
          </>
        )}
        {isPaymentPending && (
          <>
            <h1 className='text-2xl md:text-3xl font-semibold text-gray-900 mb-2'>
              Payment Pending
            </h1>
            <p className='text-gray-500 mb-6'>
              Your order has been created, but payment is still being processed.
              You'll receive a confirmation email once payment is complete.
            </p>
          </>
        )}
        {isPaymentFailed && (
          <>
            <h1 className='text-2xl md:text-3xl font-semibold text-amber-900 mb-2'>
              Payment {paymentState === "cancelled" ? "Cancelled" : "Failed"}
            </h1>
            <p className='text-gray-500 mb-6'>
              {paymentState === "cancelled"
                ? "You cancelled the payment. Your order has been saved — you can retry payment or contact support."
                : "There was an issue processing your payment. Your order has been saved — please try again or contact support."}
            </p>
          </>
        )}

        {/* Order Details Card */}
        <div className='bg-gray-50 rounded-xl p-6 mb-8 text-left space-y-3'>
          {shortId && (
            <div className='flex justify-between items-center'>
              <span className='text-sm text-gray-500'>Order Number</span>
              <span className='text-sm font-mono font-medium text-gray-900'>
                #{shortId}
              </span>
            </div>
          )}
          {orderTotal && (
            <div className='flex justify-between items-center'>
              <span className='text-sm text-gray-500'>Total</span>
              <span className='text-sm font-semibold text-gray-900'>
                {Number.parseFloat(orderTotal).toFixed(2)} EGP
              </span>
            </div>
          )}
          {customerEmail && (
            <div className='flex justify-between items-center'>
              <span className='text-sm text-gray-500'>
                Confirmation sent to
              </span>
              <span className='text-sm text-gray-900'>{customerEmail}</span>
            </div>
          )}
          <div className='flex justify-between items-center'>
            <span className='text-sm text-gray-500'>Status</span>
            {isPaymentSuccess && (
              <span className='inline-flex items-center gap-1.5 text-sm font-medium text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full'>
                <Package className='w-3.5 h-3.5' />
                Processing
              </span>
            )}
            {isPaymentPending && (
              <span className='inline-flex items-center gap-1.5 text-sm font-medium text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full'>
                <Clock className='w-3.5 h-3.5' />
                Awaiting Payment
              </span>
            )}
            {isPaymentFailed && (
              <span className='inline-flex items-center gap-1.5 text-sm font-medium text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full'>
                <AlertTriangle className='w-3.5 h-3.5' />
                Payment {paymentState === "cancelled" ? "Cancelled" : "Failed"}
              </span>
            )}
          </div>
        </div>

        {/* Info text */}
        {isPaymentSuccess && (
          <p className='text-sm text-gray-400 mb-8'>
            We've sent a confirmation email with your order details. You'll
            receive shipping updates as your order progresses.
          </p>
        )}
        {isPaymentPending && (
          <p className='text-sm text-gray-400 mb-8'>
            If your payment was completed, it may take a few minutes to process.
            Check your email for updates.
          </p>
        )}
        {isPaymentFailed && (
          <p className='text-sm text-gray-400 mb-8'>
            Don't worry — no charges were made. You can contact us at support
            for help.
          </p>
        )}

        {/* Actions */}
        <div className='flex flex-col sm:flex-row gap-3 justify-center'>
          <Button asChild variant='outline' className='gap-2'>
            <Link href='/'>
              <Home className='w-4 h-4' />
              Back to Home
            </Link>
          </Button>
          <Button
            asChild
            className='gap-2 text-white'>
            <Link href='/shop'>
              <ShoppingBag className='w-4 h-4' />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
