import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "#root/components/utils/Link";
import { useMinimalI18n } from "#root/lib/i18n/MinimalI18nContext";
import { getProductUrl } from "#root/lib/utils/route-helpers";
import { cn } from "#root/lib/utils";
import { NoirImagePlaceholder, type NoirProduct } from "./ProductCardNoir";
import {
  NOIR_DISPLAY_FONT_CLASSES,
  NOIR_TEXT_MUTED_CLASSES,
  NOIR_TEXT_SECONDARY_CLASSES,
} from "./noir-tokens";

export interface NoirScentCardProps {
  product: NoirProduct;
  className?: string;
}

/** Resolve a stored image reference to a servable URL (mirrors ProductCardNoir). */
function resolveImageUrl(url?: string | null): string {
  if (!url) return "/assets/placeholder-product.png";
  if (url.startsWith("http") || url.startsWith("/")) return url;
  return `/uploads/${url}`;
}

/**
 * NoirScentCard — section-specific card for the Noir "Explore Scents"
 * category-products grid. Deliberately NOT the shared ProductCardNoir:
 * this is an explore/discovery card, not an add-to-cart commerce card.
 *
 * Reference-matched treatment:
 *  - sharp rectangular dark frame (hairline border, minimal radius)
 *  - large image panel on top
 *  - centered uppercase name
 *  - notes line (product.description → notes) when present
 *  - small mood/category label (categoryName / first category)
 *  - outline "EXPLORE SCENT" CTA with red arrow → product page
 *  - NO price, NO scent dots (no real intensity metadata)
 *
 * Fully product/CMS-driven — nothing is hardcoded except the localized
 * "EXPLORE SCENT" CTA label (UI chrome).
 */
export function NoirScentCard({ product, className }: NoirScentCardProps) {
  const { locale } = useMinimalI18n();
  const isAr = locale === "ar";
  const trackWide = isAr ? "" : "tracking-[0.18em]";
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const hasImageData = Boolean(
    (product.images && product.images.length > 0) || product.imageUrl,
  );

  const displayImageUrl = useMemo(() => {
    if (product.images && product.images.length > 0) {
      const primary = product.images.find((img) => img.isPrimary);
      return resolveImageUrl((primary || product.images[0])?.url);
    }
    return resolveImageUrl(product.imageUrl);
  }, [product.images, product.imageUrl]);

  // Mood / category label — real data only (primary categoryName, else first category).
  const moodLabel =
    product.categoryName || product.categories?.[0]?.name || null;

  const productUrl = getProductUrl(product.id);
  const ctaLabel = isAr ? "اكتشف العطر" : "Explore Scent";

  return (
    <div
      className={cn(
        // Sharp rectangular luxury frame — squarer corners than ProductCardNoir.
        "group relative flex flex-col overflow-hidden rounded-sm",
        "border border-white/10 bg-linear-to-b from-[#141414] to-[#0d0d0d]",
        "transition-all duration-300 hover:border-white/25",
        "hover:shadow-[0_18px_50px_-24px_rgba(232,17,45,0.45)]",
        className,
      )}>
      {/* Image panel — large, image-dominant top area */}
      <Link
        href={productUrl}
        className='block relative aspect-square overflow-hidden bg-linear-to-b from-white/5 via-white/2 to-transparent'>
        {!hasImageData || imageError ? (
          <NoirImagePlaceholder />
        ) : (
          <img
            src={displayImageUrl}
            alt={product.name}
            className={cn(
              "w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]",
              !imageLoaded && "opacity-0",
            )}
            loading='lazy'
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        )}
        {hasImageData && !imageError && (
          <div
            className='absolute inset-x-0 bottom-0 h-[30%] pointer-events-none bg-linear-to-t from-black/40 to-transparent'
            aria-hidden='true'
          />
        )}
      </Link>

      {/* Body — centered explore composition */}
      <div className='flex flex-1 flex-col items-center text-center gap-2.5 px-4 pt-5 pb-5'>
        {/* Name */}
        <Link href={productUrl}>
          <h3
            className={cn(
              "text-sm md:text-base uppercase text-white line-clamp-2",
              trackWide,
              NOIR_DISPLAY_FONT_CLASSES,
            )}>
            {product.name}
          </h3>
        </Link>

        {/* Notes line — from description; render only when present */}
        {product.notes && (
          <p
            className={cn(
              "w-full text-[11px] leading-relaxed line-clamp-2",
              NOIR_TEXT_SECONDARY_CLASSES,
            )}>
            {product.notes}
          </p>
        )}

        {/* Mood / category label */}
        {moodLabel && (
          <span
            className={cn(
              "text-[10px] uppercase",
              isAr ? "" : "tracking-[0.22em]",
              NOIR_TEXT_MUTED_CLASSES,
              NOIR_DISPLAY_FONT_CLASSES,
            )}>
            {moodLabel}
          </span>
        )}

        {/* CTA — outline "EXPLORE SCENT" with red arrow → product page */}
        <Link
          href={productUrl}
          className={cn(
            "group/cta mt-auto pt-1 flex w-full items-center justify-center gap-2",
            "border border-white/20 bg-transparent px-4 py-3 rounded-sm",
            "text-[11px] uppercase text-white/80",
            trackWide,
            NOIR_DISPLAY_FONT_CLASSES,
            "transition-all duration-300 hover:bg-[#E8112D] hover:border-[#E8112D] hover:text-white",
          )}>
          <span>{ctaLabel}</span>
          <ArrowRight
            className='w-3.5 h-3.5 text-[#E8112D] rtl:rotate-180 transition-all duration-300 group-hover/cta:text-white group-hover/cta:translate-x-1 rtl:group-hover/cta:-translate-x-1'
            strokeWidth={1.5}
          />
        </Link>
      </div>
    </div>
  );
}
