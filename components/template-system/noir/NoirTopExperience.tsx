import type { HomepageHeroContent } from "#root/shared/types/homepage-content";
import type { HomepageFeaturedProductsContent } from "#root/shared/types/homepage-content";
import type { FeaturedProduct } from "../home/HomeFeaturedProducts";
import { cn } from "#root/lib/utils";
import { NoirNavbar } from "./NoirNavbar";
import { NoirHero } from "./NoirHero";
import { NoirBestSellers } from "./NoirBestSellers";
import {
  NOIR_FRAME_SHADOW_CLASSES,
  NOIR_FRAME_SURFACE_CLASSES,
} from "./noir-tokens";

interface NoirTopExperienceProps {
  /** Hero content (CMS) — forwarded to the embedded NoirHero. */
  hero: HomepageHeroContent;
  /** CTA click handler — forwarded to hero. */
  onCtaClick?: (link: string) => void;
  /** Featured-products section content (CMS) for the tucked-in best sellers. */
  bestSellersContent: HomepageFeaturedProductsContent;
  /** Featured products data (fetched dynamically). */
  featuredProducts?: FeaturedProduct[];
}

/**
 * NoirTopExperience — Noir landing "one framed composition".
 *
 * Wraps the embedded navbar, hero, and best-sellers row inside a single
 * premium glass frame so navbar → hero → cards read as one atmosphere.
 * The announcement bar stays OUTSIDE (rendered by NoirChrome); the global
 * navbar is suppressed via NoirChrome's `hideNavbar` on the landing.
 *
 * Everything is CMS/props-driven — this component adds only chrome
 * (frame surface + shared atmosphere glows) and forwards data through.
 */
export function NoirTopExperience({
  hero,
  onCtaClick,
  bestSellersContent,
  featuredProducts,
}: NoirTopExperienceProps) {
  return (
    <div className='px-3 md:px-8 pt-2 md:pt-4'>
      <div
        className={cn(
          "relative mx-auto max-w-350",
          "rounded-2xl md:rounded-3xl border border-white/10 overflow-hidden",
          NOIR_FRAME_SURFACE_CLASSES,
          NOIR_FRAME_SHADOW_CLASSES,
        )}>
        {/* Top-edge highlight — frame catchlight */}
        <div
          className='absolute inset-x-0 top-0 h-px z-20 pointer-events-none bg-linear-to-r from-transparent via-white/25 to-transparent'
          aria-hidden='true'
        />

        {/* Atmosphere layer — spans the WHOLE frame; this is what fuses the
            navbar, hero, and cards into one atmosphere. */}
        <div
          className='absolute inset-0 z-0 pointer-events-none overflow-hidden'
          aria-hidden='true'>
          {/* Red radial glow, bottom-start — bleeds under both the hero text
              and the first best-seller card. */}
          <div
            className='absolute bottom-[6%] -start-[6%] w-[55%] aspect-square rounded-full blur-3xl'
            style={{
              background:
                "radial-gradient(circle, rgba(232,17,45,0.15) 0%, transparent 70%)",
            }}
          />
          {/* Faint white radial, top-end. */}
          <div
            className='absolute -top-[10%] -end-[8%] w-[45%] aspect-square rounded-full blur-3xl'
            style={{
              background:
                "radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 70%)",
            }}
          />
        </div>

        {/* Composition — navbar row, hero, best sellers tucked beneath. */}
        <div className='relative z-10'>
          <NoirNavbar variant='embedded' />

          <NoirHero hero={hero} onCtaClick={onCtaClick} embedded />

          <NoirBestSellers
            content={bestSellersContent}
            products={featuredProducts}
            embedded
          />
        </div>
      </div>
    </div>
  );
}

NoirTopExperience.displayName = "NoirTopExperience";
