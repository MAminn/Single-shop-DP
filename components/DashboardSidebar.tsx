import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Settings,
  Store,
  UserPlus,
  LayoutGrid,
  TicketPercent,
  Palette,
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
import { Button } from "#root/components/ui/button";
import { useRole } from "#root/lib/context/RoleContext";

export function DashboardSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const { userRole } = useRole();

  const adminSidebarItems = [
    {
      label: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Vendors",
      href: "/dashboard/vendors",
      icon: Store,
    },
    {
      label: "Categories",
      href: "/dashboard/categories",
      icon: LayoutGrid,
    },
    {
      label: "Products",
      href: "/dashboard/products",
      icon: Package,
    },
    {
      label: "Orders",
      href: "/dashboard/orders",
      icon: ShoppingCart,
    },
    {
      label: "Promo Codes",
      href: "/dashboard/promo-codes",
      icon: TicketPercent,
    },
    {
      label: "Templates",
      href: "/dashboard/admin/templates",
      icon: Palette,
    },
  ];

  const vendorSidebarItems = [
    {
      label: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Products",
      href: "/dashboard/products",
      icon: Package,
    },
    {
      label: "Orders",
      href: "/dashboard/orders",
      icon: ShoppingCart,
    },
  ];

  const sideBarItems =
    userRole === "admin" ? adminSidebarItems : vendorSidebarItems;

  return (
    <Sidebar collapsible="icon" className="h-full border-none">
      <SidebarHeader className="flex justify-between">
        <h1 className="font-bold text-lg group-data-[state=collapsed]:w-full group-data-[state=collapsed]:text-center group-data-[state=collapsed]:py-0 group-data-[state=collapsed]:px-0 py-2 px-3 ">
          D<span className="group-data-[state=collapsed]:hidden">ashboard</span>
        </h1>
        <SidebarTrigger className="block md:hidden" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="pt-6">
          {sideBarItems.map((item) => (
            <SidebarMenuItem key={item.href} className="py-2 px-3">
              <Link
                href={item.href}
                className="group-data-[state=collapsed]:flex group-data-[state=collapsed]:justify-center"
                onClick={() => toggleSidebar()}
              >
                <SidebarMenuButton className="group-data-[state=collapsed]:flex group-data-[state=collapsed]:items-center group-data-[state=collapsed]:justify-center">
                  <item.icon className="w-4 h-4  " />
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
