import type { CartItem } from "../context/CartContext";
import type { Order } from "../mock-data/orders";
import { orders } from "../mock-data/orders";
import type { Vendor } from "../mock-data/vendors";

export interface OrderDetails {
  userId: number;
  items: CartItem[];
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  billingAddress: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: "card" | "cash_on_delivery" | "other";
  deliveryMethod: "standard" | "express" | "pickup";
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  notes?: string;
}

export interface OrderItem extends CartItem {
  orderId: number;
  orderItemId: number;
}

export interface OrderSummary {
  id: number;
  status: string;
  date: string;
  total: number;
  items: number;
}

interface ExtendedOrder extends Order {
  items: OrderItem[];
  customerId: number;
}

export const OrderService = {
  createOrder(orderDetails: OrderDetails): Promise<Order> {
    return new Promise((resolve, reject) => {
      try {
        const stockValidation = orderDetails.items.every((item) => {
          if (!item.stock || item.stock < item.quantity) {
            return false;
          }
          return true;
        });

        if (!stockValidation) {
          reject(
            new Error(
              "One or more items are out of stock or have insufficient quantity"
            )
          );
          return;
        }

        const newOrderId =
          orders.length > 0 ? Math.max(...orders.map((o) => o.id)) + 1 : 1;

        const orderItems: OrderItem[] = orderDetails.items.map(
          (item, index) => ({
            ...item,
            orderId: newOrderId,
            orderItemId: index + 1,
          })
        );

        const newOrder: ExtendedOrder = {
          id: newOrderId,
          customerId: orderDetails.userId,
          status: "Pending",
          date: new Date().toISOString(),
          customer: String(orderDetails.userId),
          total: orderDetails.total.toString(),
          items: orderItems,
        };

        this.notifyVendors(newOrder);

        orders.push(newOrder as unknown as Order);

        resolve(newOrder as Order);
      } catch (error) {
        reject(error);
      }
    });
  },

  notifyVendors(order: ExtendedOrder): void {
    const vendorItems: Record<number, OrderItem[]> = {};

    for (const item of order.items) {
      if (!item.vendorId) continue;

      if (!vendorItems[item.vendorId]) {
        vendorItems[item.vendorId] = [];
      }

      const vendorId = item.vendorId;
      if (vendorItems[vendorId]) {
        vendorItems[vendorId].push(item);
      }
    }

    for (const [vendorId, items] of Object.entries(vendorItems)) {
      const vendorSubtotal = items.reduce(
        (total: number, item: OrderItem) => total + item.price * item.quantity,
        0
      );

     
    }
  },

  getOrderById(orderId: number): Promise<Order | null> {
    return new Promise((resolve) => {
      const order = orders.find((o) => o.id === orderId) || null;
      resolve(order);
    });
  },

  getUserOrders(userId: number): Promise<OrderSummary[]> {
    return new Promise((resolve) => {
      const extendedOrders = orders as unknown as ExtendedOrder[];

      const userOrders = extendedOrders
        .filter((order) => order.customerId === userId)
        .map((order) => ({
          id: order.id,
          status: order.status,
          date: order.date,
          total: Number(order.total),
          items: order.items.length,
        }));

      resolve(userOrders);
    });
  },

  getVendorOrders(vendorId: number): Promise<OrderSummary[]> {
    return new Promise((resolve) => {
      const vendorOrders: OrderSummary[] = [];
      const extendedOrders = orders as unknown as ExtendedOrder[];

      for (const order of extendedOrders) {
        const vendorItems = order.items.filter(
          (item: OrderItem) => item.vendorId === vendorId
        );

        if (vendorItems.length > 0) {
          const vendorTotal = vendorItems.reduce(
            (total: number, item: OrderItem) =>
              total + item.price * item.quantity,
            0
          );

          vendorOrders.push({
            id: order.id,
            status: order.status,
            date: order.date,
            total: vendorTotal,
            items: vendorItems.length,
          });
        }
      }

      resolve(vendorOrders);
    });
  },

  updateOrderStatus(
    orderId: number,
    newStatus: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled"
  ): Promise<Order | null> {
    return new Promise((resolve) => {
      const orderIndex = orders.findIndex((o) => o.id === orderId);

      if (orderIndex === -1) {
        resolve(null);
        return;
      }

      const orderToUpdate = orders[orderIndex];
      if (orderToUpdate) {
        orderToUpdate.status = newStatus;
        resolve(orderToUpdate);
      } else {
        resolve(null);
      }
    });
  },
};
