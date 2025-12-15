import { useState, useMemo } from "react";
import { useTemplate } from "#root/frontend/contexts/TemplateContext";
import { useCart } from "#root/lib/context/CartContext";
import { getTemplateComponent } from "#root/components/template-system/templateConfig";
import type {
  CartPageModernTemplateProps,
  CartPageCartItem,
  CartPageTotals,
} from "#root/components/template-system";
import { navigate } from "vike/client/router";

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    totalItems,
    subtotal,
    discount,
    total,
    promoCode,
    applyPromoCode,
    removePromoCode,
    shipping,
    tax,
  } = useCart();
  const { getTemplateId } = useTemplate();
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Transform cart items to new template format
  const cartItems: CartPageCartItem[] = useMemo(() => {
    return items.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      imageUrl: item.imageUrl ?? undefined,
      variant: item.selectedOptions
        ? Object.entries(item.selectedOptions)
            .map(([key, value]) => `${key}: ${value}`)
            .join(", ") || undefined
        : undefined,
      stock: item.stock || 0,
      available: (item.stock || 0) > 0,
    }));
  }, [items]);

  // Build totals object
  const totals: CartPageTotals = useMemo(() => {
    return {
      subtotal,
      discount: discount > 0 ? discount : undefined,
      shipping: shipping > 0 ? shipping : undefined,
      tax: tax > 0 ? tax : undefined,
      grandTotal: total,
    };
  }, [subtotal, discount, shipping, tax, total]);

  // Handle quantity change
  const handleQuantityChange = (itemId: string, newQuantity: number): void => {
    setIsUpdating(true);
    const success = updateQuantity(itemId, newQuantity);
    if (!success) {
      console.error("Failed to update quantity");
    }
    setIsUpdating(false);
  };

  // Handle remove item
  const handleRemoveItem = (itemId: string): void => {
    setIsUpdating(true);
    removeItem(itemId);
    setIsUpdating(false);
  };

  // Handle apply coupon
  const handleApplyCoupon = async (code: string): Promise<boolean> => {
    setIsUpdating(true);
    const success = await applyPromoCode(code);
    setIsUpdating(false);
    return success;
  };

  // Handle proceed to checkout
  const handleProceedToCheckout = (): void => {
    navigate("/checkout");
  };

  // Get template component
  const templateId = getTemplateId("cartPage");
  const Template = getTemplateComponent(
    "cartPage",
    templateId || "cart-modern"
  );

  if (!Template) {
    return <div>Template not found: {templateId}</div>;
  }

  const templateProps: CartPageModernTemplateProps = {
    items: cartItems,
    totals,
    isLoading,
    isUpdating,
    currency: "EGP",
    onQuantityChange: handleQuantityChange,
    onRemoveItem: handleRemoveItem,
    onApplyCoupon: handleApplyCoupon,
    onProceedToCheckout: handleProceedToCheckout,
  };

  return <Template.component {...templateProps} />;
}
