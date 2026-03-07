import { useContext, useEffect, useState, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Menu, Search, ShoppingBag, X, User } from "lucide-react";
import { Link } from "#root/components/utils/Link";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
} from "#root/components/ui/sheet";
import { Button } from "#root/components/ui/button";
import { AuthContext } from "#root/context/AuthContext.js";
import { useCart } from "#root/lib/context/CartContext";
import { STORE_NAME } from "#root/shared/config/branding";
import { navigate } from "vike/client/router";
import { EASE_OUT } from "../motion/motionPresets";
import { useLayoutSettings } from "#root/frontend/contexts/LayoutSettingsContext";
import { useNavbarMode } from "#root/components/globals/NavbarContext";
import { HeaderLogo } from "#root/components/globals/HeaderLogo";

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const DEFAULT_NAV_LINKS = [
  { label: "Shop", href: "/shop" },
  { label: "New In", href: "/featured/new" },
  { label: "Collections", href: "/featured/women" },
  { label: "About", href: "#" },
] as const;

const SCROLL_THRESHOLD = 24;

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

/**
 * Editorial Navbar — transparent at top, solid on scroll.
 *
 * - Desktop: left nav links · center logo · right icons
 * - Mobile: hamburger → Sheet drawer with editorial links
 * - text-xs tracking-[0.28em] uppercase for links
 * - Smooth bg/text transitions using Framer Motion
 */
