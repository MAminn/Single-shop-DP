import { Link } from "#root/components/Link.jsx";
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

import {
  adminDashboardStats,
  recentVendors,
} from "#root/lib/mock-data/vendors";
import type { Vendor } from "#root/lib/mock-data/vendors";
import {
  topProducts as adminTopProducts,
  vendorProducts,
  lowStockItems,
} from "#root/lib/mock-data/products";
import type { Product } from "#root/lib/mock-data/products";
import { orders, orderStatus } from "#root/lib/mock-data/orders";
import type { Order } from "#root/lib/mock-data/orders";
import { vendorDashboardStats } from "#root/lib/mock-data/customers";

export default function Dashboard() {
  const { userRole } = useRole();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground">
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
  const stats = adminDashboardStats;
  const vendorList = recentVendors;
  const topProducts = adminTopProducts;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Vendors
                </p>
                <p className="text-3xl font-bold">{stats.totalVendors}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Store className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Badge
                variant="outline"
                className="bg-green-100 text-green-800 hover:bg-green-100"
              >
                +3 this month
              </Badge>
              <Link
                href="/dashboard/vendors"
                className="ml-auto flex items-center text-blue-600"
              >
                View all
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Products
                </p>
                <p className="text-3xl font-bold">{stats.totalProducts}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <Package className="h-6 w-6 text-purple-600 dark:text-purple-300" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Badge
                variant="outline"
                className="bg-green-100 text-green-800 hover:bg-green-100"
              >
                +189 this month
              </Badge>
              <Link
                href="/dashboard/products"
                className="ml-auto flex items-center text-blue-600"
              >
                View all
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Orders
                </p>
                <p className="text-3xl font-bold">{stats.totalOrders}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-green-600 dark:text-green-300" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Badge
                variant="outline"
                className="bg-green-100 text-green-800 hover:bg-green-100"
              >
                +58 today
              </Badge>
              <Link
                href="/dashboard/orders"
                className="ml-auto flex items-center text-blue-600"
              >
                View all
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </p>
                <p className="text-3xl font-bold">
                  ${(stats.totalRevenue / 1000).toFixed(1)}K
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-orange-600 dark:text-orange-300" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Badge
                variant="outline"
                className="bg-green-100 text-green-800 hover:bg-green-100"
              >
                +12% from last month
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              Recent Vendors
            </CardTitle>
            <CardDescription>
              Latest vendor registrations on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendorList.map((vendor: Vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell className="font-medium">{vendor.name}</TableCell>
                    <TableCell>{vendor.joinDate}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          vendor.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {vendor.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Link
              href="/dashboard/vendors"
              className="flex items-center text-blue-600 text-sm"
            >
              View all vendors
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Order Status</CardTitle>
            <CardDescription>
              Distribution of orders by current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-yellow-400 mr-2"></div>
                    <p>Pending</p>
                  </div>
                  <p className="font-medium">{orderStatus.pending}</p>
                </div>
                <div className="h-2 w-full bg-yellow-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full"
                    style={{
                      width: `${
                        (orderStatus.pending / stats.totalOrders) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-blue-400 mr-2"></div>
                    <p>Processing</p>
                  </div>
                  <p className="font-medium">{orderStatus.processing}</p>
                </div>
                <div className="h-2 w-full bg-blue-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-400 rounded-full"
                    style={{
                      width: `${
                        (orderStatus.processing / stats.totalOrders) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-purple-400 mr-2"></div>
                    <p>Shipped</p>
                  </div>
                  <p className="font-medium">{orderStatus.shipped}</p>
                </div>
                <div className="h-2 w-full bg-purple-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-400 rounded-full"
                    style={{
                      width: `${
                        (orderStatus.shipped / stats.totalOrders) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-green-400 mr-2"></div>
                    <p>Delivered</p>
                  </div>
                  <p className="font-medium">{orderStatus.delivered}</p>
                </div>
                <div className="h-2 w-full bg-green-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-400 rounded-full"
                    style={{
                      width: `${
                        (orderStatus.delivered / stats.totalOrders) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Link
              href="/dashboard/orders"
              className="flex items-center text-blue-600 text-sm"
            >
              View all orders
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </Link>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">
            Top Selling Products
          </CardTitle>
          <CardDescription>
            Best performing products across all vendors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Units Sold</TableHead>
                <TableHead>Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topProducts.map((product: Product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.vendor}</TableCell>
                  <TableCell>{product.sales}</TableCell>
                  <TableCell>${product.revenue}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Link
            href="/dashboard/products"
            className="flex items-center text-blue-600 text-sm"
          >
            View all products
            <ArrowUpRight className="h-4 w-4 ml-1" />
          </Link>
        </CardFooter>
      </Card>

      <Card className="bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800">
        <CardHeader>
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
            <CardTitle className="text-lg font-medium">
              Attention Required
            </CardTitle>
          </div>
          <CardDescription>Items that need your attention</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-center text-sm">
              <CircleAlert className="h-4 w-4 text-yellow-600 mr-2" />
              <span>
                {stats.pendingVendors} new vendor registrations awaiting
                approval
              </span>
              <Link href="/dashboard/vendors" className="ml-auto text-blue-600">
                Review
              </Link>
            </li>
            <li className="flex items-center text-sm">
              <CircleAlert className="h-4 w-4 text-red-600 mr-2" />
              <span>4 products reported for policy violations</span>
              <Link
                href="/dashboard/products"
                className="ml-auto text-blue-600"
              >
                Check
              </Link>
            </li>
            <li className="flex items-center text-sm">
              <CircleAlert className="h-4 w-4 text-orange-600 mr-2" />
              <span>12 customer support tickets awaiting response</span>
              <span className="ml-auto text-blue-600">Respond</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function VendorDashboard() {
  const stats = vendorDashboardStats;
  const recentOrders = orders.slice(0, 4);
  const topProducts = vendorProducts.slice(0, 4);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Processing":
        return "bg-blue-100 text-blue-800";
      case "Shipped":
        return "bg-purple-100 text-purple-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Orders
                </p>
                <p className="text-3xl font-bold">{stats.totalOrders}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Badge
                variant="outline"
                className="bg-green-100 text-green-800 hover:bg-green-100"
              >
                +12 this week
              </Badge>
              <Link
                href="/dashboard/orders"
                className="ml-auto flex items-center text-blue-600"
              >
                View all
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </p>
                <p className="text-3xl font-bold">${stats.totalRevenue}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-300" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Badge
                variant="outline"
                className="bg-green-100 text-green-800 hover:bg-green-100"
              >
                +8% from last month
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Products
                </p>
                <p className="text-3xl font-bold">{stats.totalProducts}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <Package className="h-6 w-6 text-purple-600 dark:text-purple-300" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Badge
                variant="outline"
                className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
              >
                {lowStockItems.length} low in stock
              </Badge>
              <Link
                href="/dashboard/products"
                className="ml-auto flex items-center text-blue-600"
              >
                Manage
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Customers
                </p>
                <p className="text-3xl font-bold">{stats.totalCustomers}</p>
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
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-muted-foreground mr-2" />
              <CardTitle className="text-lg font-medium">
                Recent Orders
              </CardTitle>
            </div>
            <CardDescription>Latest customer purchases</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order: Order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStatusColor(order.status)}
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{order.total}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Link
              href="/dashboard/orders"
              className="flex items-center text-blue-600 text-sm"
            >
              View all orders
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </Link>
          </CardFooter>
        </Card>

        <Card className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
          <CardHeader>
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <CardTitle className="text-lg font-medium">
                Low Stock Alerts
              </CardTitle>
            </div>
            <CardDescription>
              Products that need to be restocked soon
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockItems.map((item: Product) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell>
                      <span className="font-medium text-red-600">
                        {item.stock}
                      </span>{" "}
                      / {item.threshold}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-red-100 text-red-800"
                      >
                        Low Stock
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="border-t border-red-200 dark:border-red-800 px-6 py-4">
            <Link
              href="/dashboard/products"
              className="flex items-center text-blue-600 text-sm"
            >
              Manage inventory
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </Link>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center">
            <BarChart3 className="h-5 w-5 text-muted-foreground mr-2" />
            <CardTitle className="text-lg font-medium">
              Top Selling Products
            </CardTitle>
          </div>
          <CardDescription>
            Your best performing products this month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Units Sold</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topProducts.map((product: Product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.sold}</TableCell>
                  <TableCell
                    className={
                      product.stock < 5 ? "text-red-600 font-medium" : ""
                    }
                  >
                    {product.stock}
                  </TableCell>
                  <TableCell>${product.revenue}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Link
            href="/dashboard/products"
            className="flex items-center text-blue-600 text-sm"
          >
            View all products
            <ArrowUpRight className="h-4 w-4 ml-1" />
          </Link>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
          <CardDescription>
            Common tasks you might want to perform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              asChild
              variant="outline"
              className="h-auto py-4 flex flex-col items-center justify-center"
            >
              <Link href="/dashboard/products/create">
                <Package className="h-10 w-10 mb-2" />
                <span className="text-base font-medium">Products</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-auto py-4 flex flex-col items-center justify-center"
            >
              <Link href="/dashboard/categories">
                <Grid className="h-10 w-10 mb-2" />
                <span className="text-base font-medium">Categories</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-auto py-4 flex flex-col items-center justify-center"
            >
              <Link href="/dashboard/orders">
                <Truck className="h-10 w-10 mb-2" />
                <span className="text-base font-medium">Orders</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-auto py-4 flex flex-col items-center justify-center"
            >
              <Link href="/dashboard/products">
                <PackageOpen className="h-10 w-10 mb-2" />
                <span className="text-base font-medium">Inventory</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
