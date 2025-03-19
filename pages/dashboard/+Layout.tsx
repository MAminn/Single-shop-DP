import { DashboardSidebar } from "#root/components/DashboardSidebar.jsx";
import { Link } from "#root/components/Link.jsx";
import { Button } from "#root/components/ui/button.jsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#root/components/ui/card.jsx";
import {
  SidebarProvider,
  SidebarTrigger,
} from "#root/components/ui/sidebar.jsx";
import { Tabs, TabsList, TabsTrigger } from "#root/components/ui/tabs.jsx";
import { usePageContext } from "vike-react/usePageContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Content>{children}</Content>;
}

function Content({ children }: { children: React.ReactNode }) {
  const pageContest = usePageContext();
  const pathname = pageContest.urlPathname;

  const getActiveTab = () => {
    if (pathname === "/dashboard" || pathname === "/dashboard/overview") {
      return "overview";
    }
    if (pathname === "/dashboard/orders") {
      return "orders";
    }
    if (pathname === "/dashboard/products") {
      return "products";
    }
    if (pathname === "/dashboard/customers") {
      return "customers";
    }
    if (pathname === "/dashboard/stores") {
      return "stores";
    }
    if (pathname === "/dashboard/users") {
      return "users";
    }
    if (pathname === "/dashboard/settings") {
      return "settings";
    }
    return "overview";
  };

  const activeTab = getActiveTab();

  return (
    <main className="flex-1">
      <SidebarProvider>
        <div className="flex w-full">
          <DashboardSidebar />
          <section className="h-full flex-1">
            <header className="flex bg-neutral-100 dark:bg-neutral-900 w-full p-1 sticky top-0">
              <SidebarTrigger />
              <Tabs className="ml-4 hidden md:flex" value={activeTab}>
                <TabsList>
                  <TabsTrigger value="overview" asChild>
                    <Link href="/dashboard">Overview</Link>
                  </TabsTrigger>
                  <TabsTrigger value="orders" asChild>
                    <Link href="/dashboard/orders">Orders</Link>
                  </TabsTrigger>
                  <TabsTrigger value="products" asChild>
                    <Link href="/dashboard/products">Products</Link>
                  </TabsTrigger>
                  <TabsTrigger value="customers" asChild>
                    <Link href="/dashboard/customers">Customers</Link>
                  </TabsTrigger>
                  <TabsTrigger value="stores" asChild>
                    <Link href="/dashboard/stores">Stores</Link>
                  </TabsTrigger>
                  <TabsTrigger value="users" asChild>
                    <Link href="/dashboard/users">Users</Link>
                  </TabsTrigger>
                  <TabsTrigger value="settings" asChild>
                    <Link href="/dashboard/settings">Settings</Link>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </header>

            {children}
          </section>
        </div>
      </SidebarProvider>
    </main>
  );
}
