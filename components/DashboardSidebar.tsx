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
} from "#root/components/ui/sidebar";
import { Link } from "./Link";

export function DashboardSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <h1 className="font-bold text-lg group-data-[state=collapsed]:text-center">
          D<span className="group-data-[state=collapsed]:hidden">ashboard</span>
        </h1>
      </SidebarHeader>
      <SidebarContent>
        {/* Navigation Links */}
        <SidebarMenu className=" pt-11">
          <SidebarMenuItem>
            <Link
              href="/dashboard"
              className="group-data-[state=collapsed]:flex group-data-[state=collapsed]:justify-center"
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
