import { useState, useEffect, useCallback } from "react";
import { trpc } from "#root/shared/trpc/client";
import { toast } from "sonner";
import { usePageContext } from "vike-react/usePageContext";

// Types for analytics data
export interface OrderStats {
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

export interface ProductStats {
  total: number;
  outOfStock: number;
  lowStock: number;
  newThisWeek: number;
}

export interface TopSellingProduct {
  id: string;
  name: string;
  price: number;
  sold: number;
  revenue: number;
  vendorName?: string;
}

export interface Vendor {
  id: string;
  name: string;
  createdAt: Date;
  status: string;
}

export interface AnalyticsData {
  orderStats: {
    data: OrderStats | null;
    isLoading: boolean;
    error: string | null;
  };
  productStats: {
    data: ProductStats | null;
    isLoading: boolean;
    error: string | null;
  };
  topSellingProducts: {
    data: TopSellingProduct[];
    isLoading: boolean;
    error: string | null;
  };
  totalRevenue: {
    data: number | null;
    isLoading: boolean;
    error: string | null;
  };
  recentVendors: {
    data: Vendor[];
    isLoading: boolean;
    error: string | null;
  };
}

// Default state for analytics data
const defaultAnalyticsState: AnalyticsData = {
  orderStats: {
    data: null,
    isLoading: false,
    error: null,
  },
  productStats: {
    data: null,
    isLoading: false,
    error: null,
  },
  topSellingProducts: {
    data: [],
    isLoading: false,
    error: null,
  },
  totalRevenue: {
    data: null,
    isLoading: false,
    error: null,
  },
  recentVendors: {
    data: [],
    isLoading: false,
    error: null,
  },
};

// Mock data for development - will be removed when backend is ready
const mockOrderStats: OrderStats = {
  pending: 12,
  processing: 8,
  shipped: 15,
  delivered: 45,
  cancelled: 3,
};

const mockProductStats: ProductStats = {
  total: 78,
  outOfStock: 5,
  lowStock: 8,
  newThisWeek: 4,
};

const mockTopSellingProducts: TopSellingProduct[] = [
  {
    id: "1",
    name: "Smartphone X",
    price: 799.99,
    sold: 120,
    revenue: 95998.8,
    vendorName: "TechGadgets",
  },
  {
    id: "2",
    name: "Wireless Headphones",
    price: 149.99,
    sold: 85,
    revenue: 12749.15,
    vendorName: "AudioPro",
  },
  {
    id: "3",
    name: "Smart Watch",
    price: 249.99,
    sold: 62,
    revenue: 15499.38,
    vendorName: "WearableTech",
  },
  {
    id: "4",
    name: "Laptop Pro",
    price: 1299.99,
    sold: 35,
    revenue: 45499.65,
    vendorName: "ComputerWorld",
  },
  {
    id: "5",
    name: "Gaming Console",
    price: 499.99,
    sold: 28,
    revenue: 13999.72,
    vendorName: "GameStation",
  },
];

export const useAnalytics = (role: "admin" | "vendor", vendorId?: string) => {
  const [analytics, setAnalytics] = useState<AnalyticsData>(
    defaultAnalyticsState
  );
  const { urlOriginal } = usePageContext();

  // Fetch order stats
  const fetchOrderStats = useCallback(async () => {
    setAnalytics((prev) => ({
      ...prev,
      orderStats: { ...prev.orderStats, isLoading: true, error: null },
    }));

    try {
      const result = await trpc.order.stats.query({ vendorId });
      if (result.success) {
        setAnalytics((prev) => ({
          ...prev,
          orderStats: {
            data: result.result,
            isLoading: false,
            error: null,
          },
        }));
      } else {
        setAnalytics((prev) => ({
          ...prev,
          orderStats: {
            ...prev.orderStats,
            isLoading: false,
            error: result.error || "Failed to fetch order statistics",
          },
        }));
        console.error("Failed to fetch order stats:", result.error);
      }
    } catch (error) {
      setAnalytics((prev) => ({
        ...prev,
        orderStats: {
          ...prev.orderStats,
          isLoading: false,
          error: "An error occurred while fetching order statistics",
        },
      }));
      console.error("Error fetching order stats:", error);
    }
  }, [vendorId]);

  // Fetch product stats
  const fetchProductStats = useCallback(async () => {
    setAnalytics((prev) => ({
      ...prev,
      productStats: { ...prev.productStats, isLoading: true, error: null },
    }));

    try {
      const result = await trpc.product.stats.query({ vendorId });
      if (result.success) {
        setAnalytics((prev) => ({
          ...prev,
          productStats: {
            data: result.result,
            isLoading: false,
            error: null,
          },
        }));
      } else {
        setAnalytics((prev) => ({
          ...prev,
          productStats: {
            ...prev.productStats,
            isLoading: false,
            error: result.error || "Failed to fetch product statistics",
          },
        }));
        console.error("Failed to fetch product stats:", result.error);
      }
    } catch (error) {
      setAnalytics((prev) => ({
        ...prev,
        productStats: {
          ...prev.productStats,
          isLoading: false,
          error: "An error occurred while fetching product statistics",
        },
      }));
      console.error("Error fetching product stats:", error);
    }
  }, [vendorId]);

  // Fetch top selling products
  const fetchTopSellingProducts = useCallback(async () => {
    setAnalytics((prev) => ({
      ...prev,
      topSellingProducts: {
        ...prev.topSellingProducts,
        isLoading: true,
        error: null,
      },
    }));

    try {
      const result = await trpc.product.topSelling.query({
        limit: 5,
        vendorId,
      });
      if (result.success) {
        setAnalytics((prev) => ({
          ...prev,
          topSellingProducts: {
            data: result.result,
            isLoading: false,
            error: null,
          },
        }));
      } else {
        setAnalytics((prev) => ({
          ...prev,
          topSellingProducts: {
            ...prev.topSellingProducts,
            isLoading: false,
            error: result.error || "Failed to fetch top selling products",
          },
        }));
        console.error("Failed to fetch top selling products:", result.error);
      }
    } catch (error) {
      setAnalytics((prev) => ({
        ...prev,
        topSellingProducts: {
          ...prev.topSellingProducts,
          isLoading: false,
          error: "An error occurred while fetching top selling products",
        },
      }));
      console.error("Error fetching top selling products:", error);
    }
  }, [vendorId]);

  // Fetch total revenue
  const fetchTotalRevenue = useCallback(async () => {
    setAnalytics((prev) => ({
      ...prev,
      totalRevenue: { ...prev.totalRevenue, isLoading: true, error: null },
    }));

    try {
      const result = await trpc.product.revenue.query({ vendorId });
      if (result.success) {
        setAnalytics((prev) => ({
          ...prev,
          totalRevenue: {
            data: result.result,
            isLoading: false,
            error: null,
          },
        }));
      } else {
        setAnalytics((prev) => ({
          ...prev,
          totalRevenue: {
            ...prev.totalRevenue,
            isLoading: false,
            error: result.error || "Failed to fetch total revenue",
          },
        }));
        console.error("Failed to fetch total revenue:", result.error);
      }
    } catch (error) {
      setAnalytics((prev) => ({
        ...prev,
        totalRevenue: {
          ...prev.totalRevenue,
          isLoading: false,
          error: "An error occurred while fetching total revenue",
        },
      }));
      console.error("Error fetching total revenue:", error);
    }
  }, [vendorId]);

  // Fetch recent vendors (admin only)
  const fetchRecentVendors = useCallback(async () => {
    if (role !== "admin") return;

    setAnalytics((prev) => ({
      ...prev,
      recentVendors: { ...prev.recentVendors, isLoading: true, error: null },
    }));

    try {
      const result = await trpc.vendor.view.query({ limit: 5 });
      if (result.success) {
        setAnalytics((prev) => ({
          ...prev,
          recentVendors: {
            data: result.result,
            isLoading: false,
            error: null,
          },
        }));
      } else {
        setAnalytics((prev) => ({
          ...prev,
          recentVendors: {
            ...prev.recentVendors,
            isLoading: false,
            error: result.error || "Failed to fetch recent vendors",
          },
        }));
        console.error("Failed to fetch recent vendors:", result.error);
      }
    } catch (error) {
      setAnalytics((prev) => ({
        ...prev,
        recentVendors: {
          ...prev.recentVendors,
          isLoading: false,
          error: "An error occurred while fetching recent vendors",
        },
      }));
      console.error("Error fetching recent vendors:", error);
    }
  }, [role]);

  // Fetch all analytics data
  const fetchAllAnalytics = useCallback(() => {
    fetchOrderStats();
    fetchProductStats();
    fetchTopSellingProducts();
    fetchTotalRevenue();
    if (role === "admin") {
      fetchRecentVendors();
    }
  }, [
    fetchOrderStats,
    fetchProductStats,
    fetchTopSellingProducts,
    fetchTotalRevenue,
    fetchRecentVendors,
    role,
  ]);

  // Initialize analytics data fetching
  useEffect(() => {
    fetchAllAnalytics();
    // Refresh data every 5 minutes
    const refreshInterval = setInterval(() => {
      fetchAllAnalytics();
    }, 5 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, [fetchAllAnalytics]);

  return {
    ...analytics,
    refetch: fetchAllAnalytics,
  };
};
