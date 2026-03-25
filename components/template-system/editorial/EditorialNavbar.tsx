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
  { label: "New Arrivals", href: "/shop" },
  { label: "About", href: "#" },
] as const;

const SCROLL_THRESHOLD = 16;

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

/**
 * Editorial Navbar — transparent at top, solid on scroll.
 *
 * Premium fashion-editorial header:
 * - Desktop: left nav links · center logo · right icons
 * - Mobile: hamburger → Sheet drawer with editorial links
 * - Quiet-luxury typography: 11px tracking-[0.2em] uppercase
 * - Smooth bg/text transitions via Framer Motion
 * - Clean icon-only right side (Search · Account · Bag)
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
    ? "!text-stone-700 hover:!text-stone-950"
    : "!text-white/85 hover:!text-white";

  const iconCls = isScrolled
    ? "!text-stone-700 hover:!text-stone-950 hover:bg-transparent"
    : "!text-white/85 hover:!text-white hover:bg-transparent";

  return (
    <>
      {/* Announcement bar — refined, restrained */}
      {announcementEnabled && announcementText && (
        <div className='w-full bg-stone-900 text-white/70 text-center py-2 px-6 text-[10px] tracking-[0.28em] uppercase font-light z-10001 relative select-none'>
          {announcementText}
        </div>
      )}
      <motion.nav
        aria-label='Editorial navigation'
        className={`transition-[backdrop-filter] duration-500 ${isScrolled ? "backdrop-blur-2xl" : "backdrop-blur-0"} ${
          isSolid
            ? "sticky top-0 z-10000 py-5 lg:py-7"
            : `fixed inset-x-0 z-10000 py-5 lg:py-7 ${announcementEnabled && announcementText ? "top-8.5" : "top-0"}`
        }`}
        animate={{
          backgroundColor: isScrolled
            ? "rgba(255,255,255,0.96)"
            : "rgba(255,255,255,0)",
          borderBottomColor: isScrolled ? "rgba(0,0,0,0.05)" : "rgba(0,0,0,0)",
        }}
        transition={
          prefersReduced ? { duration: 0 } : { duration: 0.5, ease: EASE_OUT }
        }
        style={{ borderBottomWidth: 1, borderBottomStyle: "solid" }}>
        <div className='px-6 lg:px-12 xl:px-16 grid grid-cols-3 items-center min-h-14 max-w-480 mx-auto'>
          {/* ─── Left: Navigation ─── */}
          <div className='flex items-center gap-10 justify-start'>
            {/* Mobile hamburger */}
            <div className='lg:hidden'>
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <button
                    type='button'
                    className={`p-1 transition-colors duration-300 ${iconCls}`}
                    aria-label='Open menu'>
                    <Menu size={20} strokeWidth={1.3} />
                  </button>
                </SheetTrigger>
                <SheetContent side='left' className='w-75 bg-stone-50 p-0'>
                  <div className='flex flex-col h-full'>
                    <div className='px-8 py-8 border-b border-stone-200/60 w-full flex justify-center'>
                      <HeaderLogo
                        variant='mobile'
                        onClick={handleCloseSheet}
                        textClassName='text-lg font-light tracking-[0.18em] text-stone-900 uppercase'
                      />
                    </div>

                    <div className='px-8 py-10 flex-1'>
                      {/* Mobile search */}
                      <form onSubmit={handleSearchSubmit} className='mb-10'>
                        <div className='relative'>
                          <Search className='absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400' />
                          <input
                            type='text'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder='Search…'
                            className='w-full pl-7 pr-4 py-2.5 text-[13px] tracking-wide border-b border-stone-200 bg-transparent text-stone-900 placeholder-stone-400 outline-none focus:border-stone-400 transition-colors'
                          />
                        </div>
                      </form>

                      <div className='flex flex-col gap-7 mb-10'>
                        {NAV_LINKS.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className='text-[11px] tracking-[0.22em] uppercase text-stone-600 hover:text-stone-900 transition-colors font-normal'
                            onClick={handleCloseSheet}>
                            {link.label}
                          </Link>
                        ))}
                      </div>

                      {session && (
                        <div className='border-t border-stone-200/60 pt-7 mb-6'>
                          <Link
                            href='/account'
                            className='text-[11px] tracking-[0.2em] uppercase text-stone-500 hover:text-stone-800 block mb-5 transition-colors'
                            onClick={handleCloseSheet}>
                            Account
                          </Link>
                          {session.role === "admin" && (
                            <Link
                              href='/dashboard'
                              className='text-[11px] tracking-[0.2em] uppercase text-stone-500 hover:text-stone-800 block mb-5 transition-colors'
                              onClick={handleCloseSheet}>
                              Dashboard
                            </Link>
                          )}
                          <button
                            onClick={() => {
                              logout();
                              handleCloseSheet();
                            }}
                            className='text-[11px] tracking-[0.2em] uppercase text-stone-500 hover:text-stone-800 transition-colors'
                            type='button'>
                            Sign Out
                          </button>
                        </div>
                      )}
                    </div>

                    <SheetTitle className='sr-only'>Navigation menu</SheetTitle>
                    <div className='mt-auto border-t border-stone-200/40 px-8 py-6'>
                      <p className='text-[9px] text-stone-400 tracking-[0.22em] uppercase font-light'>
                        {STORE_NAME}
                      </p>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Desktop nav links */}
            <nav className='hidden lg:flex gap-10'>
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[11px] tracking-[0.2em] uppercase font-normal transition-colors duration-300 ${linkCls} focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-stone-900/20 focus-visible:ring-offset-4 rounded-sm`}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* ─── Center: Logo ─── */}
          <div className='flex justify-center'>
            <HeaderLogo
              variant='desktop'
              textClassName={`text-[22px] lg:text-[26px] font-extralight tracking-[0.22em] uppercase transition-colors duration-400 ${isScrolled ? "!text-stone-900" : "!text-white"}`}
            />
          </div>

          {/* ─── Right: Icons (Search · Account · Bag) ─── */}
          <div className='flex items-center gap-4 justify-end'>
            {/* Search */}
            {isSearchOpen ? (
              <form
                onSubmit={handleSearchSubmit}
                className='flex items-center gap-2'>
                <input
                  ref={searchInputRef}
                  type='text'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder='Search…'
                  autoFocus
                  className={`w-36 lg:w-44 px-4 py-1.5 text-[12px] tracking-wider border-b bg-transparent outline-none transition-all duration-300 ${
                    isScrolled
                      ? "border-stone-300 text-stone-900 placeholder-stone-400 focus:border-stone-500"
                      : "border-white/30 text-white placeholder-white/50 focus:border-white/60"
                  }`}
                />
                <button
                  type='button'
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery("");
                  }}
                  className={`p-1 transition-colors duration-300 ${iconCls}`}
                  aria-label='Close search'>
                  <X size={16} strokeWidth={1.3} />
                </button>
              </form>
            ) : (
              <button
                type='button'
                onClick={() => {
                  setIsSearchOpen(true);
                  setTimeout(() => searchInputRef.current?.focus(), 100);
                }}
                className={`p-1 transition-colors duration-300 ${iconCls}`}
                aria-label='Search'>
                <Search size={18} strokeWidth={1.3} />
              </button>
            )}

            {/* Account icon — replaces Login/Register text links */}
            <Link
              href={
                session
                  ? session.role === "admin"
                    ? "/dashboard"
                    : "/account"
                  : "/login"
              }
              className={`p-1 transition-colors duration-300 hidden lg:block ${iconCls}`}
              aria-label={session ? "Account" : "Sign in"}>
              <User size={18} strokeWidth={1.3} />
            </Link>

            {/* Cart */}
            <Link
              href='/cart'
              className={`p-1 relative transition-colors duration-300 ${iconCls}`}
              aria-label='Shopping bag'>
              <ShoppingBag size={18} strokeWidth={1.3} />
              {totalItems > 0 && (
                <span
                  className={`absolute -top-0.5 -right-1 inline-flex items-center justify-center w-4 h-4 text-[8px] font-medium leading-none rounded-full transition-colors duration-300 ${
                    isScrolled
                      ? "bg-stone-900 text-white"
                      : "bg-white text-stone-900"
                  }`}>
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Mobile user icon */}
            <Link
              href={session ? "/account" : "/login"}
              className={`p-1 lg:hidden transition-colors duration-300 ${iconCls}`}
              aria-label={session ? "Account" : "Sign in"}>
              <User size={18} strokeWidth={1.3} />
            </Link>
          </div>
        </div>
      </motion.nav>
    </>
  );
}
