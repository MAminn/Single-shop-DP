import type { MouseEvent } from "react";
import { ArrowRight } from "lucide-react";
import type { HomepageFooterCtaContent } from "#root/shared/types/homepage-content";
import { useMinimalI18n } from "#root/lib/i18n/MinimalI18nContext";
import { cn } from "#root/lib/utils";
import {
  NOIR_ACCENT_BG_CLASSES,
  NOIR_DISPLAY_FONT_CLASSES,
  NOIR_TEXT_SECONDARY_CLASSES,
} from "./noir-tokens";

interface NoirFooterCtaProps {
  footerCta: HomepageFooterCtaContent;
  onCtaClick?: (link: string) => void;
}

/**
 * NoirFooterCta — full-width closing CTA band mapped from the CMS
 * footerCta fields. Renders nothing when disabled.
 */
export function NoirFooterCta({ footerCta, onCtaClick }: NoirFooterCtaProps) {
  const { locale } = useMinimalI18n();
  const isAr = locale === "ar";
  const track = isAr ? "" : "tracking-[0.2em]";

  if (!footerCta.enabled) return null;

  const link = footerCta.ctaLink || "/shop";
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (onCtaClick) {
      e.preventDefault();
      onCtaClick(link);
    }
  };

  return (
    <section className='border-t border-white/10 bg-black'>
      <div className='mx-auto max-w-7xl px-4 md:px-8 py-16 md:py-24 text-center space-y-6'>
        <div className='w-12 h-0.5 bg-[#E8112D] mx-auto' aria-hidden='true' />
        <h2
          className={cn(
            "text-3xl md:text-5xl uppercase font-semibold text-white max-w-3xl mx-auto leading-[1.1]",
            isAr ? "" : "tracking-[0.04em]",
            NOIR_DISPLAY_FONT_CLASSES,
          )}>
          {footerCta.title}
        </h2>
        {footerCta.subtitle && (
          <p
            className={cn(
              "text-sm md:text-base leading-relaxed max-w-xl mx-auto",
              NOIR_TEXT_SECONDARY_CLASSES,
            )}>
            {footerCta.subtitle}
          </p>
        )}
        {footerCta.ctaText && (
          <a
            href={link}
            onClick={handleClick}
            className={cn(
              "inline-flex items-center justify-center gap-2 px-10 py-4 rounded-md",
              "text-xs uppercase font-medium text-white transition-colors duration-300",
              track,
              NOIR_DISPLAY_FONT_CLASSES,
              NOIR_ACCENT_BG_CLASSES,
            )}>
            {footerCta.ctaText}
            <ArrowRight
              className='w-3.5 h-3.5 rtl:rotate-180'
              strokeWidth={1.5}
            />
          </a>
        )}
      </div>
    </section>
  );
}
