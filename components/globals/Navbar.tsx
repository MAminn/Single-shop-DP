import type React from "react";
import { useState } from "react";
import { Button } from "#root/components/ui/button";
import { Menu, ShoppingCart, Globe } from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "#root/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from "#root/components/ui/navigation-menu";
import { Link } from "../Link";
import logoImage from "#root/assets/Lebsy-Logo-Light.svg";

interface NavLink {
  label: string;
  to: string;
  subLinks?: NavLink[];
}

interface NavbarProps {
  navLinks?: NavLink[];
  logoUrl?: string;
  cartItemCount?: number;
  sheetDescription?: string;
}

const Navbar: React.FC<NavbarProps> = ({
  navLinks = [
    {
      label: "Men",
      to: "/man",
      subLinks: [
        { label: "New Arrivals", to: "/man/new-arrivals" },
        { label: "Clothing", to: "/man/clothing" },
        { label: "Accessories", to: "/man/accessories" },
      ],
    },
    {
      label: "Women",
      to: "/women",
      subLinks: [
        { label: "New Arrivals", to: "/women/new-arrivals" },
        { label: "Clothing", to: "/women/clothing" },
        { label: "Accessories", to: "/women/accessories" },
      ],
    },
    { label: "Become a vendor!", to: "/vendor" },
  ],
  cartItemCount = 0,
  sheetDescription = "Navigation menu",
  logoUrl = "",
}) => {
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);

  const handleCloseSheet = () => setIsSheetOpen(false);

  return (
    <nav className=" shadow-md sticky py-6 top-0 z-10 bg-background">
      <div className="px-4 flex items-center justify-between min-h-16 max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-3xl font-bold ">
            <img src={logoImage} alt="" className="md:w-[150px] w-[100px]" />
          </Link>

          <div className="hidden md:flex gap-6 ">
            <NavigationMenu>
              <NavigationMenuList>
                {navLinks.map((link) => (
                  <NavigationMenuItem key={link.to} className="relative  ">
                    {link.subLinks ? (
                      <>
                        <NavigationMenuTrigger className=" transition-all duration-300 ">
                          {link.label}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent className="absolute mt-10 bg-foreground rounded-2xl">
                          <ul className="grid gap-3 p-4 w-[200px]">
                            {link.subLinks.map((subLink) => (
                              <li key={subLink.to}>
                                <NavigationMenuLink className="  text-white">
                                  <Link href={subLink.to} className="block ">
                                    {subLink.label}
                                  </Link>
                                </NavigationMenuLink>
                              </li>
                            ))}
                          </ul>
                        </NavigationMenuContent>
                      </>
                    ) : (
                      <NavigationMenuLink asChild>
                        <Link
                          href={link.to}
                          className="text-gray-700 hover:text-gray-900"
                        >
                          {link.label}
                        </Link>
                      </NavigationMenuLink>
                    )}
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="hover:text-gray-700 hover:bg-gray-100"
          >
            <Globe size={20} className="" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="hover:text-gray-700 hover:bg-gray-100"
            asChild
          >
            <Link href="/cart" className="relative">
              <ShoppingCart size={20} />
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-1 text-xs font-bold leading-none transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white rounded-full">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </Button>

          <div className="flex md:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-700 hover:bg-gray-100"
                >
                  <Menu size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 bg-white">
                <SheetTitle className="sr-only">Navigation menu</SheetTitle>
                <SheetDescription className="sr-only">
                  {sheetDescription}
                </SheetDescription>

                <div className="p-4 h-full">
                  <nav className="space-y-4 flex flex-col justify-center items-center h-full">
                    {navLinks.map((link) => (
                      <Link
                        key={link.to}
                        href={link.to}
                        className="block text-lg text-gray-700 hover:text-gray-900"
                        onClick={handleCloseSheet}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
