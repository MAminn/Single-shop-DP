import type { CartItem } from "../context/CartContext";
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
  total: number;
}

export const CheckoutService = {
  async processCheckout(
    userId: number,
    cartItems: CartItem[],
    formData: CheckoutFormData
  ): Promise<Order> {
    // Verify stock availability
    for (const item of cartItems) {
      if (!item.stock || item.quantity > item.stock) {
        throw new Error(`Item ${item.name} has insufficient stock`);
      }
    }

    // Calculate totals
    const subtotal = cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    // Calculate shipping (simplified for mock)
    const shipping =
      formData.deliveryMethod === "express"
        ? 15
        : formData.deliveryMethod === "standard"
        ? 5
        : 0;

    // Calculate tax (simplified for mock - 5% tax rate)
    const tax = subtotal * 0.05;

    // Calculate total
    const total = subtotal + shipping + tax;

    // Prepare billing address (use shipping if sameAsShipping is true)
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

    // Create order request
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
      total,
      notes: formData.notes,
    };

    // Create order (sends notifications to vendors in the process)
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
    deliveryMethod = "standard"
  ): CheckoutSummary {
    const subtotal = items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    const shipping =
      deliveryMethod === "express" ? 15 : deliveryMethod === "standard" ? 5 : 0;

    const tax = subtotal * 0.05;

    const total = subtotal + shipping + tax;

    return {
      items,
      subtotal,
      shipping,
      tax,
      total,
    };
  },
};
