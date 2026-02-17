import type React from "react";
import { Link } from "#root/components/utils/Link";
import { cn } from "#root/lib/utils";

export interface CategoryStripItem {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
}

export interface CategoryStripProps {
  categories: CategoryStripItem[];
  className?: string;
}

/**
 * CategoryStrip Component
 *
 * Full-bleed editorial category tiles inspired by luxury jewelry lookbooks.
 * Desktop: Seamless row of tall portrait tiles
 * Mobile: Horizontal scroll with snap points
 */
export function CategoryStrip({ categories, className }: CategoryStripProps) {
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section className={cn("bg-white", className)}>
      {/* Near-full-bleed — minimal horizontal padding */}
      <div className='p-1'>
        {/* Horizontal scroll on mobile, seamless row on desktop */}
        <div className='overflow-x-auto  scrollbar-hide snap-x snap-mandatory'>
          <div className='flex gap-0.75 sm:gap-1'>
            {categories.map((category) => (
              <CategoryTile key={category.id} category={category} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

interface CategoryTileProps {
  category: CategoryStripItem;
}

function CategoryTile({ category }: CategoryTileProps) {
  const imageUrl = category.imageUrl?.startsWith("http")
    ? category.imageUrl
    : category.imageUrl
      ? `/uploads/${category.imageUrl}`
      : null;

  const categoryLink = `/shop?category=${category.slug}`;

  return (
    <Link
      href={categoryLink}
      className={cn(
        "group relative block",
        "shrink-0 snap-start snap-always",
        "w-[78vw] sm:w-[44vw] lg:flex-1",
        "h-[50vh] sm:h-[36vh] lg:h-[50vh]",
        "overflow-hidden",
        "focus:outline-none focus:ring-1 focus:ring-stone-300 focus:ring-offset-1",
      )}>
      {/* Background Image — slow cinematic zoom on hover */}
      <div
        className={cn(
          "absolute inset-0 bg-stone-50",
          "transition-transform duration-900 ease-out will-change-transform",
          "group-hover:scale-[1.04]",
        )}
        style={
          imageUrl
            ? {
                backgroundImage: `url(${imageUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }>
        {/* Neutral fallback — centered minimal type */}
        {!imageUrl && (
          <div className='absolute inset-0 bg-stone-50 flex items-center justify-center'>
            <span className='text-stone-300 text-[11px] font-light uppercase tracking-[0.25em]'>
              {category.name}
            </span>
          </div>
        )}
      </div>

      {/* Feather-light bottom vignette for text legibility */}
      {imageUrl && (
        <div
          className={cn(
            "absolute inset-0",
            "bg-linear-to-t from-black/30 via-transparent to-transparent",
            "transition-opacity duration-500 ease-out",
            "group-hover:from-black/35",
          )}
        />
      )}

      {/* Category label — bottom-left, editorial uppercase */}
      <div className='absolute inset-x-0 bottom-0 px-6 pb-7 sm:px-8 sm:pb-9'>
        <h3 className='text-white/90 text-[12px] sm:text-[13px] font-light uppercase tracking-[0.22em] leading-none'>
          {category.name}
        </h3>
      </div>
    </Link>
  );
}

// Skeleton Loader
export function CategoryStripSkeleton() {
  return (
    <section className='bg-white'>
      <div className='px-0.75 sm:px-1'>
        <div className='flex gap-0.75 sm:gap-1 overflow-hidden'>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className='shrink-0 w-[78vw] sm:w-[44vw] lg:flex-1 h-[50vh] sm:h-[36vh] lg:h-[38vh] bg-stone-50 animate-pulse'
            />
          ))}
        </div>
      </div>
    </section>
  );
}

CategoryStrip.displayName = "CategoryStrip";
