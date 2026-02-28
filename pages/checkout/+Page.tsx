"use client";

import { useState, useMemo } from "react";
import {
  useCart,
  type CartItem as ContextCartItem,
  type PromoCodeInfo,
} from "#root/lib/context/CartContext";
import { useTemplate } from "#root/frontend/contexts/TemplateContext";
import { getTemplateComponent } from "#root/components/template-system/templateConfig";
import { trpc } from "#root/shared/trpc/client";
import type {
  CheckoutPageModernTemplateProps,
  CheckoutCustomerInfo,
  CheckoutAddress,
  CheckoutOrderSummaryItem,
  CheckoutTotals,
} from "#root/components/template-system";
import { STORE_CURRENCY } from "#root/shared/config/branding";
import { navigate } from "vike/client/router";

/** Parse a Zod validation error (JSON array) into a friendly message */
function parseOrderError(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message;
    // Try to parse Zod-style array of issues
    try {
      const issues = JSON.parse(msg);
      if (Array.isArray(issues)) {
        const fieldLabels: Record<string, string> = {
          customerName: "Full Name",
          customerEmail: "Email",
          customerPhone: "Phone Number",
          shippingAddress: "Shipping Address",
          shippingCity: "City",
          shippingState: "State",
          shippingPostalCode: "Postal Code",
          shippingCountry: "Country",
        };
        return issues
          .map((issue: { path?: string[]; message?: string }) => {
            const field = issue.path?.[0];
            const label = field ? fieldLabels[field] ?? field : "Unknown field";
            return `${label}: ${issue.message ?? "Invalid value"}`;
          })
          .join("\n");
      }
    } catch {
      // Not JSON — use raw message
    }
    return msg;
  }
  return "Failed to submit order. Please try again.";
}

export default function CheckoutPage() {
  const {
    items,
    totalItems,
    subtotal,
    discount,
    shipping,
    tax,
    total,
    promoCode,
    clearCart,
  } = useCart();
  const { getTemplateId } = useTemplate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined,
  );

  // Convert cart items to checkout order summary items
  const orderItems: CheckoutOrderSummaryItem[] = useMemo(() => {
    return items.map((item: ContextCartItem) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    }));
  }, [items]);

  // Build totals object
  const totals: CheckoutTotals = useMemo(() => {
    return {
      subtotal,
      discount: discount > 0 ? discount : undefined,
      shipping: shipping > 0 ? shipping : undefined,
      tax: tax > 0 ? tax : undefined,
      grandTotal: total,
    };
  }, [subtotal, discount, shipping, tax, total]);

  // Handle form submit
  const handleSubmit = async (
    formValues: Record<string, string>,
  ): Promise<void> => {
    setIsSubmitting(true);
    setErrorMessage(undefined);

    try {
      // Validate cart has items
      if (items.length === 0) {
        throw new Error("Your cart is empty. Please add items before placing an order.");
      }

      // Prepare order items
      const orderItemsPayload = items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      }));

      // Submit order via tRPC
      const result = await trpc.order.create.mutate({
        customerName: formValues.fullName || "",
        customerEmail: formValues.email || "",
        customerPhone: formValues.phoneNumber || "",
        shippingAddress: formValues.address || "",
        shippingCity: formValues.city || "",
        shippingState: formValues.state || null,
        shippingPostalCode: formValues.postalCode || null,
        shippingCountry: formValues.country || "Egypt",
        items: orderItemsPayload,
        notes: formValues.notes || undefined,
        promoCodeId: promoCode?.id,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to create order");
      }

      // Clear cart on successful order
      clearCart();

      // Navigate to order confirmation page with order details
      const orderId = result.result?.id ?? "";
      const orderTotal = result.result?.total ?? "";
      const email = encodeURIComponent(formValues.email || "");
      navigate(`/order-confirmation?id=${orderId}&total=${orderTotal}&email=${email}`);
    } catch (error) {
      console.error("[Checkout] Order submission failed:", error);
      setErrorMessage(parseOrderError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit cart
  const handleEditCart = (): void => {
    navigate("/cart");
  };

  // Get template component
  const templateId = getTemplateId("checkoutPage");
  const Template = getTemplateComponent(
    "checkoutPage",
    templateId || "checkout-modern",
  );

  if (!Template) {
    return <div>Template not found: {templateId}</div>;
  }

  const templateProps: CheckoutPageModernTemplateProps = {
    items: orderItems,
    totals,
    isSubmitting,
    errorMessage,
    onSubmit: handleSubmit,
    onEditCart: handleEditCart,
    currency: STORE_CURRENCY,
  };

  return <Template.component {...templateProps} />;
}
