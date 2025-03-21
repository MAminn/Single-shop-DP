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

  const tabs = [
    {
      label: "Overview",
      href: "/dashboard",
    },
    {
      label: "Orders",
      href: "/dashboard/orders",
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
      label: "Customers",
      href: "/dashboard/customers",
    },
    {
      label: "Stores",
      href: "/dashboard/stores",
    },
    {
      label: "Users",
      href: "/dashboard/users",
    },
    {
      label: "Settings",
      href: "/dashboard/settings",
    },
  ];

  return (
    <main className="flex-1">
      <SidebarProvider>
        <div className="flex w-full">
          <DashboardSidebar />
          <section className="h-full flex-1">
            <header className="flex bg-neutral-100 dark:bg-neutral-900 w-full p-1 sticky top-0">
              <SidebarTrigger />
              <Tabs className="ml-4 hidden lg:flex" value={activeTab}>
                <TabsList>
                  {tabs.map((tab) => (
                    <TabsTrigger key={tab.href} value={tab.href} asChild>
                      <Link href={tab.href}>{tab.label}</Link>
                    </TabsTrigger>
                  ))}
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
