import type { HomepageFeaturedProductsContent } from "#root/shared/types/homepage-content";
import { ArrowRight } from "lucide-react";
import { useMinimalI18n } from "#root/lib/i18n/MinimalI18nContext";
import { cn } from "#root/lib/utils";
import { NoirReferenceProductCard } from "./NoirReferenceProductCard";
import type { NoirProduct } from "./ProductCardNoir";
import { NOIR_DISPLAY_FONT_CLASSES } from "./noir-tokens";
import { NOIR_REF, nu } from "./noir-reference-metrics";

/** The reference row is 4-up. */
const TOP_ROW_MAX = 4;

interface NoirReferenceBestSellersProps {
  content: HomepageFeaturedProductsContent;
  products?: NoirProduct[];
  isLoading?: boolean;
}

/** Skeleton mirroring NoirReferenceProductCard's geometry exactly. */
function NoirReferenceSkeletonCard() {
  const m = NOIR_REF.card;
  return (
    <div
      className='overflow-hidden bg-white/4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]'
      style={{ borderRadius: nu(m.radius) }}>
      <div
        className='animate-pulse bg-white/5'
        style={{ aspectRatio: m.imageAspect }}
      />
      <div
        className='flex flex-col items-center'
        style={{
          minHeight: nu(m.bodyMinHeight),
          paddingTop: nu(m.bodyPadTop),
          paddingBottom: nu(m.bodyPadBottom),
          paddingInline: `max(0.75rem, ${nu(m.bodyPadX)})`,
        }}>
        <div
          className='w-2/3 animate-pulse rounded bg-white/5'
          style={{ height: nu(m.nameLineHeight) }}
        />
        <div
          className='w-4/5 animate-pulse rounded bg-white/5'
          style={{ marginTop: nu(m.notesGap), height: nu(m.notesLineHeight) }}
        />
        <div
          className='w-1/3 animate-pulse rounded bg-white/5'
          style={{ marginTop: nu(m.priceGap), height: nu(m.priceLineHeight) }}
        />
        <div
          className='w-full animate-pulse bg-white/5'
          style={{
            marginTop: nu(m.ctaGap),
            height: nu(m.ctaHeight),
            borderRadius: nu(m.ctaRadius),
          }}
        />
      </div>
    </div>
  );
}

/**
 * NoirReferenceBestSellers — the product row of the Noir reference top frame.
 *
 * A dedicated row, not NoirProductSection: the shared section is also used by
 * New Arrivals and the product page's related row, and its gutter, heading
 * scale, gap and bottom rhythm all differ from the reference's.
 *
 * Reference geometry (1344px viewport, 1312px frame):
 *   heading      17px below the hero panel, 15.5px / 0.22em, centred
 *   rule         48 x 2 in #E8112D, 10.5px under the heading
 *   row          starts 6px under the rule, 70px gutter each side
 *   cards        4-up, 275 wide, 24px gap  ->  (1312 - 140 - 72) / 4 = 275
 *   bottom       the row finishes 16px above the frame's bottom edge
 *
 * The gutter/gap/track widths are all expressed against the frame, so a
 * 4-column grid with a 24px gap inside a 68px-inset container reproduces the
 * 275px card width exactly rather than approximating it.
 *
 * Heading copy and product data stay CMS/product-driven.
 */
export function NoirReferenceBestSellers({
  content,
  products = [],
  isLoading = false,
}: NoirReferenceBestSellersProps) {
  const { locale } = useMinimalI18n();
  const isAr = locale === "ar";
  const m = NOIR_REF.bestSellers;

  if (!content.enabled) return null;
  if (!isLoading && products.length === 0) return null;

  const title =
    (isAr && content.titleAr ? content.titleAr : content.title) ||
    (isAr ? "الأكثر مبيعاً" : "Best Sellers");
  const viewAllText =
    isAr && content.viewAllTextAr ? content.viewAllTextAr : content.viewAllText;
  const viewAllLink = content.viewAllLink || "/shop";

  const shown = products.slice(0, TOP_ROW_MAX);

  return (
    <section
      style={{
        paddingTop: nu(m.headingTop),
        paddingInline: `max(1rem, ${nu(m.gutter)})`,
      }}>
      {/* ── Heading + red rule ── */}
      <div className='flex flex-col items-center text-center'>
        <h2
          className={cn(
            "font-semibold uppercase leading-none text-white",
            isAr ? "" : "tracking-[0.22em]",
            NOIR_DISPLAY_FONT_CLASSES,
          )}
          style={{ fontSize: `max(13px, ${nu(m.headingSize)})` }}>
          {title}
        </h2>
        <span
          className='bg-[#E8112D]'
          style={{
            marginTop: nu(m.ruleGap),
            width: nu(m.ruleWidth),
            height: nu(m.ruleHeight),
          }}
          aria-hidden='true'
        />
      </div>

      {/* ── 4-up row ── */}
      <div
        className='grid grid-cols-2 md:grid-cols-4'
        style={{ marginTop: nu(m.rowGap), gap: nu(m.cardGap) }}>
        {isLoading
          ? Array.from({ length: TOP_ROW_MAX }, (_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeletons
              <NoirReferenceSkeletonCard key={i} />
            ))
          : shown.map((product) => (
              <NoirReferenceProductCard key={product.id} product={product} />
            ))}
      </div>

      {/* ── Optional view-all. Absent from the reference; renders only when
             the merchant fills it in, and never displaces the row. ── */}
      {viewAllText && (
        <div className='mt-6 flex justify-center'>
          <a
            href={viewAllLink}
            className={cn(
              "group/va inline-flex items-center gap-1.5 text-[11px] uppercase text-white/70",
              "transition-colors duration-300 hover:text-[#E8112D]",
              isAr ? "" : "tracking-[0.2em]",
              NOIR_DISPLAY_FONT_CLASSES,
            )}>
            {viewAllText}
            <ArrowRight
              className='h-3 w-3 transition-transform duration-300 rtl:rotate-180 group-hover/va:translate-x-1 rtl:group-hover/va:-translate-x-1'
              strokeWidth={1.5}
            />
          </a>
        </div>
      )}
    </section>
  );
}

NoirReferenceBestSellers.displayName = "NoirReferenceBestSellers";
