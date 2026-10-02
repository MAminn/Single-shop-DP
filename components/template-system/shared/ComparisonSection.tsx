import { Check, X } from "lucide-react";
import { Link } from "#root/components/utils/Link";
import type { HomepageContent } from "#root/shared/types/homepage-content";

type Locale = "en" | "ar";

export interface ComparisonSectionProps {
  content: HomepageContent["comparison"];
  locale: Locale;
  className?: string;
}

function resolveLocalized(
  locale: Locale,
  primary: string,
  arVariant?: string,
): string {
  if (locale === "ar") return (arVariant && arVariant.trim()) || primary || "";
  return primary || arVariant || "";
}

function resolveImageUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http")) return url;
  if (url.startsWith("/")) return url;
  return `/uploads/${url}`;
}

/**
 * "[Brand] vs Others" comparison section. Returns null when CMS content is
 * absent, disabled, or has no feature rows — no hard-coded fallback lives here.
 */
export function ComparisonSection({
  content,
  locale,
  className = "",
}: ComparisonSectionProps) {
  if (!content || !content.enabled || !content.features?.length) return null;

  const title = resolveLocalized(locale, content.title, content.titleAr);
  const subtitle = resolveLocalized(locale, content.subtitle, content.subtitleAr);
  const ctaText = resolveLocalized(locale, content.ctaText, content.ctaTextAr);
  const brandName = resolveLocalized(locale, content.brandName, content.brandNameAr);
  const brandLogoUrl = resolveImageUrl(content.brandLogoUrl);
  const othersLabel = resolveLocalized(
    locale,
    content.othersLabel,
    content.othersLabelAr,
  );

  return (
    <section
      dir={locale === "ar" ? "rtl" : "ltr"}
      className={`py-14 sm:py-20 bg-white ${className}`.trim()}>
      <div className='max-w-[1400px] mx-auto px-4 grid md:grid-cols-2 gap-10 md:gap-16 items-center'>
        <div className='text-center md:text-start'>
          <h2 className='font-mono text-2xl sm:text-3xl font-bold tracking-wide uppercase text-stone-900'>
            {title}
          </h2>
          {subtitle && (
            <p className='mt-3 text-stone-500 font-mono'>{subtitle}</p>
          )}
          {ctaText && (
            <Link href={content.ctaLink || "/shop"}>
              <span className='inline-block mt-6 px-6 py-3 bg-orange-500 hover:bg-orange-600 transition-colors text-white font-mono text-sm font-bold tracking-wide'>
                {ctaText}
              </span>
            </Link>
          )}
        </div>

        <div className='border border-stone-200 rounded-lg overflow-hidden'>
          <div className='grid grid-cols-2 px-6 py-3 border-b border-stone-200 bg-stone-50'>
            {brandLogoUrl ? (
              <img
                src={brandLogoUrl}
                alt={brandName}
                className='h-6 w-auto object-contain'
              />
            ) : (
              <span className='font-mono text-sm font-bold tracking-wide text-stone-900'>
                {brandName}
              </span>
            )}
            <span className='font-mono text-sm font-bold tracking-wide text-stone-900 text-end'>
              {othersLabel}
            </span>
          </div>
          {content.features.map((feature) => (
            <div
              key={feature.id}
              className='grid grid-cols-2 items-center px-6 py-4 border-b border-stone-100 last:border-b-0'>
              <div className='flex items-center gap-3'>
                <span className='flex items-center justify-center w-6 h-6 rounded-full bg-green-500 shrink-0'>
                  <Check className='w-4 h-4 text-white' strokeWidth={3} />
                </span>
                <span className='font-mono text-sm text-stone-800'>
                  {resolveLocalized(locale, feature.label, feature.labelAr)}
                </span>
              </div>
              <div className='flex justify-end'>
                <span className='flex items-center justify-center w-6 h-6 rounded-full bg-stone-100 shrink-0'>
                  <X className='w-4 h-4 text-stone-900' strokeWidth={3} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ComparisonSection;
