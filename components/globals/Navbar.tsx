import type React from "react";
import { useContext, useEffect, useState, useRef } from "react";
import { Button } from "#root/components/ui/button";
import { Menu, ShoppingCart, Globe, User, Search, X } from "lucide-react";
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
import { AuthContext } from "#root/context/AuthContext.js";
import { useCart } from "#root/lib/context/CartContext";
import { trpc } from "#root/shared/trpc/client";
import { toast } from "sonner";
import { isSingleShopMode } from "#root/shared/config/app";
import { STORE_NAME } from "#root/shared/config/branding";
import { useNavbarMode } from "./NavbarContext";
import { navigate } from "vike/client/router";

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
  const mode = useNavbarMode();
  const isSolid = mode === "solid";

  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(isSolid);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
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

      setSubcategories(res.result as any);
    });
  }, []);

  // Scroll detection hook (only matters in overlay mode)
  useEffect(() => {
    if (isSolid) {
      setIsScrolled(true);
      return;
    }

    if (typeof window !== "undefined") {
      setIsScrolled(window.scrollY > 32);
    }

    const handleScroll = () => {
      if (typeof window !== "undefined") {
        setIsScrolled(window.scrollY > 32);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isSolid]);

  const { totalItems } = useCart();

  const handleCloseSheet = () => setIsSheetOpen(false);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
      handleCloseSheet();
    }
  };

  const { session, logout } = useContext(AuthContext);

  // Unified pill-style nav item classes
  const getNavItemClasses = (isScrolled: boolean) => {
    const baseClasses =
      "px-4 py-2 rounded-full text-xs font-light uppercase tracking-wider transition-all duration-[240ms] ease-in-out";
    const scrolledClasses =
      "!text-black hover:!text-stone-700 hover:bg-stone-100";
    const transparentClasses =
      "!text-white hover:!text-white/80 hover:bg-white/10";

    return `${baseClasses} ${isScrolled ? scrolledClasses : transparentClasses}`;
  };

  const logLinks = [
    { label: "Login", to: "/login" },
    { label: "Register", to: "/register" },
  ];

  // Build navigation links based on shop mode
  const baseNavLinks = [
    {
      label: "Collection",
      to: "/shop",
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
    <nav
      className={`w-full py-4 lg:py-6 z-[10000] transition-all duration-[240ms] ease-in-out ${
        isSolid
          ? "sticky top-0 bg-white border-b border-black/[0.08]"
          : `fixed top-0 ${
              isScrolled
                ? "bg-white border-b border-black/[0.08]"
                : "bg-transparent border-b border-transparent"
            }`
      }`}>
      <div className='px-6 lg:px-8 grid grid-cols-3 items-center min-h-16 max-w-7xl mx-auto'>
        {/* Left: Primary Navigation */}
        <div className='flex items-center gap-6 justify-start'>
          {/* Mobile menu */}
          <div className='lg:hidden'>
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className={`transition-colors duration-[240ms] ease-in-out ${
                    isScrolled
                      ? "!text-black hover:bg-stone-100"
                      : "!text-white hover:bg-white/10"
                  }`}>
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
                      {STORE_NAME}
                    </Link>
                  </div>

                  {/* Main navigation links */}}
                  <div className='p-6 flex-1'>
                    {/* Mobile search */}
                    <form onSubmit={handleSearchSubmit} className="mb-6">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search products..."
                          className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-stone-200 bg-white text-stone-900 placeholder-stone-400 outline-none focus:border-stone-400"
                        />
                      </div>
                    </form>

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
                      {STORE_NAME}
                    </p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop navigation */}
          <div className='hidden lg:flex gap-2'>
            <NavigationMenu>
              <NavigationMenuList>
                {links.map((link) => (
                  <NavigationMenuItem key={link.to}>
                    <NavigationMenuLink asChild>
                      <Link
                        href={link.to}
                        className={getNavItemClasses(isScrolled)}>
                        {link.label}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>

        {/* Center: Logo */}
        <div className='flex justify-center'>
          <Link
            href='/'
            className={`text-2xl lg:text-3xl font-light tracking-[0.08em] transition-colors duration-[240ms] ease-in-out ${
              isScrolled
                ? "!text-black hover:!text-stone-700"
                : "!text-white hover:!text-white/80"
            }`}>
            {STORE_NAME}
          </Link>
        </div>

        {/* Right: User Actions */}
        <div className='flex items-center gap-3 justify-end'>
          {/* Desktop: Auth Links or Dashboard */}
          <div className='hidden lg:flex items-center gap-2'>
            {!session ? (
              logLinks.map((link) => (
                <Link
                  key={link.to}
                  href={link.to}
                  className={getNavItemClasses(isScrolled)}>
                  {link.label}
                </Link>
              ))
            ) : (
              <>
                {session.role === "admin" && (
                  <Link
                    href='/dashboard'
                    className={getNavItemClasses(isScrolled)}>
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={logout}
                  type='submit'
                  className={getNavItemClasses(isScrolled)}>
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Search button (desktop + mobile) */}
          {isSearchOpen ? (
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-1">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                autoFocus
                className={`w-32 lg:w-48 px-3 py-1.5 text-sm rounded-full border bg-transparent outline-none transition-colors ${
                  isScrolled
                    ? "border-gray-300 text-black placeholder-gray-400 focus:border-black"
                    : "border-white/30 text-white placeholder-white/60 focus:border-white"
                }`}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }}
                className={`transition-colors ${
                  isScrolled
                    ? "!text-black hover:bg-stone-100"
                    : "!text-white hover:bg-white/10"
                }`}
              >
                <X size={18} />
              </Button>
            </form>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsSearchOpen(true);
                setTimeout(() => searchInputRef.current?.focus(), 100);
              }}
              className={`transition-all duration-[240ms] ease-in-out ${
                isScrolled
                  ? "!text-black hover:!text-stone-700 hover:bg-stone-100"
                  : "!text-white hover:!text-white/80 hover:bg-white/10"
              }`}
            >
              <Search size={20} />
            </Button>
          )}

          {/* Cart button */}
          <Button
            variant='ghost'
            size='icon'
            className={`transition-all duration-[240ms] ease-in-out ${
              isScrolled
                ? "!text-black hover:!text-stone-700 hover:bg-stone-100"
                : "!text-white hover:!text-white/80 hover:bg-white/10"
            }`}
            asChild>
            <Link href='/cart' className='relative'>
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span
                  className={`absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-medium leading-none transform translate-x-1/2 -translate-y-1/2 rounded-full transition-colors duration-[240ms] ease-in-out ${
                    isScrolled
                      ? "!bg-black !text-white"
                      : "!bg-white !text-black"
                  }`}>
                  {totalItems}
                </span>
              )}
            </Link>
          </Button>

          {/* Mobile: User icon */}
          {!session ? (
            <Button
              variant='ghost'
              size='icon'
              className={`lg:hidden transition-all duration-[240ms] ease-in-out ${
                isScrolled
                  ? "!text-black hover:!text-stone-700 hover:bg-stone-100"
                  : "!text-white hover:!text-white/80 hover:bg-white/10"
              }`}
              asChild>
              <Link href='/login'>
                <User size={20} />
              </Link>
            </Button>
          ) : (
            <Button
              variant='ghost'
              size='icon'
              className={`lg:hidden transition-all duration-[240ms] ease-in-out ${
                isScrolled
                  ? "!text-black hover:!text-stone-700 hover:bg-stone-100"
                  : "!text-white hover:!text-white/80 hover:bg-white/10"
              }`}
              asChild>
              <Link href='/dashboard'>
                <User size={20} />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
