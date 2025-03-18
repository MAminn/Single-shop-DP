import { Link } from "#root/components/Link.jsx";
import { Button } from "#root/components/ui/button.jsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#root/components/ui/card.jsx";

export default function Dashboard() {
  return (
    <main className="flex-1">
      <div className="flex w-full">
        <section className="h-full flex-1">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Welcome to Your Dashboard</CardTitle>
                <CardDescription>
                  Here's a quick overview of your eCommerce website. Manage your
                  store, track performance, and stay updated with recent
                  activity.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button asChild variant="outline" className="h-24">
                    <Link href="/dashboard/orders">
                      <div className="text-center">
                        <p className="text-lg font-semibold">Orders</p>
                        <p className="text-sm text-muted-foreground">
                          Manage and track orders
                        </p>
                      </div>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-24">
                    <Link href="/dashboard/products">
                      <div className="text-center">
                        <p className="text-lg font-semibold">Products</p>
                        <p className="text-sm text-muted-foreground">
                          Add or update products
                        </p>
                      </div>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-24">
                    <Link href="/dashboard/customers">
                      <div className="text-center">
                        <p className="text-lg font-semibold">Customers</p>
                        <p className="text-sm text-muted-foreground">
                          View customer details
                        </p>
                      </div>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-24">
                    <Link href="/dashboard/settings">
                      <div className="text-center">
                        <p className="text-lg font-semibold">Settings</p>
                        <p className="text-sm text-muted-foreground">
                          Configure your store
                        </p>
                      </div>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
                <CardDescription>
                  Track the performance of your store with these key metrics.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold">Total Sales</h3>
                    <p className="text-2xl">$12,345</p>
                  </div>
                  <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold">Total Orders</h3>
                    <p className="text-2xl">1,234</p>
                  </div>
                  <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold">Total Customers</h3>
                    <p className="text-2xl">567</p>
                  </div>
                  <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold">Total Products</h3>
                    <p className="text-2xl">89</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Stay updated with the latest activities in your store.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p>New order #1234 placed by John Doe</p>
                    <p className="text-sm text-muted-foreground">2 hours ago</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p>Product "Blue T-Shirt" was updated</p>
                    <p className="text-sm text-muted-foreground">5 hours ago</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p>New customer Jane Smith registered</p>
                    <p className="text-sm text-muted-foreground">1 day ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}