export function EditorialNavbar() {
  const prefersReduced = useReducedMotion() ?? false;
  const mode = useNavbarMode();
  const isSolid = mode === "solid";
  const [isScrolled, setIsScrolled] = useState(isSolid);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { session, logout } = useContext(AuthContext);
  const { totalItems } = useCart();
  const layoutSettings = useLayoutSettings();

  // Build navigation links from CMS settings, with static fallback
  const cmsNavLinks = layoutSettings.header.navigationLinks;
  const NAV_LINKS =
    cmsNavLinks.length > 0
      ? cmsNavLinks.map((l) => ({ label: l.label, href: l.url }))
      : DEFAULT_NAV_LINKS;

  const announcementEnabled = layoutSettings.header.announcementBarEnabled;
  const announcementText = layoutSettings.header.announcementBarText;

  /* ---- Scroll detection ---- */
  useEffect(() => {
    if (isSolid) {
      setIsScrolled(true);
      return;
    }

    if (typeof window === "undefined") return;
    setIsScrolled(window.scrollY > SCROLL_THRESHOLD);

    const handleScroll = () => setIsScrolled(window.scrollY > SCROLL_THRESHOLD);

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isSolid]);

  /* ---- Search ---- */
  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
      setIsSheetOpen(false);
    }
  };

  const handleCloseSheet = () => setIsSheetOpen(false);

  /* ---- Link styles ---- */
  const linkCls = isScrolled
    ? "text-stone-900 hover:text-stone-600"
    : "text-white hover:text-white/70";

  const iconCls = isScrolled
    ? "text-stone-900 hover:bg-stone-100"
    : "text-white hover:bg-white/10";

  return (
    <>
      {/* Announcement bar */}
      {announcementEnabled && announcementText && (
        <div className='w-full bg-black text-white text-center py-2 px-4 text-xs tracking-wider z-[10001] relative'>
          {announcementText}
        </div>
      )}
      <motion.nav
        aria-label='Editorial navigation'
        className={`${
          isSolid
            ? "sticky top-0 z-[10000] py-4 lg:py-5"
            : `fixed inset-x-0 z-[10000] py-4 lg:py-5 ${announcementEnabled && announcementText ? "top-[32px]" : "top-0"}`
        }`}
        animate={{
          backgroundColor: isScrolled
            ? "rgba(255,255,255,1)"
            : "rgba(255,255,255,0)",
          borderBottomColor: isScrolled ? "rgba(0,0,0,0.08)" : "rgba(0,0,0,0)",
        }}
        transition={
          prefersReduced ? { duration: 0 } : { duration: 0.35, ease: EASE_OUT }
        }
        style={{ borderBottomWidth: 1, borderBottomStyle: "solid" }}>
        <div className='px-6 lg:px-8 grid grid-cols-3 items-center min-h-12 max-w-7xl mx-auto'>
          {/* ─── Left: Navigation ─── */}
          <div className='flex items-center gap-6 justify-start'>
            {/* Mobile hamburger */}
            <div className='lg:hidden'>
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    className={`transition-colors duration-200 ${iconCls}`}
                    aria-label='Open menu'>
                    <Menu size={22} />
                  </Button>
                </SheetTrigger>
                <SheetContent side='left' className='w-64 bg-stone-50 p-0'>
                  <div className='flex flex-col h-full'>
                    <div className='p-6 border-b border-stone-200 w-full flex justify-center'>
                      <HeaderLogo
                        variant='mobile'
                        onClick={handleCloseSheet}
                        textClassName='text-xl font-light tracking-[0.14em] text-stone-900 uppercase'
                      />
                    </div>

                    <div className='p-6 flex-1'>
                      {/* Mobile search */}
                      <form onSubmit={handleSearchSubmit} className='mb-6'>
                        <div className='relative'>
                          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400' />
                          <input
                            type='text'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder='Search products...'
                            className='w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-stone-200 bg-white text-stone-900 placeholder-stone-400 outline-none focus:border-stone-400'
                          />
                        </div>
                      </form>

                      <div className='flex flex-col gap-5 mb-8'>
                        {NAV_LINKS.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className='text-xs tracking-[0.28em] uppercase text-stone-800 hover:text-stone-500 transition-colors'
                            onClick={handleCloseSheet}>
                            {link.label}
                          </Link>
                        ))}
                      </div>

                      {session && (
                        <div className='border-t border-stone-200 pt-5 mb-6'>
                          <Link
                            href='/dashboard'
                            className='text-xs tracking-[0.2em] uppercase text-stone-600 hover:text-stone-800 block mb-4'
                            onClick={handleCloseSheet}>
                            Dashboard
                          </Link>
                          <button
                            onClick={() => {
                              logout();
                              handleCloseSheet();
                            }}
                            className='text-xs tracking-[0.2em] uppercase text-stone-800 hover:text-stone-500'
                            type='button'>
                            Logout
                          </button>
                        </div>
                      )}
                    </div>

                    <SheetTitle className='sr-only'>Navigation menu</SheetTitle>
                    <div className='mt-auto border-t border-stone-200 p-6'>
                      <p className='text-[10px] text-stone-400 tracking-[0.18em] uppercase'>
                        {STORE_NAME}
                      </p>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Desktop nav links */}
            <div className='hidden lg:flex gap-6'>
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs tracking-[0.28em] uppercase font-light transition-colors duration-200 ${linkCls} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900/25 focus-visible:ring-offset-2 rounded-sm`}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* ─── Center: Logo ─── */}
          <div className='flex justify-center'>
            <HeaderLogo
              variant='desktop'
              textClassName={`text-xl lg:text-2xl font-extralight tracking-[0.18em] uppercase transition-colors duration-200 ${linkCls}`}
            />
          </div>

          {/* ─── Right: Icons ─── */}
          <div className='flex items-center gap-2 justify-end'>
            {/* Desktop auth links */}
            <div className='hidden lg:flex items-center gap-4'>
              {!session ? (
                <>
                  <Link
                    href='/login'
                    className={`text-xs tracking-[0.2em] uppercase font-light transition-colors duration-200 ${linkCls}`}>
                    Login
                  </Link>
                  <Link
                    href='/register'
                    className={`text-xs tracking-[0.2em] uppercase font-light transition-colors duration-200 ${linkCls}`}>
                    Register
                  </Link>
                </>
              ) : (
                <>
                  {session.role === "admin" && (
                    <Link
                      href='/dashboard'
                      className={`text-xs tracking-[0.2em] uppercase font-light transition-colors duration-200 ${linkCls}`}>
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    type='button'
                    className={`text-xs tracking-[0.2em] uppercase font-light transition-colors duration-200 ${linkCls}`}>
                    Logout
                  </button>
                </>
              )}
            </div>

            {/* Search */}
            {isSearchOpen ? (
              <form
                onSubmit={handleSearchSubmit}
                className='flex items-center gap-1'>
                <input
                  ref={searchInputRef}
                  type='text'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder='Search…'
                  autoFocus
                  className={`w-32 lg:w-44 px-3 py-1.5 text-sm rounded-full border bg-transparent outline-none transition-colors ${
                    isScrolled
                      ? "border-stone-300 text-stone-900 placeholder-stone-400 focus:border-stone-900"
                      : "border-white/30 text-white placeholder-white/60 focus:border-white"
                  }`}
                />
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery("");
                  }}
                  className={`transition-colors ${iconCls}`}
                  aria-label='Close search'>
                  <X size={18} />
                </Button>
              </form>
            ) : (
              <Button
                variant='ghost'
                size='icon'
                onClick={() => {
                  setIsSearchOpen(true);
                  setTimeout(() => searchInputRef.current?.focus(), 100);
                }}
                className={`transition-colors duration-200 ${iconCls}`}
                aria-label='Search products'>
                <Search size={18} />
              </Button>
            )}

            {/* Cart */}
            <Button
              variant='ghost'
              size='icon'
              className={`transition-colors duration-200 ${iconCls}`}
              asChild>
              <Link href='/cart' className='relative' aria-label='Shopping bag'>
                <ShoppingBag size={18} />
                {totalItems > 0 && (
                  <span
                    className={`absolute top-0 right-0 inline-flex items-center justify-center px-1 py-0.5 text-[9px] font-medium leading-none transform translate-x-1/2 -translate-y-1/2 rounded-full transition-colors duration-200 ${
                      isScrolled
                        ? "bg-stone-900 text-white"
                        : "bg-white text-stone-900"
                    }`}>
                    {totalItems}
                  </span>
                )}
              </Link>
            </Button>

            {/* Mobile user icon */}
            <Button
              variant='ghost'
              size='icon'
              className={`lg:hidden transition-colors duration-200 ${iconCls}`}
              asChild>
              <Link
                href={session ? "/dashboard" : "/login"}
                aria-label={session ? "Dashboard" : "Login"}>
                <User size={18} />
              </Link>
            </Button>
          </div>
        </div>
      </motion.nav>
    </>
  );
}
