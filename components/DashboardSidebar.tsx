import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Settings,
  Store,
  UserPlus,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "#root/components/ui/sidebar";
import { Link } from "./Link";

export function DashboardSidebar() {
  const { state, open, setOpen, openMobile, setOpenMobile, toggleSidebar } =
    useSidebar();

  const sideBarItems = [
    {
      label: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Orders",
      href: "/dashboard/orders",
      icon: ShoppingCart,
    },
    {
      label: "Categories",
      href: "/dashboard/categories",
      icon: Package,
    },
    {
      label: "Products",
      href: "/dashboard/products",
      icon: Package,
    },
    {
      label: "Customers",
      href: "/dashboard/customers",
      icon: Users,
    },
    {
      label: "Stores",
      href: "/dashboard/stores",
      icon: Store,
    },
    {
      label: "Users",
      href: "/dashboard/users",
      icon: UserPlus,
    },
    {
      label: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex justify-between">
        <h1 className="font-bold text-lg group-data-[state=collapsed]:text-center">
          D<span className="group-data-[state=collapsed]:hidden">ashboard</span>
        </h1>
        <SidebarTrigger className="block md:hidden" />
      </SidebarHeader>
      <SidebarContent>
        {/* Navigation Links */}
        <SidebarMenu className=" pt-11">
          {sideBarItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link
                href={item.href}
                className="group-data-[state=collapsed]:flex group-data-[state=collapsed]:justify-center"
                onClick={() => toggleSidebar()}
              >
                <SidebarMenuButton>
                  <item.icon className="w-4 h-4" />
                  <span className="group-data-[state=collapsed]:hidden">
                    {item.label}
                  </span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
