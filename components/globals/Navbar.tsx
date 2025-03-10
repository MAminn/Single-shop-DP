import type React from "react";
import { useState } from "react";
import { Button } from "#root/components/ui/button";
import { Menu, ShoppingCart, Globe } from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
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
import type { ClientSession } from "#root/backend/auth/shared/entities.js";

interface NavbarProps {
  lang: string;
  session?: ClientSession | null;
  logoUrl?: string;
  cartItemCount?: number;
  sheetDescription?: string;
  onLogOut?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  lang = "en",
  session,
  cartItemCount = 0,
  sheetDescription = "Navigation menu",
  logoUrl = "",
  onLogOut,
}: NavbarProps) => {
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);

  const handleCloseSheet = () => setIsSheetOpen(false);

  const logLinks = [
    { label: "Login", to: "/login" },
    { label: "Register", to: "/register" },
  ];

  const navLinks = {
    en: [
      {
        label: "Men",
        to: "/man",
        subLinks: [
          {
            label: "Shirts",
            to: "",
          },
          {
            label: "T-Shirts",
            to: "",
          },
          {
            label: "Sweaters & Hoodies",
            to: "",
          },
          {
            label: "Pants",
            to: "",
          },
          {
            label: "Accessories",
            to: "",
          },
          {
            label: "Shorts",
            to: "",
          },
          {
            label: "Jackets",
            to: "",
          },
          {
            label: "Shoes",
            to: "",
          },
        ],
      },
      {
        label: "Women",
        to: "/women",
        subLinks: [
          {
            label: "Accessories",
            to: "/assets/w.accessories.png",
          },
          {
            label: "Blouses",
            to: "/assets/w.blouses.png",
          },
          {
            label: "Body Suits",
            to: "/assets/w.body suit.png",
          },
          {
            label: "Dresses",
            to: "/assets/w.dress.png",
          },
          {
            label: "Hoodies",
            to: "/assets/w.hoodie.png",
          },
          {
            label: "Jackets",
            to: "/assets/w.jackets.png",
          },
          {
            label: "Pants",
            to: "/assets/w.pants.png",
          },
          {
            label: "Shirts",
            to: "/assets/W.shirts.png",
          },
          {
            label: "Shoes",
            to: "/assets/W.shoes.png",
          },
          {
            label: "Shorts",
            to: "/assets/W.SHORTS.png",
          },
          {
            label: "Skirts",
            to: "/assets/w.skirts.png",
          },
          {
            label: "T-Shirts",
            to: "/assets/W.TSHIRT.png",
          },
        ],
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

  async function terminateSession() {
    localStorage.removeItem("token");
    onLogOut?.();
  }

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
                {links.map((link) => (
                  <NavigationMenuItem key={link.to} className="relative  ">
                    {link.subLinks ? (
                      <>
                        <NavigationMenuTrigger className=" navLink ">
                          {link.label}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent className="absolute mt-10 bg-white text-black rounded-2xl">
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
                        </NavigationMenuContent>
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

        <div className="flex items-center gap-4">
          <div className=" hidden md:flex justify-center items-center gap-4">
            {!session ? (
              logLinks.map((link) => (
                <Link key={link.to} href={link.to} className="navLink">
                  {link.label}
                </Link>
              ))
            ) : (
              <>
                <button
                  onClick={terminateSession}
                  type="submit"
                  className="text-gray-700 hover:text-gray-900 cursor-pointer"
                >
                  Logout
                </button>
              </>
            )}
          </div>
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
                <div className="p-4 h-full">
                  <nav className="space-y-4 flex flex-col justify-center items-center h-full">
                    <SheetTitle className="">Navigation menu</SheetTitle>
                    {links.map((link) => (
                      <Link
                        key={link.to}
                        href={link.to}
                        className="block text-lg text-gray-700 hover:text-gray-900"
                        onClick={handleCloseSheet}
                      >
                        {link.label}
                      </Link>
                    ))}
                    <div className=" md:hidden flex justify-center items-center gap-4">
                      {!session ? (
                        logLinks.map((link) => (
                          <Link
                            key={link.to}
                            href={link.to}
                            className=" px-6 py-3 rounded-3xl transition-all duration-300 cursor-pointer"
                          >
                            {link.label}
                          </Link>
                        ))
                      ) : (
                        <>
                          <button
                            onClick={terminateSession}
                            type="submit"
                            className="text-gray-700 hover:text-gray-900 cursor-pointer"
                          >
                            Logout
                          </button>
                        </>
                      )}
                    </div>
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
