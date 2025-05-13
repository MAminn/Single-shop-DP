import type { CartItem, PromoCodeInfo } from "../context/CartContext";
import type { Order } from "../mock-data/orders";
import { OrderService, type OrderDetails } from "./OrderService";

export interface CheckoutFormData {
  shippingInfo: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  billingInfo: {
    sameAsShipping: boolean;
    fullName: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentInfo: {
    method: "card" | "cash_on_delivery" | "other";
    cardNumber?: string;
    cardExpiry?: string;
    cardCvv?: string;
    cardHolder?: string;
  };
  deliveryMethod: "standard" | "express" | "pickup";
  notes?: string;
}

export interface CheckoutSummary {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  promoCode: PromoCodeInfo | null;
}

export const CheckoutService = {
  async processCheckout(
    userId: number,
    cartItems: CartItem[],
    formData: CheckoutFormData,
    promoCode: PromoCodeInfo | null = null
  ): Promise<Order> {
    for (const item of cartItems) {
      if (!item.stock || item.quantity > item.stock) {
        throw new Error(`Item ${item.name} has insufficient stock`);
      }
    }

    const subtotal = cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    // Calculate discount from promo code if available
    let discount = 0;
    if (promoCode) {
      if (promoCode.discountType === "percentage") {
        discount = subtotal * (promoCode.discountValue / 100);
      } else if (promoCode.discountType === "fixed_amount") {
        discount = promoCode.discountValue;
        // Make sure discount doesn't exceed subtotal
        if (discount > subtotal) {
          discount = subtotal;
        }
      }
    }

    const discountedSubtotal = subtotal - discount;

    const shipping =
      formData.deliveryMethod === "express"
        ? 15
        : formData.deliveryMethod === "standard"
          ? 5
          : 0;

    const tax = discountedSubtotal * 0.05;

    const total = discountedSubtotal + shipping + tax;

    const billingAddress = formData.billingInfo.sameAsShipping
      ? { ...formData.shippingInfo }
      : {
          fullName: formData.billingInfo.fullName,
          address: formData.billingInfo.address,
          city: formData.billingInfo.city,
          state: formData.billingInfo.state,
          postalCode: formData.billingInfo.postalCode,
          country: formData.billingInfo.country,
        };

    const orderDetails: OrderDetails = {
      userId,
      items: cartItems,
      shippingAddress: {
        fullName: formData.shippingInfo.fullName,
        address: formData.shippingInfo.address,
        city: formData.shippingInfo.city,
        state: formData.shippingInfo.state,
        postalCode: formData.shippingInfo.postalCode,
        country: formData.shippingInfo.country,
      },
      billingAddress,
      paymentMethod: formData.paymentInfo.method,
      deliveryMethod: formData.deliveryMethod,
      subtotal,
      tax,
      shipping,
      discount,
      total,
      promoCodeId: promoCode?.id,
      notes: formData.notes,
    };

    try {
      const order = await OrderService.createOrder(orderDetails);
      return order;
    } catch (error) {
      console.error("Failed to process checkout:", error);
      throw error;
    }
  },

  calculateSummary(
    items: CartItem[],
    deliveryMethod = "standard",
    promoCode: PromoCodeInfo | null = null
  ): CheckoutSummary {
    const subtotal = items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    // Calculate discount from promo code if available
    let discount = 0;
    if (promoCode) {
      if (promoCode.discountType === "percentage") {
        discount = subtotal * (promoCode.discountValue / 100);
      } else if (promoCode.discountType === "fixed_amount") {
        discount = promoCode.discountValue;
        // Make sure discount doesn't exceed subtotal
        if (discount > subtotal) {
          discount = subtotal;
        }
      }
    }

    const discountedSubtotal = subtotal - discount;

    const shipping =
      deliveryMethod === "express" ? 15 : deliveryMethod === "standard" ? 5 : 0;

    const tax = discountedSubtotal * 0.05;

    const total = discountedSubtotal + shipping + tax;

    return {
      items,
      subtotal,
      shipping,
      tax,
      discount,
      total,
      promoCode,
    };
  },
};
