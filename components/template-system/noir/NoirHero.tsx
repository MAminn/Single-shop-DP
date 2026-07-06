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
    <section className='relative px-4 md:px-8 pt-6 md:pt-8 overflow-hidden'>
      {/* Ambient red rim-light glow — layered depth, no image needed */}
      <div
        className='pointer-events-none absolute -top-24 end-[-10%] w-[70vw] max-w-3xl aspect-square rounded-full opacity-60 blur-3xl'
        style={{
          background:
            "radial-gradient(circle, rgba(232,17,45,0.22) 0%, rgba(232,17,45,0.05) 45%, transparent 70%)",
        }}
        aria-hidden='true'
      />

      <div className='relative mx-auto max-w-7xl'>
        <div
          className={cn(
            "grid items-stretch gap-0 rounded-2xl border border-white/10 bg-[#0c0c0c] overflow-hidden",
            "min-h-[70vh] md:min-h-[80vh] md:max-h-225",
            hasImage ? "md:grid-cols-2" : "",
          )}>
          {/* ── Text panel ── */}
          <div
            className={cn(
              "relative z-10 flex flex-col justify-center px-6 py-16 md:px-14 md:py-20 gap-7",
              !hasImage && "items-center text-center mx-auto max-w-3xl",
            )}>
            <div
              className={cn(
                "flex items-center gap-3",
                !hasImage && "justify-center",
              )}>
              <span className='w-8 h-px bg-[#E8112D]' aria-hidden='true' />
              <p
                className={cn(
                  "text-[11px] uppercase text-[#E8112D] font-medium",
                  track,
                  NOIR_DISPLAY_FONT_CLASSES,
                )}>
                {STORE_NAME}
              </p>
            </div>

            <h1
              className={cn(
                "uppercase text-white font-bold leading-[0.95]",
                "text-[clamp(2.75rem,7vw,6rem)]",
                isAr ? "" : "tracking-[0.01em]",
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
                  "group/cta inline-flex items-center justify-center gap-2 px-10 py-4 rounded-md",
                  "text-xs uppercase font-medium text-white transition-colors duration-300",
                  isAr ? "" : "tracking-[0.2em]",
                  NOIR_DISPLAY_FONT_CLASSES,
                  NOIR_ACCENT_BG_CLASSES,
                )}>
                {hero.ctaText || t("shop_now")}
                <ArrowRight
                  className='w-3.5 h-3.5 rtl:rotate-180 transition-transform duration-300 group-hover/cta:translate-x-1 rtl:group-hover/cta:-translate-x-1'
                  strokeWidth={1.5}
                />
              </a>
              <Link
                href='/shop'
                className={cn(
                  "inline-flex items-center justify-center gap-2 px-10 py-4 rounded-md",
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
            <div className='relative min-h-80 md:min-h-full bg-black order-last'>
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
              {/* Blend the panel edge into the dark canvas (both axes) */}
              <div
                className='absolute inset-0 pointer-events-none bg-linear-to-t from-black/50 via-transparent to-transparent'
                aria-hidden='true'
              />
              <div
                className='absolute inset-y-0 start-0 w-24 pointer-events-none bg-linear-to-r from-[#0c0c0c] to-transparent hidden md:block'
                aria-hidden='true'
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
