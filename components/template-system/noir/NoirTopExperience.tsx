import type { HomepageHeroContent } from "#root/shared/types/homepage-content";
import type { HomepageFeaturedProductsContent } from "#root/shared/types/homepage-content";
import type { FeaturedProduct } from "../home/HomeFeaturedProducts";
import { cn } from "#root/lib/utils";
import { NoirNavbar } from "./NoirNavbar";
import { NoirHero, getNoirHeroImage } from "./NoirHero";
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
 * Everything is CMS/props-driven — this component adds only chrome. Its
 * atmosphere is the SAME CMS hero image already flowing into the landing:
 * a heavily blurred, dimmed copy spanning the whole frame supplies the
 * warmth/tint that fuses navbar → hero → cards into one composition. When
 * no CMS hero image exists it gracefully falls back to the gradient surface.
 */
export function NoirTopExperience({
  hero,
  onCtaClick,
  bestSellersContent,
  featuredProducts,
}: NoirTopExperienceProps) {
  // Same resolution NoirHero performs — shared, not duplicated.
  const atmosphereImage = getNoirHeroImage(hero);
  const hasAtmosphere = Boolean(atmosphereImage);

  return (
    <div className='px-3 md:px-8 pt-2 md:pt-4'>
      <div
        className={cn(
          "relative mx-auto max-w-350",
          "rounded-2xl md:rounded-3xl border border-white/10 overflow-hidden",
          NOIR_FRAME_SHADOW_CLASSES,
          // L0 base floor: solid #0a0a0a under the atmosphere image; when no
          // hero image exists, keep the original gradient surface as fallback.
          hasAtmosphere ? "bg-[#0a0a0a]" : NOIR_FRAME_SURFACE_CLASSES,
        )}>
        {/* L1 — atmosphere image: the CMS hero image, heavily blurred + dimmed
            (scale-110 hides the blurred edges), supplying all the frame's
            warmth/tint. Lazy + decorative so it never competes with the
            hero's sharp LCP image. Only rendered when a hero image exists. */}
        {hasAtmosphere && (
          <div
            className='absolute inset-0 z-0 overflow-hidden pointer-events-none'
            aria-hidden='true'>
            <img
              src={atmosphereImage}
              alt=''
              aria-hidden='true'
              loading='lazy'
              className='absolute inset-0 w-full h-full object-cover blur-[28px] scale-110 opacity-35'
            />
          </div>
        )}

        {/* L2 — dark scrim: keeps the atmosphere faint behind the navbar,
            subtle behind the hero text, and barely-there behind the Best
            Sellers cards. */}
        <div
          className='absolute inset-0 z-0 pointer-events-none'
          style={{
            background:
              "linear-gradient(to bottom, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0.75) 50%, rgba(10,10,10,0.92) 100%)",
          }}
          aria-hidden='true'
        />

        {/* L3 — top-edge hairline highlight (frame catchlight) */}
        <div
          className='absolute inset-x-0 top-0 h-px z-20 pointer-events-none bg-linear-to-r from-transparent via-white/25 to-transparent'
          aria-hidden='true'
        />

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
