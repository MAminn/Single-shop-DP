import { Link } from "#root/components/utils/Link";
import { ArrowRight } from "lucide-react";
import { useMinimalI18n } from "#root/lib/i18n/MinimalI18nContext";
import { cn } from "#root/lib/utils";
import { ProductCardNoir, type NoirProduct } from "./ProductCardNoir";
import { NOIR_DISPLAY_FONT_CLASSES } from "./noir-tokens";

interface NoirProductSectionProps {
  title: string;
  viewAllText?: string;
  viewAllLink?: string;
  products: NoirProduct[];
  isLoading?: boolean;
  maxProducts?: number;
}

function SkeletonCard() {
  return (
    <div className='bg-[#141414] border border-white/10 rounded-lg overflow-hidden'>
      <div className='aspect-square bg-white/5 animate-pulse' />
      <div className='p-4 space-y-3'>
        <div className='h-3 w-3/4 bg-white/5 rounded animate-pulse' />
        <div className='h-3 w-1/3 bg-white/5 rounded animate-pulse' />
        <div className='h-9 w-full bg-white/5 rounded animate-pulse' />
      </div>
    </div>
  );
}

/**
 * NoirProductSection — shared layout for Noir product rows
 * (Best Sellers, Explore grid): uppercase title with red underline
 * accent + view-all link, then a 4-up desktop grid.
 *
 * Mobile: horizontal snap scroll for LTR. For Arabic (RTL) we use a
 * 2-column grid on mobile instead — RTL horizontal snap scrolling is
 * inconsistent across mobile browsers (the known RTL carousel quirk),
 * so we deliberately avoid fighting it. Documented per Phase 2 / 3c.
 */
export function NoirProductSection({
  title,
  viewAllText,
  viewAllLink,
  products,
  isLoading = false,
  maxProducts = 4,
}: NoirProductSectionProps) {
  const { locale } = useMinimalI18n();
  const isAr = locale === "ar";
  const track = isAr ? "" : "tracking-[0.14em]";

  if (!isLoading && products.length === 0) return null;

  const shown = products.slice(0, maxProducts);

  return (
    <section className='px-4 md:px-8 py-10 md:py-14'>
      <div className='mx-auto max-w-7xl'>
        {/* ── Header ── */}
        <div className='flex items-end justify-between gap-4 mb-8'>
          <div>
            <h2
              className={cn(
                "text-2xl md:text-3xl uppercase font-semibold text-white",
                track,
                NOIR_DISPLAY_FONT_CLASSES,
              )}>
              {title}
            </h2>
            <div className='w-12 h-0.5 bg-[#E8112D] mt-3' aria-hidden='true' />
          </div>
          {viewAllText && viewAllLink && (
            <Link
              href={viewAllLink}
              className={cn(
                "inline-flex items-center gap-1.5 text-[11px] uppercase text-white/70",
                "hover:text-[#E8112D] transition-colors duration-300 shrink-0 pb-1",
                isAr ? "" : "tracking-[0.2em]",
                NOIR_DISPLAY_FONT_CLASSES,
              )}>
              {viewAllText}
              <ArrowRight
                className='w-3 h-3 rtl:rotate-180'
                strokeWidth={1.5}
              />
            </Link>
          )}
        </div>

        {/* ── Products ── */}
        {isLoading ? (
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6'>
            {Array.from({ length: maxProducts }, (_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeletons
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : isAr ? (
          /* RTL: 2-col grid on mobile, 4-up desktop (no snap carousel) */
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6'>
            {shown.map((product) => (
              <ProductCardNoir key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <>
            {/* LTR mobile: horizontal snap scroll */}
            <div className='flex md:hidden gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4 pb-2'>
              {shown.map((product) => (
                <ProductCardNoir
                  key={product.id}
                  product={product}
                  className='w-64 shrink-0 snap-start'
                />
              ))}
            </div>
            {/* Desktop: 4-up grid */}
            <div className='hidden md:grid md:grid-cols-4 gap-6'>
              {shown.map((product) => (
                <ProductCardNoir key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
