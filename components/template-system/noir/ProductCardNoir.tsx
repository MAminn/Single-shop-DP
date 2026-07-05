import { useMemo, useState } from "react";
import { ArrowRight, Star } from "lucide-react";
import { Link } from "#root/components/utils/Link";
import { useMinimalI18n } from "#root/lib/i18n/MinimalI18nContext";
import { getProductUrl } from "#root/lib/utils/route-helpers";
import { cn } from "#root/lib/utils";
import { formatNoirPrice } from "./format-price";
import {
  NOIR_CARD_CLASSES,
  NOIR_CARD_HOVER_CLASSES,
  NOIR_DISPLAY_FONT_CLASSES,
  NOIR_TEXT_MUTED_CLASSES,
  NOIR_TEXT_SECONDARY_CLASSES,
} from "./noir-tokens";

/* ------------------------------------------------------------------ */
/*  Types — compatible with FeaturedProduct / SortingPageProduct       */
/* ------------------------------------------------------------------ */

interface ProductImage {
  url: string;
  isPrimary?: boolean;
}

export interface NoirProduct {
  id: string;
  name: string;
  price: number;
  /** Discounted price — when set and lower than `price`, `price` is shown struck-through. */
  discountPrice?: number | string | null;
  /** Explicit original price alternative (e.g. compare-at). Takes effect when > price. */
  originalPrice?: number | null;
  stock?: number;
  imageUrl?: string | null;
  images?: ProductImage[];
  available?: boolean;
  categoryName?: string | null;
  categories?: { id: string; name: string }[];
  rating?: number;
  reviewCount?: number;
  /** "new" | "bestseller" | any custom label. */
  badge?: string;
  /** Short descriptor line under the name. */
  notes?: string;
}

export interface ProductCardNoirProps {
  product: NoirProduct;
  onAddToCart?: (product: NoirProduct) => void;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function resolveImageUrl(url?: string | null): string {
  if (!url) return "/assets/placeholder-product.png";
  if (url.startsWith("http") || url.startsWith("/")) return url;
  return `/uploads/${url}`;
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

/**
 * ProductCardNoir — Noir (Demo 5) product card.
 *
 * Dark glass card: #141414 surface, white/10 hairline border that
 * brightens on hover with a slight lift, solid red badge, condensed
 * uppercase display-font name, red stars (only when rating data
 * exists), formatNoirPrice() pricing, full-width outline CTA.
 *
 * Nothing renders this yet — Noir pages consume it in Phases 2-4.
 */
export function ProductCardNoir({
  product,
  onAddToCart,
  className,
}: ProductCardNoirProps) {
  const { t, locale } = useMinimalI18n();
  const isAr = locale === "ar";
  // Letter-spacing gated off for Arabic (rule 8)
  const trackWide = isAr ? "" : "tracking-[0.18em]";
  const [imageLoaded, setImageLoaded] = useState(false);

  const displayImageUrl = useMemo(() => {
    if (product.images && product.images.length > 0) {
      const primary = product.images.find((img) => img.isPrimary);
      return resolveImageUrl((primary || product.images[0])?.url);
    }
    return resolveImageUrl(product.imageUrl);
  }, [product.images, product.imageUrl]);

  // Pricing — same discount semantics as existing cards
  const hasDiscount =
    product.discountPrice !== undefined &&
    product.discountPrice !== null &&
    product.discountPrice !== "" &&
    Number(product.discountPrice) < product.price;

  const displayPrice = hasDiscount
    ? Number(product.discountPrice)
    : product.price;
  const struckPrice = hasDiscount
    ? product.price
    : product.originalPrice != null && product.originalPrice > product.price
      ? product.originalPrice
      : null;

  // Badge — map known values through i18n, pass custom strings as-is
  const badgeText =
    product.badge === "new"
      ? t("new")
      : product.badge === "bestseller"
        ? t("best_seller")
        : product.badge || null;

  const productUrl = getProductUrl(product.id);
  const hasRating = typeof product.rating === "number" && product.rating > 0;

  const ctaClasses = cn(
    "flex w-full items-center justify-center gap-2 border border-white/20 bg-transparent",
    "px-4 py-2.5 text-xs uppercase text-white/80 rounded-md",
    trackWide,
    NOIR_DISPLAY_FONT_CLASSES,
    "transition-colors duration-300 hover:border-white/50 hover:text-white",
  );

  const ctaContent = (
    <>
      <span>{t("add_to_cart")}</span>
      <ArrowRight className='w-3.5 h-3.5 rtl:rotate-180' strokeWidth={1.5} />
    </>
  );

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden",
        NOIR_CARD_CLASSES,
        NOIR_CARD_HOVER_CLASSES,
        className,
      )}>
      {/* Badge */}
      {badgeText && (
        <span
          className={cn(
            "absolute top-3 start-3 z-10 bg-[#E8112D] text-white uppercase",
            "text-[10px] font-medium px-2.5 py-1",
            isAr ? "" : "tracking-[0.2em]",
          )}>
          {badgeText}
        </span>
      )}

      {/* Image */}
      <Link
        href={productUrl}
        className='block relative aspect-square bg-black overflow-hidden'>
        <img
          src={displayImageUrl}
          alt={product.name}
          className={cn(
            "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105",
            !imageLoaded && "opacity-0",
          )}
          loading='lazy'
          onLoad={() => setImageLoaded(true)}
        />
      </Link>

      {/* Body */}
      <div className='flex flex-1 flex-col gap-2 p-4'>
        {/* Name */}
        <Link href={productUrl}>
          <h3
            className={cn(
              "text-sm uppercase text-white line-clamp-2",
              trackWide,
              NOIR_DISPLAY_FONT_CLASSES,
            )}>
            {product.name}
          </h3>
        </Link>

        {/* Notes / descriptor */}
        {product.notes && (
          <p className={cn("text-xs truncate", NOIR_TEXT_SECONDARY_CLASSES)}>
            {product.notes}
          </p>
        )}

        {/* Rating — render ONLY when rating data exists */}
        {hasRating && (
          <div className='flex items-center gap-1.5'>
            <div className='flex items-center gap-0.5'>
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-3 h-3",
                    i <= Math.round(product.rating as number)
                      ? "fill-[#E8112D] text-[#E8112D]"
                      : "text-white/15",
                  )}
                  strokeWidth={1.5}
                />
              ))}
            </div>
            {typeof product.reviewCount === "number" && (
              <span className={cn("text-[11px]", NOIR_TEXT_MUTED_CLASSES)}>
                ({product.reviewCount})
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div className='flex items-baseline gap-2 mt-auto pt-1'>
          <span className='text-sm font-medium text-white'>
            {formatNoirPrice(displayPrice)}
          </span>
          {struckPrice !== null && (
            <span
              className={cn("text-xs line-through", NOIR_TEXT_MUTED_CLASSES)}>
              {formatNoirPrice(struckPrice)}
            </span>
          )}
        </div>

        {/* CTA — wire onAddToCart if provided, otherwise navigate to product */}
        {onAddToCart ? (
          <button
            type='button'
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAddToCart(product);
            }}
            className={ctaClasses}>
            {ctaContent}
          </button>
        ) : (
          <Link href={productUrl} className={ctaClasses}>
            {ctaContent}
          </Link>
        )}
      </div>
    </div>
  );
}
