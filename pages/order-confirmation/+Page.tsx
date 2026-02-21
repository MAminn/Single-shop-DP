"use client";

import { useEffect, useState } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { Link } from "#root/components/utils/Link";
import { CheckCircle, Package, ArrowRight, Home, ShoppingBag } from "lucide-react";
import { Button } from "#root/components/ui/button";

export default function OrderConfirmationPage() {
  const pageContext = usePageContext();
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const orderId = searchParams?.get("id") ?? "";
  const orderTotal = searchParams?.get("total") ?? "";
  const customerEmail = searchParams?.get("email") ?? "";
  const shortId = orderId ? orderId.substring(0, 8).toUpperCase() : "";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 text-center">
        {/* Success Icon */}
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>

        {/* Heading */}
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">
          Order Confirmed!
        </h1>
        <p className="text-gray-500 mb-6">
          Thank you for your purchase. Your order has been placed successfully.
        </p>

        {/* Order Details Card */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left space-y-3">
          {shortId && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Order Number</span>
              <span className="text-sm font-mono font-medium text-gray-900">#{shortId}</span>
            </div>
          )}
          {orderTotal && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Total</span>
              <span className="text-sm font-semibold text-gray-900">
                {Number.parseFloat(orderTotal).toFixed(2)} EGP
              </span>
            </div>
          )}
          {customerEmail && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Confirmation sent to</span>
              <span className="text-sm text-gray-900">{customerEmail}</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Status</span>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full">
              <Package className="w-3.5 h-3.5" />
              Processing
            </span>
          </div>
        </div>

        {/* Info text */}
        <p className="text-sm text-gray-400 mb-8">
          We've sent a confirmation email with your order details.
          You'll receive shipping updates as your order progresses.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="outline" className="gap-2">
            <Link href="/">
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>
          <Button asChild className="gap-2 bg-black text-white hover:bg-gray-800">
            <Link href="/shop">
              <ShoppingBag className="w-4 h-4" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
