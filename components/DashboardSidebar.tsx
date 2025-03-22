import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Settings,
  Store,
  UserPlus,
  LayoutGrid,
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

export function DashboardSidebar() {
  const { state, open, setOpen, openMobile, setOpenMobile, toggleSidebar } =
    useSidebar();

  const [userRole, setUserRole] = useState<"admin" | "vendor">("vendor");

  useEffect(() => {
    const savedRole = localStorage.getItem("userRole");
    if (savedRole && (savedRole === "admin" || savedRole === "vendor")) {
      setUserRole(savedRole as "admin" | "vendor");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("userRole", userRole);
  }, [userRole]);

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
  ];

  const vendorSidebarItems = [
    {
      label: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
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
  ];

  const sideBarItems =
    userRole === "admin" ? adminSidebarItems : vendorSidebarItems;

  const toggleRole = () => {
    setUserRole(userRole === "admin" ? "vendor" : "admin");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex justify-between">
        <h1 className="font-bold text-lg group-data-[state=collapsed]:text-center">
          D<span className="group-data-[state=collapsed]:hidden">ashboard</span>
        </h1>
        <SidebarTrigger className="block md:hidden" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="pt-6">
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

        <div className={`mt-6 px-4 ${state === "collapsed" ? "hidden" : ""}`}>
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={toggleRole}
          >
            {state === "collapsed"
              ? userRole === "admin"
                ? "A"
                : "V"
              : userRole === "admin"
              ? "Switch to Vendor"
              : "Switch to Admin"}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
