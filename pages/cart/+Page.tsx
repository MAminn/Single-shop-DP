import { useState, useMemo } from "react";
import { useTemplate } from "#root/frontend/contexts/TemplateContext";
import TemplateRenderer from "#root/frontend/components/template/TemplateRenderer";
import { useCart } from "#root/lib/context/CartContext";
import type { CartTemplateData } from "#root/frontend/components/template/templateRegistry";

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
  const { getActiveTemplate } = useTemplate();
  const [isLoading, setIsLoading] = useState(false);

  // Transform cart items to template format
  const cartTemplateData: CartTemplateData = useMemo(() => {
    const templateItems = items.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      discountPrice: null,
      quantity: item.quantity,
      imageUrl: item.imageUrl || '',
      images: item.imageUrl ? [{ url: item.imageUrl, isPrimary: true }] : [],
      selectedOptions: item.selectedOptions,
      vendorName: item.vendor || 'Unknown Vendor',
      categoryName: item.category || 'Uncategorized',
      stock: item.stock || 0,
    }));

    return {
      items: templateItems,
      totalItems,
      subtotal,
      shipping,
      tax,
      total,
      promoCode: promoCode ? {
        id: promoCode.id,
        code: promoCode.code,
        discountType: promoCode.discountType,
        discountValue: promoCode.discountValue,
      } : null,
      discount,
      isLoading,
    };
  }, [items, totalItems, subtotal, shipping, tax, total, promoCode, discount, isLoading]);

  const activeTemplate = getActiveTemplate('cart');

  return (
    <TemplateRenderer
      category="cart"
      templateId={activeTemplate}
      data={cartTemplateData}
    />
  );
}
