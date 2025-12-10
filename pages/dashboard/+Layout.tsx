import { DashboardSidebar } from "#root/components/dashboard/DashboardSidebar";
import { Link } from "#root/components/utils/Link";
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
import { HomeIcon, Home, Menu } from "lucide-react";
import logoImage from "#root/assets/Lebsy-Logo-Light.webp";

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
  const { userRole } = useRole();

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
    if (pathname.includes("/dashboard/admin/templates")) {
      return "templates";
    }
    return "overview";
  };

  const activeTab = getActiveTab();

  const tabs = [
    {
      label: "Overview",
      href: "/dashboard",
    },
    ...(userRole === "admin"
      ? [
          {
            label: "Vendors",
            href: "/dashboard/vendors",
          },
          {
            label: "Categories",
            href: "/dashboard/categories",
          },
          {
            label: "Templates",
            href: "/dashboard/admin/templates",
          },
        ]
      : []),
    {
      label: "Products",
      href: "/dashboard/products",
    },
    {
      label: "Orders",
      href: "/dashboard/orders",
    },
  ];

  return (
    <main className='flex-1 w-full h-full'>
      <SidebarProvider>
        <div className='flex w-full h-full'>
          <DashboardSidebar />
          <section className='h-full w-full flex-1'>
            <header className='z-50 flex flex-col bg-neutral-100 dark:bg-neutral-900 w-full p-1 sticky top-0'>
              <div className='flex items-center justify-between w-full px-4'>
                <div className='flex items-center'>
                  <SidebarTrigger />
                  <Tabs className='ml-4 hidden lg:flex ' value={activeTab}>
                    <TabsList>
                      {tabs.map((tab) => (
                        <TabsTrigger
                          key={tab.href}
                          value={tab.href.split("/").pop() || ""}
                          asChild>
                          <Link href={tab.href}>{tab.label}</Link>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>
                <Link href='/' className='text-3xl font-bold '>
                  <img
                    src={logoImage}
                    alt=''
                    className=' w-[100px] py-2 lg:hidden'
                  />
                </Link>
                <div className='flex items-center gap-2'>
                  <Link href='/'>
                    <Button variant='outline' className='hidden lg:block'>
                      Return to Home
                    </Button>
                    <Button variant='outline' className='block lg:hidden'>
                      <HomeIcon />
                    </Button>
                  </Link>
                </div>
              </div>
              {userRole === "admin" && (
                <div className='bg-blue-50 dark:bg-blue-900 p-2 text-sm'>
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
