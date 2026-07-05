import type { MouseEvent } from "react";
import { Link } from "#root/components/utils/Link";
import { ArrowRight } from "lucide-react";
import type { HomepageHeroContent } from "#root/shared/types/homepage-content";
import { STORE_NAME } from "#root/shared/config/branding";
import { useMinimalI18n } from "#root/lib/i18n/MinimalI18nContext";
import { cn } from "#root/lib/utils";
import {
  NOIR_ACCENT_BG_CLASSES,
  NOIR_DISPLAY_FONT_CLASSES,
  NOIR_TEXT_SECONDARY_CLASSES,
} from "./noir-tokens";

interface NoirHeroProps {
  hero: HomepageHeroContent;
  onCtaClick?: (link: string) => void;
}

/**
 * NoirHero — cinematic hero inside a large rounded dark-glass container.
 * Eyebrow (store name, red tracked) → condensed uppercase display
 * headline → subcopy → solid-red primary CTA + outline secondary CTA.
 * Hero image renders as a composed panel on the end side (CMS
 * backgroundImage, mobile variant via <picture>); stacks below text on
 * mobile. Renders nothing when the section is disabled.
 */
export function NoirHero({ hero, onCtaClick }: NoirHeroProps) {
  const { t, locale } = useMinimalI18n();
  const isAr = locale === "ar";
  const track = isAr ? "" : "tracking-[0.3em]";

  if (!hero.enabled) return null;

  const desktopImage =
    hero.backgroundImage || hero.heroSlides?.[0]?.imageUrl || "";
  const mobileImage = hero.mobileBackgroundImage || desktopImage;
  const hasImage = Boolean(desktopImage);

  const handleCta = (link: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (onCtaClick) {
      e.preventDefault();
      onCtaClick(link);
    }
  };

  const ctaLink = hero.ctaLink || "/shop";

  return (
    <section className='px-4 md:px-8 pt-6 md:pt-10'>
      <div className='mx-auto max-w-7xl bg-[#101010] border border-white/10 rounded-xl overflow-hidden'>
        <div
          className={cn(
            "grid items-center",
            hasImage ? "md:grid-cols-2" : "text-center",
          )}>
          {/* ── Text panel ── */}
          <div
            className={cn(
              "px-6 py-12 md:px-12 md:py-20 space-y-6",
              !hasImage && "mx-auto max-w-2xl",
            )}>
            <p
              className={cn(
                "text-[11px] uppercase text-[#E8112D] font-medium",
                track,
                NOIR_DISPLAY_FONT_CLASSES,
              )}>
              {STORE_NAME}
            </p>
            <h1
              className={cn(
                "text-4xl md:text-6xl uppercase leading-[1.05] text-white font-semibold",
                isAr ? "" : "tracking-[0.02em]",
                NOIR_DISPLAY_FONT_CLASSES,
              )}>
              {hero.title}
            </h1>
            {hero.subtitle && (
              <p
                className={cn(
                  "text-sm md:text-base leading-relaxed max-w-md",
                  !hasImage && "mx-auto",
                  NOIR_TEXT_SECONDARY_CLASSES,
                )}>
                {hero.subtitle}
              </p>
            )}
            <div
              className={cn(
                "flex flex-col sm:flex-row gap-3 pt-2",
                !hasImage && "justify-center",
              )}>
              <a
                href={ctaLink}
                onClick={handleCta(ctaLink)}
                className={cn(
                  "inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-md",
                  "text-xs uppercase font-medium text-white transition-colors duration-300",
                  isAr ? "" : "tracking-[0.2em]",
                  NOIR_DISPLAY_FONT_CLASSES,
                  NOIR_ACCENT_BG_CLASSES,
                )}>
                {hero.ctaText || t("shop_now")}
                <ArrowRight
                  className='w-3.5 h-3.5 rtl:rotate-180'
                  strokeWidth={1.5}
                />
              </a>
              <Link
                href='/shop'
                className={cn(
                  "inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-md",
                  "border border-white/20 text-xs uppercase font-medium text-white/80",
                  "hover:border-white/50 hover:text-white transition-colors duration-300",
                  isAr ? "" : "tracking-[0.2em]",
                  NOIR_DISPLAY_FONT_CLASSES,
                )}>
                {t("view_all")}
              </Link>
            </div>
          </div>

          {/* ── Image panel (stacks below text on mobile) ── */}
          {hasImage && (
            <div className='relative h-64 md:h-full md:min-h-[480px] bg-black order-last'>
              <picture>
                {mobileImage !== desktopImage && (
                  <source media='(max-width: 767px)' srcSet={mobileImage} />
                )}
                <img
                  src={desktopImage}
                  alt={hero.title}
                  className='absolute inset-0 w-full h-full object-cover'
                  fetchPriority='high'
                />
              </picture>
              {/* Subtle vignette so the panel blends into the dark canvas */}
              <div
                className='absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-transparent'
                aria-hidden='true'
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
