import type React from "react";
import { useContext, useEffect, useState } from "react";
import { Button } from "#root/components/ui/button";
import { Menu, ShoppingCart, Globe, User } from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
  SheetFooter,
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
import logoImage from "#root/assets/Lebsy-Logo-Light.webp";
import { AuthContext } from "#root/context/AuthContext.js";
import { useCart } from "#root/lib/context/CartContext";
import { trpc } from "#root/shared/trpc/client";
import { toast } from "sonner";

interface NavbarProps {
  lang: string;
  logoUrl?: string;
  sheetDescription?: string;
}

const Navbar: React.FC<NavbarProps> = ({
  lang = "en",
  sheetDescription = "Navigation menu",
  logoUrl = "",
}: NavbarProps) => {
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);
  const [subcategories, setSubcategories] = useState<
    {
      id: string;
      name: string;
      slug: string;
      filename: string | null;
      type: "men" | "women";
    }[]
  >([]);

  useEffect(() => {
    trpc.category.view.query().then((res) => {
      if (!res.success) {
        toast.error(res.error);
        return;
      }

      setSubcategories(res.result);
    });
  }, []);

  const { totalItems } = useCart();

  const handleCloseSheet = () => setIsSheetOpen(false);

  const { session, logout } = useContext(AuthContext);

  const logLinks = [
    { label: "Login", to: "/login" },
    { label: "Register", to: "/register" },
  ];

  const navLinks = {
    en: [
      {
        label: "Men",
        to: "/featured/men",
        subLinks: subcategories
          .filter((s) => s.type === "men")
          .map((s) => ({
            label: s.name,
            to: `/featured/men/categories/${s.id}`,
          })),
      },
      {
        label: "Women",
        to: "/featured/women",
        subLinks: subcategories
          .filter((s) => s.type === "women")
          .map((s) => ({
            label: s.name,
            to: `/featured/women/categories/${s.id}`,
          })),
      },
      {
        label: "Brands",
        to: "/featured/brands",
      },
      { label: "Become a vendor!", to: "/vendor" },
    ],
    ar: [
      {
        label: "رجال",
        to: "/man",
        subLinks: [
          {
            label: "شيرتات",
            to: "",
          },
          {
            label: "تي شيرت",
            to: "",
          },
          {
            label: "سويترز و هودي",
            to: "",
          },
          {
            label: "بنطلونات",
            to: "",
          },
          {
            label: "اكسسوارات",
            to: "",
          },
          {
            label: "شورتات",
            to: "",
          },
          {
            label: "جاكيت",
            to: "",
          },
          {
            label: "احذية",
            to: "",
          },
        ],
      },
    ],
  };

  const links = lang === "en" || lang === "ar" ? navLinks[lang] : [];

  return (
    <nav className=" shadow-md sticky w-full py-2 lg:py-6 top-0 z-[10000] bg-white">
      <div className="px-4 flex text-sm lg:text-base items-center justify-between min-h-16 max-w-7xl mx-auto">
        <div className="flex items-center gap-8 lg:order-1 order-2">
          <Link href="/" className="text-3xl font-bold ">
            <img src={logoImage} alt="" className="md:w-[150px] w-[100px]" />
          </Link>

          <div className="hidden lg:flex gap-6 ">
            <NavigationMenu>
              <NavigationMenuList>
                {links.map((link) => (
                  <NavigationMenuItem key={link.to} className="relative  ">
                    {link.subLinks ? (
                      <>
                        <NavigationMenuItem asChild className=" navLink ">
                          <Link href={link.to}>{link.label}</Link>
                        </NavigationMenuItem>
                        {/* <NavigationMenuContent className="absolute mt-10 bg-gray-100 text-black rounded-2xl">
                          <ul className="grid gap-3 p-4 w-[200px]">
                            {link.subLinks.map((subLink) => (
                              <li key={subLink.to}>
                                <NavigationMenuLink className="  navLink">
                                  <Link href={subLink.to} className="block ">
                                    {subLink.label}
                                  </Link>
                                </NavigationMenuLink>
                              </li>
                            ))}
                          </ul>
                        </NavigationMenuContent> */}
                      </>
                    ) : (
                      <NavigationMenuLink asChild>
                        <Link href={link.to} className="navLink">
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
        <div className="flex items-center gap-4 lg:order-2 order-1">
          <div className=" hidden lg:flex justify-center items-center gap-2">
            {!session ? (
              logLinks.map((link) => (
                <Link key={link.to} href={link.to} className="navLink">
                  {link.label}
                </Link>
              ))
            ) : (
              <>
                <button onClick={logout} type="submit" className="navLink">
                  Logout
                </button>
                {session.role === "vendor" ||
                  (session.role === "admin" && (
                    <Link href="/dashboard" className="navLink">
                      Dashboard
                    </Link>
                  ))}
              </>
            )}
          </div>

          <div className="flex lg:hidden">
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
              <SheetContent side="left" className="w-64 bg-white p-0">
                <div className="flex flex-col h-full">
                  {/* Logo at the top */}
                  <div className="p-4 border-b w-full flex justify-center">
                    <Link href="/" onClick={handleCloseSheet}>
                      <img src={logoImage} alt="Lebsey" className="w-[120px]" />
                    </Link>
                  </div>

                  {/* Main navigation links */}
                  <div className="p-6 flex-1">
                    <div className="flex flex-col gap-6 mb-8">
                      {links.slice(0, 3).map((link) => (
                        <Link
                          key={link.to}
                          href={link.to}
                          className="text-lg font-medium text-gray-800 hover:text-accent-lb"
                          onClick={handleCloseSheet}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>

                    {/* Vendor link and dashboard/logout if logged in */}
                    {session && (
                      <div className="border-t pt-6 mb-6">
                        <Link
                          href="/dashboard"
                          className="text-lg font-medium text-gray-800 hover:text-accent-lb block mb-4"
                          onClick={handleCloseSheet}
                        >
                          Dashboard
                        </Link>
                        <button
                          onClick={() => {
                            logout();
                            handleCloseSheet();
                          }}
                          className="text-lg font-medium text-gray-800 hover:text-accent-lb"
                          type="button"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Footer section with become vendor and company name */}
                  <div className="mt-auto border-t p-6">
                    <Link
                      href="/vendor"
                      className="text-lg font-medium text-accent-lb hover:underline block mb-2"
                      onClick={handleCloseSheet}
                    >
                      Become a vendor!
                    </Link>
                    <p className="text-sm text-gray-500">Lebsey LLC</p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex items-center gap-2 order-3">
          {/* Login/User icon only on mobile */}
          {!session ? (
            <Button
              variant="ghost"
              size="icon"
              className="hover:text-gray-700 hover:bg-gray-100 lg:hidden"
              asChild
            >
              <Link href="/login">
                <User size={20} />
              </Link>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="hover:text-gray-700 hover:bg-gray-100 lg:hidden"
              asChild
            >
              <Link href="/dashboard">
                <User size={20} />
              </Link>
            </Button>
          )}

          {/* Cart button */}
          <Button
            variant="ghost"
            size="icon"
            className="hover:text-gray-700 hover:bg-gray-100"
            asChild
          >
            <Link href="/cart" className="relative">
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-1 text-xs font-bold leading-none transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
