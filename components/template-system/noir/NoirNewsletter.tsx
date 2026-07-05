import type { HomepageNewsletterContent } from "#root/shared/types/homepage-content";
import { useMinimalI18n } from "#root/lib/i18n/MinimalI18nContext";
import { cn } from "#root/lib/utils";
import {
  NOIR_ACCENT_BG_CLASSES,
  NOIR_DISPLAY_FONT_CLASSES,
  NOIR_TEXT_MUTED_CLASSES,
  NOIR_TEXT_SECONDARY_CLASSES,
} from "./noir-tokens";

interface NoirNewsletterProps {
  newsletter: HomepageNewsletterContent;
}

/**
 * NoirNewsletter — dark band, uppercase heading, email input + red
 * submit. Uses the same submit path as the current landing templates:
 * the landing props contract exposes NO newsletter callback and the
 * existing templates' forms are preventDefault no-ops (known feature
 * gap — no subscription backend exists yet). No new backend calls.
 */
export function NoirNewsletter({ newsletter }: NoirNewsletterProps) {
  const { locale } = useMinimalI18n();
  const isAr = locale === "ar";
  const track = isAr ? "" : "tracking-[0.2em]";

  if (!newsletter.enabled) return null;

  return (
    <section className='px-4 md:px-8 py-12 md:py-20'>
      <div className='mx-auto max-w-7xl bg-[#101010] border border-white/10 rounded-xl px-6 py-14 md:py-16'>
        <div className='max-w-xl mx-auto text-center space-y-5'>
          <h2
            className={cn(
              "text-xl md:text-2xl uppercase font-semibold text-white",
              track,
              NOIR_DISPLAY_FONT_CLASSES,
            )}>
            {newsletter.title}
          </h2>
          {newsletter.subtitle && (
            <p
              className={cn(
                "text-sm leading-relaxed",
                NOIR_TEXT_SECONDARY_CLASSES,
              )}>
              {newsletter.subtitle}
            </p>
          )}
          <form
            onSubmit={(e) => e.preventDefault()}
            className='flex flex-col sm:flex-row items-stretch gap-3 pt-2'>
            <input
              type='email'
              required
              placeholder={
                newsletter.placeholderText ||
                (isAr ? "بريدك الإلكتروني" : "Your email address")
              }
              className='flex-1 bg-black border border-white/10 px-4 py-3 text-sm text-white placeholder:text-[#6B6B6B] rounded-md focus:outline-none focus:border-[#E8112D] transition-colors duration-300'
            />
            <button
              type='submit'
              className={cn(
                "px-8 py-3 rounded-md text-xs uppercase font-medium text-white transition-colors duration-300",
                track,
                NOIR_DISPLAY_FONT_CLASSES,
                NOIR_ACCENT_BG_CLASSES,
              )}>
              {newsletter.ctaText || (isAr ? "اشترك" : "Subscribe")}
            </button>
          </form>
          {newsletter.privacyText && (
            <p className={cn("text-xs", NOIR_TEXT_MUTED_CLASSES)}>
              {newsletter.privacyText}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
