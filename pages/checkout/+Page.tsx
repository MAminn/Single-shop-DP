import { useState } from "react";
import { useCart, type CartItem as ContextCartItem, type PromoCodeInfo } from "#root/lib/context/CartContext";
import TemplateRenderer from "#root/frontend/components/template/TemplateRenderer";
import { useTemplate } from "#root/frontend/contexts/TemplateContext";
import type { CheckoutTemplateData, CheckoutItem } from "#root/frontend/components/template/templateRegistry";

export default function CheckoutPage() {
  const { items, totalItems, subtotal, discount, shipping, tax, total, promoCode } = useCart();
  const { getActiveTemplate } = useTemplate();

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
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);

  // Convert cart items to checkout items
  const checkoutItems: CheckoutItem[] = items.map((item: ContextCartItem) => ({
    id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    imageUrl: item.imageUrl,
    selectedOptions: item.selectedOptions,
    vendorName: item.vendor || 'Unknown Vendor',
    categoryName: item.category || item.categoryName || 'Uncategorized',
    stock: item.stock || 0,
  }));

  // Prepare template data
  const templateData: CheckoutTemplateData = {
    items: checkoutItems,
    totalItems,
    subtotal,
    discount,
    shipping,
    tax,
    total,
    promoCode,
    formData,
    isSubmitting,
    showOrderConfirmation,
    orderDetails: null,
    isLoading: false,
    error: null,
  };

  const activeTemplate = getActiveTemplate('checkout');

  return (
    <TemplateRenderer
      category="checkout"
      templateId={activeTemplate}
      data={templateData}
    />
  );
}
