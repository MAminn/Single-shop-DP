import { useState, useMemo } from "react";
import {
  useCart,
  type CartItem as ContextCartItem,
  type PromoCodeInfo,
} from "#root/lib/context/CartContext";
import { useTemplate } from "#root/frontend/contexts/TemplateContext";
import { getTemplateComponent } from "#root/components/template-system/templateConfig";
import type {
  CheckoutPageModernTemplateProps,
  CheckoutCustomerInfo,
  CheckoutAddress,
  CheckoutOrderSummaryItem,
  CheckoutTotals,
} from "#root/components/template-system";
import { navigate } from "vike/client/router";

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
  } = useCart();
  const { getTemplateId } = useTemplate();

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Egypt",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
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

  // Build customer info (only if form has data)
  const customerInfo: CheckoutCustomerInfo | undefined = useMemo(() => {
    if (!formData.fullName && !formData.email) return undefined;
    return {
      name: formData.fullName,
      email: formData.email,
      phone: formData.phoneNumber || undefined,
    };
  }, [formData]);

  // Build shipping address (only if form has data)
  const shippingAddress: CheckoutAddress | undefined = useMemo(() => {
    if (!formData.address && !formData.city) return undefined;
    return {
      line1: formData.address,
      line2: formData.notes || undefined,
      city: formData.city,
      state: formData.state || undefined,
      postalCode: formData.postalCode,
      country: formData.country,
    };
  }, [formData]);

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
    formValues: Record<string, string>
  ): Promise<void> => {
    setIsSubmitting(true);
    setErrorMessage(undefined);

    try {
      // Update form data
      setFormData({
        fullName: formValues.fullName || "",
        phoneNumber: formValues.phoneNumber || "",
        email: formValues.email || "",
        address: formValues.address || "",
        city: formValues.city || "",
        state: formValues.state || "",
        postalCode: formValues.postalCode || "",
        country: formValues.country || "Egypt",
        notes: formValues.notes || "",
      });

      // TODO: Submit order via tRPC
      // For now, just simulate success
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Navigate to success page
      navigate("/order-confirmation");
    } catch (error) {
      console.error("Order submission failed:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to submit order"
      );
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
    templateId || "checkout-modern"
  );

  if (!Template) {
    return <div>Template not found: {templateId}</div>;
  }

  const templateProps: CheckoutPageModernTemplateProps = {
    customer: customerInfo,
    shippingAddress,
    billingAddress: shippingAddress, // Use same address for billing
    items: orderItems,
    totals,
    isSubmitting,
    errorMessage,
    onSubmit: handleSubmit,
    onEditCart: handleEditCart,
    currency: "EGP",
  };

  return <Template.component {...templateProps} />;
}
