import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarTrigger,
} from "#root/components/ui/sidebar";
import { Button } from "#root/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Link } from "./Link";

export function AppSidebar() {
  const [isMenOpen, setIsMenOpen] = useState(false);
  const [isWomenOpen, setIsWomenOpen] = useState(false);

  const menCategories = [
    { label: "Shirts", to: "/featured/men/categories/shirts" },
    { label: "T-Shirts", to: "/featured/men/categories/t-shirts" },
    {
      label: "Sweaters & Hoodies",
      to: "/featured/men/categories/sweaters-hoodies",
    },
    { label: "Pants", to: "/featured/men/categories/pants" },
    { label: "Accessories", to: "/featured/men/categories/accessories" },
    { label: "Shorts", to: "/featured/men/categories/shorts" },
    { label: "Jackets", to: "/featured/men/categories/jackets" },
    { label: "Shoes", to: "/featured/men/categories/shoes" },
  ];

  const womenCategories = [
    { label: "Accessories", to: "/featured/women/categories/accessories" },
    { label: "Blouses", to: "/featured/women/categories/blouses" },
    { label: "Body Suits", to: "/featured/women/categories/body-suits" },
    { label: "Dresses", to: "/featured/women/categories/dresses" },
    { label: "Hoodies", to: "/featured/women/categories/hoodies" },
    { label: "Jackets", to: "/featured/women/categories/jackets" },
    { label: "Pants", to: "/featured/women/categories/pants" },
    { label: "Shirts", to: "/featured/women/categories/shirts" },
    { label: "Shoes", to: "/featured/women/categories/shoes" },
    { label: "Shorts", to: "/featured/women/categories/shorts" },
    { label: "Skirts", to: "/featured/women/categories/skirts" },
    { label: "T-Shirts", to: "/featured/women/categories/t-shirts" },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <h2 className="text-xl font-semibold p-4">Categories</h2>
      </SidebarHeader>
      <SidebarContent>
        {/* Featured Section */}
        <SidebarGroup>
          <Link href="/featured">
            <Button variant="ghost" className="w-full justify-start">
              Featured
            </Button>
          </Link>
        </SidebarGroup>

        {/* Men Section */}
        <SidebarGroup>
          <Button
            variant="ghost"
            className="w-full justify-between"
            onClick={() => setIsMenOpen(!isMenOpen)}
          >
            Men
            {isMenOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>
          {isMenOpen && (
            <div className="pl-4">
              {menCategories.map((category) => (
                <Link key={category.label} href={category.to}>
                  <Button variant="ghost" className="w-full justify-start">
                    {category.label}
                  </Button>
                </Link>
              ))}
            </div>
          )}
        </SidebarGroup>

        {/* Women Section */}
        <SidebarGroup>
          <Button
            variant="ghost"
            className="w-full justify-between"
            onClick={() => setIsWomenOpen(!isWomenOpen)}
          >
            Women
            {isWomenOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>
          {isWomenOpen && (
            <div className="pl-4">
              {womenCategories.map((category) => (
                <Link key={category.label} href={category.to}>
                  <Button variant="ghost" className="w-full justify-start">
                    {category.label}
                  </Button>
                </Link>
              ))}
            </div>
          )}
        </SidebarGroup>
      </SidebarContent>
      <SidebarTrigger className=" w-[95%] flex justify-end">
        <Button variant="ghost" className="w-full justify-end">
          Close
        </Button>
      </SidebarTrigger>
    </Sidebar>
  );
}
