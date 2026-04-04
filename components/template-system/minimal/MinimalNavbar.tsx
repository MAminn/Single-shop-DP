import { useContext, useState, useRef, useEffect } from "react";
import { Search, ShoppingCart, User, X, Menu, Globe, LogOut } from "lucide-react";
import { Link } from "#root/components/utils/Link";
import { AuthContext } from "#root/context/AuthContext";
import { useCart } from "#root/lib/context/CartContext";
import { useLayoutSettings } from "#root/frontend/contexts/LayoutSettingsContext";
import { useNavbarMode } from "#root/components/globals/NavbarContext";
import { HeaderLogo } from "#root/components/globals/HeaderLogo";
import { Marquee } from "#root/components/ui/marquee";
import { navigate } from "vike/client/router";
import { trpc } from "#root/shared/trpc/client";
import { toast } from "sonner";
import { useMinimalI18n } from "#root/lib/i18n/MinimalI18nContext";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
} from "#root/components/ui/sheet";

/**
 * Minimal Navbar — clean design inspired by matchperfumes.com.
 * Layout: [icons (left)]  ·  [nav links (centre-right)]  ·  [LOGO (far right)]
 * Flips naturally with RTL via the i18n dir attribute.
 */
export function MinimalNavbar() {
  const mode = useNavbarMode();
  const layoutSettings = useLayoutSettings();
  const { session, logout } = useContext(AuthContext);
  const { totalItems } = useCart();
  const { t, locale, toggleLocale, dir } = useMinimalI18n();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
      setIsSheetOpen(false);
    }
  };

  const cmsNavLinks = layoutSettings.header.navigationLinks;
  const links =
    cmsNavLinks.length > 0
      ? cmsNavLinks.map((l) => ({
          label: locale === "ar" && l.labelAr ? l.labelAr : l.label,
          to: l.url,
        }))
      : [{ label: "Shop", to: "/shop" }];

  const handleCloseSheet = () => setIsSheetOpen(false);

  const marqueeEnabled = layoutSettings.header.marqueeEnabled;
  const marqueeText = locale === "ar" && layoutSettings.header.marqueeTextAr
    ? layoutSettings.header.marqueeTextAr
    : layoutSettings.header.marqueeText;

  return (
    <>
      {/* ── Scrolling Marquee ── */}
      {marqueeEnabled && marqueeText && (
        <Marquee
          key={marqueeText}
          text={marqueeText}
          repeat={14}
          duration={35}
          className='bg-white text-black'
        />
      )}

      <nav className='w-full bg-white border-b border-gray-200 sticky top-0 z-[10000]'>
        <div className='max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16 sm:h-[72px]'>
            {/* ── Left: Action icons ── */}
            <div className='flex items-center gap-1 sm:gap-2'>
              

              {/* User / Auth */}
              {!session ? (
                <Link
                  href='/login'
                  className='p-2 text-gray-700 hover:text-black transition-colors'
                  aria-label={t("nav.login")}>
                  <User className='w-[18px] h-[18px]' />
                </Link>
              ) : (
                <>
                    <button
                    type='button'
                    onClick={() => logout()}
                    className='p-2 text-gray-700 hover:text-black transition-colors cursor-pointer'
                    aria-label={t("nav.logout")}>
                    <LogOut className='w-[18px] h-[18px]' />
                  </button>
                  <Link
                    href='/dashboard'
                    className='p-2 text-gray-700 hover:text-black transition-colors'
                    aria-label={t("nav.dashboard")}>
                    <User className='w-[18px] h-[18px]' />
                  </Link>
                  
                </>
              )}
                {/* Cart */}
              <Link
                href='/cart'
                className='relative p-2 text-gray-700 hover:text-black transition-colors'
                aria-label={t("nav.cart")}>
                <ShoppingCart className='w-[18px] h-[18px]' />
                {totalItems > 0 && (
                  <span className='absolute -top-0.5 -right-0.5 inline-flex items-center justify-center w-[18px] h-[18px] text-[10px] font-medium leading-none bg-red-600 text-white rounded-full'>
                    {totalItems}
                  </span>
                )}
              </Link>
              

              {/* Language toggle */}
              <button
                type='button'
                onClick={toggleLocale}
                className='p-2 text-gray-700 hover:text-black transition-colors text-xs font-medium'
                aria-label='Toggle language'>
                {locale === "en" ? "AR" : "EN"}
              </button>
            </div>

            {/* ── Center / Right: Navigation Links (desktop) ── */}
            <div className='hidden lg:flex items-center gap-1'>
              {links.map((link) => (
                <Link
                  key={link.to}
                  href={link.to}
                  className='px-3 py-1.5 text-[13px] font-normal text-gray-700 hover:text-black transition-colors tracking-wide'>
                  {link.label}
                </Link>
              ))}
            </div>

            {/* ── Far Right: Logo + Mobile hamburger ── */}
            <div className='flex items-center gap-2'>
              {/* Desktop Logo */}
              <HeaderLogo
                variant='desktop'
                textClassName='text-2xl sm:text-[28px] font-normal tracking-[0.22em] text-gray-900 uppercase hover:text-gray-600 transition-colors'
              />

              {/* Mobile hamburger */}
              <div className='lg:hidden'>
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                  <SheetTrigger asChild>
                    <button
                      type='button'
                      className='p-2 text-gray-700 hover:text-black transition-colors'
                      aria-label={t("nav.menu")}>
                      <Menu className='w-5 h-5' />
                    </button>
                  </SheetTrigger>
                  <SheetContent side={dir === "rtl" ? "right" : "left"} className='w-72 bg-white p-0'>
                    <div className='flex flex-col h-full'>
                      {/* Mobile logo */}
                      <div className='p-6 border-b border-gray-100 flex justify-center'>
                        <HeaderLogo
                          variant='mobile'
                          onClick={handleCloseSheet}
                          textClassName='text-xl font-normal tracking-[0.2em] text-gray-900 uppercase'
                        />
                      </div>

                      {/* Mobile search */}
                      <div className='px-5 pt-5'>
                        <form onSubmit={handleSearchSubmit}>
                          <div className='relative'>
                            <Search className='absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                            <input
                              type='text'
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder={t("nav.search")}
                              className='w-full ps-9 pe-4 py-2.5 text-sm border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400 transition-colors'
                            />
                          </div>
                        </form>
                      </div>

                      {/* Mobile nav links */}
                      <div className='flex-1 px-5 pt-6'>
                        <div className='flex flex-col gap-4'>
                          {links.map((link) => (
                            <Link
                              key={link.to}
                              href={link.to}
                              className='text-sm font-normal text-gray-800 hover:text-black transition-colors tracking-wide'
                              onClick={handleCloseSheet}>
                              {link.label}
                            </Link>
                          ))}
                        </div>

                        {/* Language toggle */}
                        <button
                          type='button'
                          onClick={() => {
                            toggleLocale();
                          }}
                          className='mt-4 flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors'>
                          <Globe className='w-4 h-4' />
                          {locale === "en" ? "العربية" : "English"}
                        </button>

                        {session && (
                          <div className='border-t border-gray-100 pt-5 mt-6'>
                            <Link
                              href='/dashboard'
                              className='text-sm text-gray-600 hover:text-black block mb-4'
                              onClick={handleCloseSheet}>
                              {t("nav.dashboard")}
                            </Link>
                            <button
                              onClick={() => {
                                logout();
                                handleCloseSheet();
                              }}
                              className='text-sm text-gray-600 hover:text-black'
                              type='button'>
                              {t("nav.logout")}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
