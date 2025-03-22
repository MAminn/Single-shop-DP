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
import { RoleProvider, useRole } from "#root/lib/context/RoleContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleProvider>
      <Content>{children}</Content>
    </RoleProvider>
  );
}

function Content({ children }: { children: React.ReactNode }) {
  const pageContext = usePageContext();
  const pathname = pageContext.urlPathname;
  const { userRole, toggleRole } = useRole();

  const getActiveTab = () => {
    if (pathname === "/dashboard" || pathname === "/dashboard/overview") {
      return "overview";
    }
    if (pathname.includes("/dashboard/orders")) {
      return "orders";
    }
    if (pathname.includes("/dashboard/categories")) {
      return "categories";
    }
    if (pathname.includes("/dashboard/products")) {
      return "products";
    }
    if (pathname.includes("/dashboard/vendors")) {
      return "vendors";
    }
    return "overview";
  };

  const activeTab = getActiveTab();

  const adminTabs = [
    {
      label: "Overview",
      href: "/dashboard",
    },
    {
      label: "Vendors",
      href: "/dashboard/vendors",
    },
    {
      label: "Categories",
      href: "/dashboard/categories",
    },
    {
      label: "Products",
      href: "/dashboard/products",
    },
    {
      label: "Orders",
      href: "/dashboard/orders",
    },
  ];

  const vendorTabs = [
    {
      label: "Overview",
      href: "/dashboard",
    },
    {
      label: "Products",
      href: "/dashboard/products",
    },
    {
      label: "Orders",
      href: "/dashboard/orders",
    },
  ];

  const tabs = userRole === "admin" ? adminTabs : vendorTabs;

  return (
    <main className="flex-1">
      <SidebarProvider>
        <div className="flex w-full">
          <DashboardSidebar />
          <section className="h-full flex-1">
            <header className="flex flex-col bg-neutral-100 dark:bg-neutral-900 w-full p-1 sticky top-0">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <SidebarTrigger />
                  <Tabs className="ml-4 hidden lg:flex" value={activeTab}>
                    <TabsList>
                      {tabs.map((tab) => (
                        <TabsTrigger
                          key={tab.href}
                          value={tab.href.split("/").pop() || ""}
                          asChild
                        >
                          <Link href={tab.href}>{tab.label}</Link>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>
                <div className="mr-4">
                  <Button variant="outline" size="sm" onClick={toggleRole}>
                    {userRole === "admin"
                      ? "Switch to Vendor View"
                      : "Switch to Admin View"}
                  </Button>
                </div>
              </div>
              {userRole === "admin" && (
                <div className="bg-blue-50 dark:bg-blue-900 p-2 text-sm">
                  <strong>Admin Mode:</strong> You have full access to all
                  vendors, products, categories, and orders.
                </div>
              )}
            </header>

            {children}
          </section>
        </div>
      </SidebarProvider>
    </main>
  );
}
