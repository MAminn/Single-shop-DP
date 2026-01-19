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
import { Link } from "#root/components/utils/Link";
import logoImage from "#root/assets/Lebsy-Logo-Light.webp";
import { AuthContext } from "#root/context/AuthContext.js";
import { useCart } from "#root/lib/context/CartContext";
import { trpc } from "#root/shared/trpc/client";
import { toast } from "sonner";
import { isSingleShopMode } from "#root/shared/config/app";

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

  // Build navigation links based on shop mode
  const baseNavLinks = [
    {
      label: "Collection",
      to: "/featured/products",
    },
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
      label: "Editions",
      to: "/featured/brands",
    },
  ];

  // Single-shop template: No vendor registration
  const enNavLinks = baseNavLinks;

  const navLinks = {
    en: enNavLinks,
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
    <nav className='sticky w-full py-4 lg:py-6 top-0 z-[10000] bg-stone-50 border-b border-stone-200'>
      <div className='px-6 lg:px-8 flex text-sm lg:text-base items-center justify-between min-h-16 max-w-7xl mx-auto'>
        <div className='flex items-center gap-8 lg:order-1 order-2'>
          <Link
            href='/'
            className='text-2xl font-light tracking-wide text-stone-900 hover:text-stone-700 transition-colors'>
            Percé
          </Link>

          <div className='hidden lg:flex gap-6 '>
            <NavigationMenu>
              <NavigationMenuList>
                {links.map((link) => (
                  <NavigationMenuItem key={link.to} className='relative  '>
                    {link.subLinks ? (
                      <>
                        <NavigationMenuItem asChild className=' navLink '>
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
                        <Link href={link.to} className='navLink'>
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
        <div className='flex items-center gap-4 lg:order-2 order-1'>
          <div className=' hidden lg:flex justify-center items-center gap-6'>
            {!session ? (
              logLinks.map((link) => (
                <Link
                  key={link.to}
                  href={link.to}
                  className='text-sm text-stone-600 hover:text-stone-900 transition-colors'>
                  {link.label}
                </Link>
              ))
            ) : (
              <>
                <button
                  onClick={logout}
                  type='submit'
                  className='text-sm text-stone-600 hover:text-stone-900 transition-colors'>
                  Logout
                </button>
                {session.role === "admin" && (
                  <Link
                    href='/dashboard'
                    className='text-xs text-stone-500 hover:text-stone-700 transition-colors uppercase tracking-wider'>
                    Dashboard
                  </Link>
                )}
              </>
            )}
          </div>

          <div className='flex lg:hidden'>
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='text-stone-700 hover:bg-stone-100'>
                  <Menu size={22} />
                </Button>
              </SheetTrigger>
              <SheetContent side='left' className='w-64 bg-stone-50 p-0'>
                <div className='flex flex-col h-full'>
                  {/* Logo at the top */}
                  <div className='p-6 border-b border-stone-200 w-full flex justify-center'>
                    <Link
                      href='/'
                      onClick={handleCloseSheet}
                      className='text-2xl font-light tracking-wide text-stone-900'>
                      Percé
                    </Link>
                  </div>

                  {/* Main navigation links */}
                  <div className='p-6 flex-1'>
                    <div className='flex flex-col gap-5 mb-8'>
                      {links.map((link) => (
                        <Link
                          key={link.to}
                          href={link.to}
                          className='text-base font-light text-stone-800 hover:text-stone-600 transition-colors'
                          onClick={handleCloseSheet}>
                          {link.label}
                        </Link>
                      ))}
                    </div>

                    {/* Dashboard/logout if logged in */}
                    {session && (
                      <div className='border-t border-stone-200 pt-5 mb-6'>
                        <Link
                          href='/dashboard'
                          className='text-sm font-light text-stone-600 hover:text-stone-800 block mb-4 uppercase tracking-wider'
                          onClick={handleCloseSheet}>
                          Dashboard
                        </Link>
                        <button
                          onClick={() => {
                            logout();
                            handleCloseSheet();
                          }}
                          className='text-base font-light text-stone-800 hover:text-stone-600'
                          type='button'>
                          Logout
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Footer section with company name */}
                  <div className='mt-auto border-t border-stone-200 p-6'>
                    <p className='text-xs text-stone-400 tracking-wide'>
                      Percé
                    </p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className='flex items-center gap-3 order-3'>
          {/* Login/User icon only on mobile */}
          {!session ? (
            <Button
              variant='ghost'
              size='icon'
              className='text-stone-600 hover:text-stone-900 hover:bg-stone-100 lg:hidden'
              asChild>
              <Link href='/login'>
                <User size={19} />
              </Link>
            </Button>
          ) : (
            <Button
              variant='ghost'
              size='icon'
              className='text-stone-600 hover:text-stone-900 hover:bg-stone-100 lg:hidden'
              asChild>
              <Link href='/dashboard'>
                <User size={19} />
              </Link>
            </Button>
          )}

          {/* Cart button */}
          <Button
            variant='ghost'
            size='icon'
            className='text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            asChild>
            <Link href='/cart' className='relative'>
              <ShoppingCart size={19} />
              {totalItems > 0 && (
                <span className='absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-medium leading-none transform translate-x-1/2 -translate-y-1/2 bg-stone-800 text-stone-50 rounded-full'>
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
