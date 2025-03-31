import type React from "react";
import { useContext, useEffect, useState } from "react";
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

  const logLinks = [{ label: "Login", to: "/login" }];

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
        to: "/women",
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
    <nav className=' shadow-md sticky py-2 lg:py-6 top-0 z-10 bg-background'>
      <div className='px-4 flex text-sm lg:text-base items-center justify-between min-h-16 max-w-7xl mx-auto'>
        <div className='flex items-center gap-8 lg:order-1 order-2'>
          <Link href='/' className='text-3xl font-bold '>
            <img src={logoImage} alt='' className='md:w-[150px] w-[100px]' />
          </Link>

          <div className='hidden lg:flex gap-6 '>
            <NavigationMenu>
              <NavigationMenuList>
                {links.map((link) => (
                  <NavigationMenuItem key={link.to} className='relative  '>
                    {link.subLinks ? (
                      <>
                        <NavigationMenuTrigger className=' navLink '>
                          {link.label}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent className='absolute mt-10 bg-white text-black rounded-2xl'>
                          <ul className='grid gap-3 p-4 w-[200px]'>
                            {link.subLinks.map((subLink) => (
                              <li key={subLink.to}>
                                <NavigationMenuLink className='  navLink'>
                                  <Link href={subLink.to} className='block '>
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
          <div className=' hidden lg:flex justify-center items-center gap-2'>
            {!session ? (
              logLinks.map((link) => (
                <Link key={link.to} href={link.to} className='navLink'>
                  {link.label}
                </Link>
              ))
            ) : (
              <>
                <button onClick={logout} type='submit' className='navLink'>
                  Logout
                </button>

                <Link href='/dashboard' className='navLink'>
                  Dashboard
                </Link>
              </>
            )}
          </div>

          <div className='flex lg:hidden'>
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='text-gray-700 hover:bg-gray-100'>
                  <Menu size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent side='left' className='w-64 bg-white'>
                <div className='p-4 h-full'>
                  <nav className='space-y-4 flex flex-col justify-center items-center h-full'>
                    <SheetTitle className=''>Navigation menu</SheetTitle>
                    {links.map((link) => (
                      <Link
                        key={link.to}
                        href={link.to}
                        className='block text-lg text-gray-700 hover:text-gray-900'
                        onClick={handleCloseSheet}>
                        {link.label}
                      </Link>
                    ))}
                    <div className=' md:hidden flex justify-center items-center gap-4'>
                      {!session ? (
                        logLinks.map((link) => (
                          <Link
                            key={link.to}
                            href={link.to}
                            className=' navLink'>
                            {link.label}
                          </Link>
                        ))
                      ) : (
                        <>
                          <button
                            onClick={logout}
                            type='submit'
                            className='navLink'>
                            Logout
                          </button>

                          <Link href='/dashboard' className='navLink'>
                            Dashboard
                          </Link>
                        </>
                      )}
                    </div>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <Button
          variant='ghost'
          size='icon'
          className='hover:text-gray-700 hover:bg-gray-100 hidden max-lg:flex order-3'
          asChild>
          <Link href='/cart' className='relative'>
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span className='absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-1 text-xs font-bold leading-none transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white rounded-full'>
                {totalItems}
              </span>
            )}
          </Link>
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
