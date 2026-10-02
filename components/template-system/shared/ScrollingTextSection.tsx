import type { CSSProperties } from "react";
import type { HomepageContent } from "#root/shared/types/homepage-content";

type Locale = "en" | "ar";

export interface ScrollingTextSectionProps {
  content: HomepageContent["scrollingText"];
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

/**
 * Infinitely-looping vertical scrolling text banner. Returns null when CMS
 * content is absent, disabled, or empty — no hard-coded fallback lives here.
 */
export function ScrollingTextSection({
  content,
  locale,
  className = "",
}: ScrollingTextSectionProps) {
  if (!content || !content.enabled || !content.items?.length) return null;

  // Repeat items so the track is always tall enough for the viewport and the
  // translateY(-50%) seam is invisible, same technique as the horizontal
  // testimonials marquee.
  const MIN_PER_HALF = 6;
  const repeatCount = Math.ceil(MIN_PER_HALF / content.items.length);
  const singleSet = Array.from({ length: repeatCount }, () => content.items).flat();
  const loopItems = [...singleSet, ...singleSet];

  const duration = content.speedSeconds ?? singleSet.length * 4;

  return (
    <section
      dir={locale === "ar" ? "rtl" : "ltr"}
      className={`bg-stone-950 overflow-hidden ${className}`.trim()}>
      <div
        className='relative h-[420px] sm:h-[560px]'
        style={{
          maskImage:
            "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)",
        }}>
        <div
          className='absolute inset-x-0 top-0 flex flex-col items-center animate-marquee-vertical-half'
          style={{ "--marquee-duration": `${duration}s` } as CSSProperties}>
          {loopItems.map((item, i) => (
            <p
              key={i}
              className='font-mono text-2xl sm:text-4xl font-medium tracking-wide text-stone-300/80 py-0.5 sm:py-1 whitespace-nowrap'>
              {resolveLocalized(locale, item.text, item.textAr)}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ScrollingTextSection;
