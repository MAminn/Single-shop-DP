import { ShoppingBag } from "lucide-react";
import type { HomepageBrandStatementContent } from "#root/shared/types/homepage-content";
import { VALUE_PROP_ICON_MAP } from "#root/components/template-system/shared/value-prop-icons";
import { useMinimalI18n } from "#root/lib/i18n/MinimalI18nContext";
import { cn } from "#root/lib/utils";
import { NoirImagePlaceholder } from "./ProductCardNoir";
import {
  NOIR_ACCENT_LINE,
  NOIR_DISPLAY_FONT_CLASSES,
  NOIR_SECTION_Y_LG,
  NOIR_TEXT_SECONDARY_CLASSES,
} from "./noir-tokens";

// Icon mapping — shared with other templates / the value-props strip.
const ICON_MAP = VALUE_PROP_ICON_MAP;

interface NoirWhyUsProps {
  brandStatement: HomepageBrandStatementContent;
}

type NoirBenefitItem = NonNullable<
  HomepageBrandStatementContent["benefits"]
>[number];

/**
 * NoirBenefitBlock — a single product benefit: circular hairline icon +
 * title + description. `align` controls whether the text hugs the icon on
 * the image side ("end" = text before icon on the right column) so the two
 * flanking columns mirror inward toward the central image on desktop.
 */
