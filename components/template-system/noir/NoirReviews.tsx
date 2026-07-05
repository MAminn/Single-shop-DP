import { Star } from "lucide-react";
import type { HomepageContent } from "#root/shared/types/homepage-content";
import { useMinimalI18n } from "#root/lib/i18n/MinimalI18nContext";
import { cn } from "#root/lib/utils";
import {
  NOIR_CARD_CLASSES,
  NOIR_DISPLAY_FONT_CLASSES,
  NOIR_TEXT_MUTED_CLASSES,
  NOIR_TEXT_SECONDARY_CLASSES,
} from "./noir-tokens";

interface NoirReviewsProps {
  testimonials: HomepageContent["testimonials"];
}

function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            "w-3.5 h-3.5",
            i <= Math.round(rating)
              ? "fill-[#E8112D] text-[#E8112D]"
              : "text-white/15",
          )}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

/**
 * NoirReviews — CMS testimonials. Aggregate header (average stars
 * computed from ACTUAL testimonial ratings + actual count — hidden when
 * no items exist), then a card row of quote / red stars / name with
 * locale-appropriate EN/AR fields. No video thumbnails (no media field
 * exists in the CMS shape yet — deferred).
 */
export function NoirReviews({ testimonials }: NoirReviewsProps) {
  const { locale } = useMinimalI18n();
  const isAr = locale === "ar";
  const track = isAr ? "" : "tracking-[0.14em]";

  if (!testimonials?.enabled || testimonials.items.length === 0) return null;

  const items = testimonials.items;
  const count = items.length;
  // Aggregate computed from actual CMS data — never fabricated
  const average =
    items.reduce((sum, item) => sum + (Number(item.rating) || 0), 0) / count;

  const title =
    (isAr && testimonials.titleAr
      ? testimonials.titleAr
      : testimonials.title) ||
    (isAr ? "آراء عملائنا" : "What Our Customers Say");

  return (
    <section className='px-4 md:px-8 py-12 md:py-20'>
      <div className='mx-auto max-w-7xl'>
        {/* ── Aggregate header ── */}
        <div className='text-center space-y-3 mb-10 md:mb-14'>
          <h2
            className={cn(
              "text-2xl md:text-3xl uppercase font-semibold text-white",
              track,
              NOIR_DISPLAY_FONT_CLASSES,
            )}>
            {title}
          </h2>
          <div className='flex items-center justify-center gap-3'>
            <Stars rating={average} />
            <span className='text-sm text-white font-medium'>
              {average.toFixed(1)}
            </span>
            <span className={cn("text-xs", NOIR_TEXT_MUTED_CLASSES)}>
              {isAr
                ? `${count} تقييم`
                : `${count} review${count === 1 ? "" : "s"}`}
            </span>
          </div>
        </div>

        {/* ── Cards ── */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6'>
          {items.slice(0, 6).map((item) => {
            const review = isAr && item.reviewAr ? item.reviewAr : item.review;
            const name = isAr && item.nameAr ? item.nameAr : item.name;
            return (
              <figure
                key={`${item.name}-${item.review.slice(0, 24)}`}
                className={cn("p-6 flex flex-col gap-4", NOIR_CARD_CLASSES)}>
                <Stars rating={Number(item.rating) || 0} />
                <blockquote
                  className={cn(
                    "text-sm leading-relaxed flex-1",
                    NOIR_TEXT_SECONDARY_CLASSES,
                  )}>
                  &ldquo;{review}&rdquo;
                </blockquote>
                <figcaption
                  className={cn(
                    "text-[11px] uppercase font-medium text-white",
                    isAr ? "" : "tracking-[0.18em]",
                    NOIR_DISPLAY_FONT_CLASSES,
                  )}>
                  {name}
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
