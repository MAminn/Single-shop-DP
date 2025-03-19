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
          <SidebarMenuItem>
            <Link
              href="/dashboard"
              className="group-data-[state=collapsed]:flex group-data-[state=collapsed]:justify-center"
              onClick={() => toggleSidebar()}
            >
              <SidebarMenuButton>
                <LayoutDashboard className="w-4 h-4 " />
                <span className="group-data-[state=collapsed]:hidden">
                  Overview
                </span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link
              className="group-data-[state=collapsed]:flex group-data-[state=collapsed]:justify-center"
              href="/dashboard/orders"
              onClick={() => toggleSidebar()}
            >
              <SidebarMenuButton>
                <ShoppingCart className="w-4 h-4" />
                <span className="group-data-[state=collapsed]:hidden">
                  Orders
                </span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link
              className="group-data-[state=collapsed]:flex group-data-[state=collapsed]:justify-center"
              href="/dashboard/products"
              onClick={() => toggleSidebar()}
            >
              <SidebarMenuButton>
                <Package className="w-4 h-4" />
                <span className="group-data-[state=collapsed]:hidden">
                  Products
                </span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link
              className="group-data-[state=collapsed]:flex group-data-[state=collapsed]:justify-center"
              href="/dashboard/customers"
              onClick={() => toggleSidebar()}
            >
              <SidebarMenuButton>
                <Users className="w-4 h-4" />
                <span className="group-data-[state=collapsed]:hidden">
                  Customers
                </span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link
              className="group-data-[state=collapsed]:flex group-data-[state=collapsed]:justify-center"
              href="/dashboard/stores"
              onClick={() => toggleSidebar()}
            >
              <SidebarMenuButton>
                <Store className="w-4 h-4" />
                <span className="group-data-[state=collapsed]:hidden">
                  Stores
                </span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link
              className="group-data-[state=collapsed]:flex group-data-[state=collapsed]:justify-center"
              href="/dashboard/users"
              onClick={() => toggleSidebar()}
            >
              <SidebarMenuButton>
                <UserPlus className="w-4 h-4" />
                <span className="group-data-[state=collapsed]:hidden">
                  Users
                </span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link
              className="group-data-[state=collapsed]:flex group-data-[state=collapsed]:justify-center"
              href="/dashboard/settings"
              onClick={() => toggleSidebar()}
            >
              <SidebarMenuButton>
                <Settings className="w-4 h-4" />
                <span className="group-data-[state=collapsed]:hidden">
                  Settings
                </span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}

// <SidebarFooter>
//         {/* Account Dropdown */}
//         <SidebarMenu>
//           <SidebarMenuItem>
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <SidebarMenuButton>
//                   <User2 className="w-4 h-4" />
//                   <span className="group-data-[state=collapsed]:hidden">
//                     Account
//                   </span>
//                   <ChevronUp className="ml-auto w-4 h-4" />
//                 </SidebarMenuButton>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent
//                 side="top"
//                 className="w-[--radix-popper-anchor-width]"
//               >
//                 <DropdownMenuItem asChild>
//                   <form className="w-full" action="/logout" method="post">
//                     <button type="submit" className="w-full">
//                       Logout
//                     </button>
//                   </form>
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </SidebarMenuItem>
//         </SidebarMenu>
//       </SidebarFooter>