function NoirBenefitBlock({
  item,
  align,
  track,
}: {
  item: NoirBenefitItem;
  align: "start" | "end";
  track: string;
}) {
  const Icon = ICON_MAP[item.icon] ?? ShoppingBag;
  return (
    <div
      className={cn(
        "flex flex-col items-center text-center gap-3",
        // Desktop: inline icon-circle + text; right column mirrors (text-first).
        "lg:flex-row lg:items-center lg:gap-4",
        align === "end"
          ? "lg:flex-row-reverse lg:text-end"
          : "lg:text-start",
      )}>
      <span
        className='flex shrink-0 items-center justify-center w-12 h-12 rounded-full border border-white/15 bg-white/3'
        aria-hidden='true'>
        <Icon className='w-5 h-5 text-[#E8112D] stroke-[1.5]' />
      </span>
      <div className='flex flex-col gap-1'>
        <h3
          className={cn(
            "text-[11px] uppercase font-semibold text-white leading-tight",
            track,
            NOIR_DISPLAY_FONT_CLASSES,
          )}>
          {item.title}
        </h3>
        {item.description && (
          <p
            className={cn(
              "text-xs leading-relaxed line-clamp-3 max-w-55",
              NOIR_TEXT_SECONDARY_CLASSES,
            )}>
            {item.description}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * NoirWhyUs — brand statement centerpiece. When product-specific
 * `brandStatement.benefits` are present, it renders the "Why Solid Is
 * Better"-style composition: centered eyebrow + heading + subtitle, a
 * central statement image, flanked by benefit items split left/right on
 * desktop. When no benefits exist it gracefully falls back to the plain
 * centered statement (heading + description + image).
 *
 * These benefits are PRODUCT-specific and live on brandStatement — they are
 * intentionally NOT the store/brand promises from `valueProps`
 * (NoirBenefitsStrip). Renders nothing when disabled. Fully CMS-driven.
 */
export function NoirWhyUs({ brandStatement }: NoirWhyUsProps) {
  const { locale } = useMinimalI18n();
  const isAr = locale === "ar";
  const track = isAr ? "" : "tracking-[0.14em]";
  const microTrack = isAr ? "" : "tracking-[0.18em]";

  if (!brandStatement.enabled) return null;

  const hasImage = Boolean(brandStatement.image);
  const benefits = brandStatement.benefits ?? [];
  const hasBenefits = benefits.length > 0;

  // Split benefits into two mirrored columns around the central image.
  const half = Math.ceil(benefits.length / 2);
  const leftItems = benefits.slice(0, half);
  const rightItems = benefits.slice(half);

  return (
    <section className={cn("relative overflow-hidden", NOIR_SECTION_Y_LG)}>
      {/* Ambient red glow anchored behind the statement */}
      <div
        className='pointer-events-none absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] max-w-2xl aspect-square rounded-full opacity-40 blur-3xl'
        style={{
          background:
            "radial-gradient(circle, rgba(232,17,45,0.16) 0%, transparent 68%)",
        }}
        aria-hidden='true'
      />

      <div className='relative mx-auto max-w-7xl px-4 md:px-8'>
        {/* Header — eyebrow, heading, subtitle (always centered) */}
        <div className='flex flex-col items-center text-center gap-5'>
          {brandStatement.eyebrow ? (
            <p
              className={cn(
                "text-[11px] uppercase text-[#E8112D] font-medium",
                microTrack,
                NOIR_DISPLAY_FONT_CLASSES,
              )}>
              {brandStatement.eyebrow}
            </p>
          ) : (
            <div className={cn(NOIR_ACCENT_LINE, "mx-auto")} aria-hidden='true' />
          )}

          <h2
            className={cn(
              "text-3xl md:text-5xl uppercase font-semibold text-white leading-[1.05] max-w-3xl",
              track,
              NOIR_DISPLAY_FONT_CLASSES,
            )}>
            {brandStatement.title}
          </h2>

          {brandStatement.description && (
            <p
              className={cn(
                "text-sm md:text-base leading-relaxed max-w-xl",
                NOIR_TEXT_SECONDARY_CLASSES,
              )}>
              {brandStatement.description}
            </p>
          )}
        </div>

        {hasBenefits ? (
          /* Composition: left column / central image / right column */
          <div className='mt-12 md:mt-16 grid grid-cols-1 lg:grid-cols-[1fr_minmax(0,1.15fr)_1fr] gap-10 lg:gap-8 items-center'>
            {/* Left benefits */}
            <div className='flex flex-col gap-10 order-2 lg:order-1'>
              {leftItems.map((item) => (
                <NoirBenefitBlock
                  key={item.title}
                  item={item}
                  align='end'
                  track={microTrack}
                />
              ))}
            </div>

            {/* Central image — free product shot: no card/frame, contained
                (never cropped), its dark background blends into the section. */}
            <div className='order-1 lg:order-2 flex justify-center'>
              {hasImage ? (
                <div className='relative w-full max-w-2xl aspect-4/3'>
                  <img
                    src={brandStatement.image}
                    alt={brandStatement.title}
                    className='w-full h-full object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)] [mask-image:radial-gradient(ellipse_75%_75%_at_center,#000_55%,transparent_100%)] [-webkit-mask-image:radial-gradient(ellipse_75%_75%_at_center,#000_55%,transparent_100%)]'
                    loading='lazy'
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  {/* Behind the image: shows only if the image fails to load */}
                  <div className='absolute inset-0 -z-10 rounded-2xl overflow-hidden'>
                    <NoirImagePlaceholder />
                  </div>
                </div>
              ) : (
                <div className='relative w-full max-w-2xl aspect-4/3 rounded-2xl overflow-hidden'>
                  <NoirImagePlaceholder />
                </div>
              )}
            </div>

            {/* Right benefits */}
            <div className='flex flex-col gap-10 order-3'>
              {rightItems.map((item) => (
                <NoirBenefitBlock
                  key={item.title}
                  item={item}
                  align='start'
                  track={microTrack}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Fallback: plain centered statement image (original behaviour) */
          hasImage && (
            <div className='mt-8 flex justify-center'>
              <div className='w-full max-w-md'>
                <div className='relative aspect-video bg-[#101010] border border-white/10 rounded-xl overflow-hidden'>
                  <img
                    src={brandStatement.image}
                    alt={brandStatement.title}
                    className='w-full h-full object-cover'
                    loading='lazy'
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <div className='absolute inset-0 -z-10'>
                    <NoirImagePlaceholder />
                  </div>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
}
