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
 * Displays a horizontal scrolling strip of category tiles with luxury styling.
 * Desktop: 4 tiles visible with gap, overflow auto
 * Mobile: Horizontal scroll with snap points
 */
export function CategoryStrip({ categories, className }: CategoryStripProps) {
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section className={cn("py-12 sm:py-16 lg:py-20 bg-white", className)}>
      <div className='container mx-auto px-6 sm:px-8 lg:px-12'>
        {/* Section Header */}
        <div className='mb-8 sm:mb-10'>
          <p className='text-[11px] uppercase tracking-[0.25em] text-stone-500 font-light'>
            Popular Categories
          </p>
        </div>

        {/* Horizontal Scrolling Container */}
        <div className='relative'>
          <div className='overflow-x-auto overflow-y-hidden scrollbar-hide snap-x snap-mandatory'>
            <div className='flex gap-4 lg:gap-5 min-w-min pb-2'>
              {categories.map((category) => (
                <CategoryTile key={category.id} category={category} />
              ))}
            </div>
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

  // Link to products page filtered by category
  const categoryLink = `/featured/products?category=${category.slug}`;

  return (
    <Link
      href={categoryLink}
      className={cn(
        "group relative block",
        "flex-shrink-0 snap-start snap-always",
        "w-[80vw] sm:w-[45vw] lg:w-[calc((100%-3*1.25rem)/4)]",
        "h-56 sm:h-64 lg:h-56",
        "rounded-2xl overflow-hidden",
        "focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2",
        "transition-all duration-200 ease-out",
      )}>
      {/* Background Image */}
      <div
        className={cn(
          "absolute inset-0 bg-stone-200",
          "transition-transform duration-200 ease-out",
          "group-hover:scale-105",
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
        {/* Fallback placeholder if no image */}
        {!imageUrl && (
          <div className='absolute inset-0 flex items-center justify-center'>
            <span className='text-stone-400 text-sm font-light uppercase tracking-wider'>
              {category.name}
            </span>
          </div>
        )}
      </div>

      {/* Gradient Overlay for Text Readability */}
      <div
        className={cn(
          "absolute inset-0",
          "bg-gradient-to-t from-black/60 via-black/20 to-transparent",
          "transition-all duration-200 ease-out",
          "group-hover:from-black/70 group-hover:via-black/30",
        )}
      />

      {/* Category Name */}
      <div className='absolute inset-x-0 bottom-0 p-6'>
        <h3 className='text-white text-base sm:text-lg font-normal uppercase tracking-[0.15em] leading-tight'>
          {category.name}
        </h3>
      </div>
    </Link>
  );
}

// Skeleton Loader
export function CategoryStripSkeleton() {
  return (
    <section className='py-12 sm:py-16 lg:py-20 bg-white'>
      <div className='container mx-auto px-6 sm:px-8 lg:px-12'>
        <div className='mb-8 sm:mb-10'>
          <div className='h-3 w-32 bg-stone-200 animate-pulse rounded' />
        </div>

        <div className='flex gap-4 lg:gap-5 overflow-hidden'>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className='flex-shrink-0 w-[80vw] sm:w-[45vw] lg:w-[calc((100%-3*1.25rem)/4)] h-56 sm:h-64 lg:h-56 bg-stone-200 animate-pulse rounded-2xl'
            />
          ))}
        </div>
      </div>
    </section>
  );
}

CategoryStrip.displayName = "CategoryStrip";
