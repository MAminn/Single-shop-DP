import { Link } from "#root/components/utils/Link";
import { Button } from "#root/components/ui/button.jsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "#root/components/ui/card.jsx";
import {
  ArrowUpRight,
  ChevronRight,
  DollarSign,
  Package,
  ShoppingBag,
  ShoppingCart,
  Store,
  Truck,
  Users,
  AlertTriangle,
  PackageOpen,
  TrendingUp,
  Clipboard,
  Clock,
  BarChart3,
  CircleAlert,
  Grid,
  Star,
  Palette,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#root/components/ui/table";
import { Badge } from "#root/components/ui/badge";
import { useRole } from "#root/lib/context/RoleContext";

import type { Vendor } from "#root/lib/mock-data/vendors";
import type { Product } from "#root/lib/mock-data/products";
import type { Order } from "#root/lib/mock-data/orders";
import { useData } from "vike-react/useData";
import type { Data } from "./+data";
import { ErrorSection } from "#root/components/dashboard/ErrorSection";

// Import all dashboard components from index file
import {
  OrderStatsCard,
  ProductStatsCard,
  TopSellingProductsCard,
  RevenueStatsCard,
  RecentVendorsCard,
  useAnalytics,
} from "#root/components/dashboard";

export default function Dashboard() {
  const { userRole } = useRole();

  return (
    <div className='p-6'>
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>
            Dashboard Overview
          </h1>
          <p className='text-muted-foreground'>
            {userRole === "admin"
              ? "Platform-wide metrics and vendor management"
              : "Welcome to your store dashboard"}
          </p>
        </div>
      </div>

      {userRole === "admin" ? <AdminDashboard /> : <VendorDashboard />}
    </div>
  );
}

function AdminDashboard() {
  const fetchData = useData<Data>();
  const analytics = useAnalytics("admin");

  if (!fetchData.success) {
    return <ErrorSection error={fetchData.error} />;
  }

  if (fetchData.type === "vendor") {
    return <ErrorSection error='You are not authorized to view this page' />;
  }

  const data = fetchData.result;
  const pendingOrdersCount = analytics.orderStats.data?.pending || 0;
  const outOfStockCount = analytics.productStats.data?.outOfStock || 0;

  return (
    <div className='space-y-6'>
      {(data.vendors.pending > 0 ||
        pendingOrdersCount > 0 ||
        outOfStockCount > 0) && (
        <Card className='bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800'>
          <CardHeader>
            <div className='flex items-center'>
              <AlertTriangle className='h-5 w-5 text-orange-500 mr-2' />
              <CardTitle className='text-lg font-medium'>
                Attention Required
              </CardTitle>
            </div>
            <CardDescription>Items that need your attention</CardDescription>
          </CardHeader>
          <CardContent className='p-4'>
            <ul className='space-y-3'>
              {data.vendors.pending > 0 && (
                <li className='flex items-center text-sm'>
                  <CircleAlert className='h-4 w-4 text-yellow-600 mr-2' />
                  <span>
                    {data.vendors.pending} new vendor registrations awaiting
                    approval
                  </span>
                  <Link
                    href='/dashboard/vendors'
                    className='ml-auto text-blue-600'>
                    Review
                  </Link>
                </li>
              )}
              {pendingOrdersCount > 0 && (
                <li className='flex items-center text-sm'>
                  <CircleAlert className='h-4 w-4 text-blue-600 mr-2' />
                  <span>{pendingOrdersCount} orders awaiting processing</span>
                  <Link
                    href='/dashboard/orders'
                    className='ml-auto text-blue-600'>
                    View
                  </Link>
                </li>
              )}
              {outOfStockCount > 0 && (
                <li className='flex items-center text-sm'>
                  <CircleAlert className='h-4 w-4 text-red-600 mr-2' />
                  <span>{outOfStockCount} products out of stock</span>
                  <Link
                    href='/dashboard/products'
                    className='ml-auto text-blue-600'>
                    Check
                  </Link>
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  Total Vendors
                </p>
                <p className='text-3xl font-bold'>{data.vendors.total}</p>
              </div>
              <div className='h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center'>
                <Store className='h-6 w-6 text-blue-600 dark:text-blue-300' />
              </div>
            </div>
            <div className='mt-4 flex items-center text-sm'>
              {data.vendors.new > 0 && (
                <Badge
                  variant='outline'
                  className='bg-green-100 text-green-800 hover:bg-green-100'>
                  +{data.vendors.new} this month
                </Badge>
              )}
              <Link
                href='/dashboard/vendors'
                className='ml-auto flex items-center text-blue-600'>
                View all
                <ChevronRight className='h-4 w-4 ml-1' />
              </Link>
            </div>
          </CardContent>
        </Card>

        <ProductStatsCard
          productStats={
            analytics.productStats.data || {
              total: 0,
              outOfStock: 0,
              lowStock: 0,
              newThisWeek: 0,
            }
          }
          isLoading={analytics.productStats.isLoading}
          error={analytics.productStats.error}
        />

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  Website Templates
                </p>
                <p className='text-3xl font-bold'>Active</p>
              </div>
              <div className='h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center'>
                <Palette className='h-6 w-6 text-purple-600 dark:text-purple-300' />
              </div>
            </div>
            <div className='mt-4 flex items-center text-sm'>
              <Badge
                variant='outline'
                className='bg-blue-100 text-blue-800 hover:bg-blue-100'>
                Customization Ready
              </Badge>
              <Button
                variant='ghost'
                size='sm'
                className='ml-auto flex items-center text-blue-600 hover:text-blue-800'
                onClick={() => {
                  // Template management functionality will be added here
                  alert("Template management coming soon!");
                }}>
                Manage
                <ChevronRight className='h-4 w-4 ml-1' />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* <RevenueStatsCard
          totalRevenue={analytics.totalRevenue.data || 0}
          percentChange={8}
          timeFrame="last month"
          isLoading={analytics.totalRevenue.isLoading}
          error={analytics.totalRevenue.error}
        /> */}

        {/* <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Customers
                </p>
                <p className="text-3xl font-bold">2,845</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                <Users className="h-6 w-6 text-orange-600 dark:text-orange-300" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Badge
                variant="outline"
                className="bg-green-100 text-green-800 hover:bg-green-100"
              >
                +5 new this week
              </Badge>
            </div>
          </CardContent>
        </Card> */}
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <RecentVendorsCard
          vendors={analytics.recentVendors.data}
          isLoading={analytics.recentVendors.isLoading}
          error={analytics.recentVendors.error}
        />

        <OrderStatsCard
          orderStats={
            analytics.orderStats.data || {
              pending: 0,
              processing: 0,
              shipped: 0,
              delivered: 0,
              cancelled: 0,
            }
          }
          isLoading={analytics.orderStats.isLoading}
          error={analytics.orderStats.error}
        />
      </div>

      {/* <div className="grid grid-cols-1 gap-6">
        <TopSellingProductsCard
          products={analytics.topSellingProducts.data}
          isLoading={analytics.topSellingProducts.isLoading}
          error={analytics.topSellingProducts.error}
          showVendor={true}
        />
      </div> */}
    </div>
  );
}

function VendorDashboard() {
  const analytics = useAnalytics("vendor");

  // Replace with actual vendor ID when available
  const vendorId = "vendor-123";

  const pendingOrdersCount = analytics.orderStats.data?.pending || 0;
  const outOfStockCount = analytics.productStats.data?.outOfStock || 0;
  const lowStockCount = analytics.productStats.data?.lowStock || 0;

  return (
    <div className='space-y-6'>
      {(pendingOrdersCount > 0 || outOfStockCount > 0 || lowStockCount > 0) && (
        <Card className='bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800'>
          <CardHeader>
            <div className='flex items-center'>
              <AlertTriangle className='h-5 w-5 text-orange-500 mr-2' />
              <CardTitle className='text-lg font-medium'>
                Attention Required
              </CardTitle>
            </div>
            <CardDescription>Items that need your attention</CardDescription>
          </CardHeader>
          <CardContent className='p-4'>
            <ul className='space-y-3'>
              {pendingOrdersCount > 0 && (
                <li className='flex items-center text-sm'>
                  <CircleAlert className='h-4 w-4 text-blue-600 mr-2' />
                  <span>{pendingOrdersCount} orders awaiting processing</span>
                  <Link
                    href='/dashboard/orders'
                    className='ml-auto text-blue-600'>
                    Process
                  </Link>
                </li>
              )}
              {outOfStockCount > 0 && (
                <li className='flex items-center text-sm'>
                  <CircleAlert className='h-4 w-4 text-red-600 mr-2' />
                  <span>{outOfStockCount} products out of stock</span>
                  <Link
                    href='/dashboard/products'
                    className='ml-auto text-blue-600'>
                    Restock
                  </Link>
                </li>
              )}
              {lowStockCount > 0 && (
                <li className='flex items-center text-sm'>
                  <CircleAlert className='h-4 w-4 text-orange-600 mr-2' />
                  <span>{lowStockCount} products running low on inventory</span>
                  <Link
                    href='/dashboard/products'
                    className='ml-auto text-blue-600'>
                    Check
                  </Link>
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  Total Orders
                </p>
                <p className='text-3xl font-bold'>
                  {analytics.orderStats.data
                    ? Object.values(analytics.orderStats.data).reduce(
                        (a, b) => a + b,
                        0
                      )
                    : 0}
                </p>
              </div>
              <div className='h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center'>
                <ShoppingBag className='h-6 w-6 text-blue-600 dark:text-blue-300' />
              </div>
            </div>
            <div className='mt-4 flex items-center text-sm'>
              <Badge
                variant='outline'
                className='bg-green-100 text-green-800 hover:bg-green-100'>
                +12 this week
              </Badge>
              <Link
                href='/dashboard/orders'
                className='ml-auto flex items-center text-blue-600'>
                View all
                <ChevronRight className='h-4 w-4 ml-1' />
              </Link>
            </div>
          </CardContent>
        </Card>

        <RevenueStatsCard
          totalRevenue={analytics.totalRevenue.data || 0}
          percentChange={8}
          timeFrame='last month'
          isLoading={analytics.totalRevenue.isLoading}
          error={analytics.totalRevenue.error}
        />

        <ProductStatsCard
          productStats={
            analytics.productStats.data || {
              total: 0,
              outOfStock: 0,
              lowStock: 0,
              newThisWeek: 0,
            }
          }
          isLoading={analytics.productStats.isLoading}
          error={analytics.productStats.error}
        />

        {/* <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Store Rating
                </p>
                <p className="text-3xl font-bold">4.8/5</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-300" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Badge
                variant="outline"
                className="bg-blue-100 text-blue-800 hover:bg-blue-100"
              >
                42 new reviews
              </Badge>
            </div>
          </CardContent>
        </Card> */}
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <OrderStatsCard
          orderStats={
            analytics.orderStats.data || {
              pending: 0,
              processing: 0,
              shipped: 0,
              delivered: 0,
              cancelled: 0,
            }
          }
          isLoading={analytics.orderStats.isLoading}
          error={analytics.orderStats.error}
        />

        <TopSellingProductsCard
          products={analytics.topSellingProducts.data}
          isLoading={analytics.topSellingProducts.isLoading}
          error={analytics.topSellingProducts.error}
          showVendor={false}
        />
      </div>
    </div>
  );
}
