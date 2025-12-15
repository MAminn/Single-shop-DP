import type React from "react";
import { Button } from "#root/components/ui/button";
import { HomeFeaturedProducts } from "../home/HomeFeaturedProducts";
import type { FeaturedProduct } from "../home/HomeFeaturedProducts";
import {
  ShoppingBag,
  Truck,
  Shield,
  Headphones,
  Award,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import type {
  HomepageContent,
  ValuePropIconType,
} from "#root/shared/types/homepage-content";

/**
 * Props for the LandingTemplateMinimal component
 */
export interface LandingTemplateMinimalProps {
  /**
   * Homepage content (editable by merchants)
   */
  content: HomepageContent;

  /**
   * Featured products data (fetched dynamically)
   */
  featuredProducts?: FeaturedProduct[];

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Callback when any CTA button is clicked
   */
  onCtaClick?: (link: string) => void;
}

// Icon mapping for value propositions
const ICON_MAP: Record<
  ValuePropIconType,
  React.ComponentType<{ className?: string }>
> = {
  shopping: ShoppingBag,
  shipping: Truck,
  security: Shield,
  support: Headphones,
  quality: Award,
  returns: RefreshCw,
};

/**
 * Minimal Clean Landing Page Template
 *
 * A typography-first, minimalist homepage featuring:
 * - Clean typography and generous whitespace
 * - Subtle, refined design elements
 * - Focus on content over decoration
 * - Fast-loading, distraction-free experience
 * - Premium minimal aesthetic
 *
 * Perfect for: Premium brands, professional services, modern minimalism
 */
export function LandingTemplateMinimal({
  content,
  featuredProducts,
  className = "",
  onCtaClick,
}: LandingTemplateMinimalProps) {
  const handleCtaClick =
    (link: string) => (e: React.MouseEvent<HTMLButtonElement>) => {
      if (onCtaClick) {
        e.preventDefault();
        onCtaClick(link);
      }
    };

  return (
    <div className={`landing-template-minimal bg-white ${className}`}>
      {/* Minimal Announcement Bar */}
      {content.promoBanner.enabled && (
        <div className='border-b border-gray-100 bg-white py-3 px-4 text-center'>
          <p className='text-sm text-gray-700 font-light'>
            {content.promoBanner.text}
            {content.promoBanner.linkText && content.promoBanner.linkUrl && (
              <>
                {" "}
                <a
                  href={content.promoBanner.linkUrl}
                  className='text-gray-900 underline hover:text-gray-600 transition-colors font-normal'>
                  {content.promoBanner.linkText}
                </a>
              </>
            )}
          </p>
        </div>
      )}

      {/* Hero Section - Minimal */}
      {content.hero.enabled && (
        <section className='py-20 sm:py-28 lg:py-36 px-4 sm:px-6 lg:px-8'>
          <div className='max-w-5xl mx-auto text-center'>
            <h1 className='text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-light text-gray-900 mb-8 leading-[1.1] tracking-tight'>
              {content.hero.title}
            </h1>

            <p className='text-xl sm:text-2xl lg:text-3xl text-gray-600 font-light mb-12 max-w-3xl mx-auto leading-relaxed'>
              {content.hero.subtitle}
            </p>

            <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
              <Button
                size='lg'
                className='bg-gray-900 hover:bg-gray-800 text-white font-light px-10 py-6 text-base rounded-none shadow-none hover:shadow-lg transition-all'
                onClick={handleCtaClick(content.hero.ctaLink)}
                asChild={!onCtaClick}>
                {onCtaClick ? (
                  <>{content.hero.ctaText}</>
                ) : (
                  <a href={content.hero.ctaLink}>{content.hero.ctaText}</a>
                )}
              </Button>

              {content.categories.enabled && (
                <Button
                  size='lg'
                  variant='ghost'
                  className='font-light px-10 py-6 text-base hover:bg-gray-50 rounded-none group'
                  onClick={handleCtaClick(content.categories.ctaLink)}
                  asChild={!onCtaClick}>
                  {onCtaClick ? (
                    <>
                      {content.categories.ctaText}
                      <ArrowRight className='ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform' />
                    </>
                  ) : (
                    <a href={content.categories.ctaLink}>
                      {content.categories.ctaText}
                      <ArrowRight className='ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform' />
                    </a>
                  )}
                </Button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Divider */}
      <div className='border-t border-gray-100' />

      {/* Value Propositions - Minimal Grid */}
      {content.valueProps.enabled && content.valueProps.items.length > 0 && (
        <section className='py-20 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-8'>
          <div className='max-w-7xl mx-auto'>
            <div className='grid md:grid-cols-3 gap-12 lg:gap-16'>
              {content.valueProps.items.map((item, index) => {
                const IconComponent = ICON_MAP[item.icon];
                return (
                  <div key={index} className='group'>
                    <div className='mb-6'>
                      <IconComponent className='w-8 h-8 text-gray-400 group-hover:text-gray-900 transition-colors' />
                    </div>
                    <h3 className='text-xl font-light text-gray-900 mb-3'>
                      {item.title}
                    </h3>
                    <p className='text-gray-600 font-light leading-relaxed text-sm'>
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Divider */}
      <div className='border-t border-gray-100' />

      {/* Categories Section - Minimal */}
      {content.categories.enabled && (
        <section className='py-20 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-8 bg-gray-50'>
          <div className='max-w-5xl mx-auto'>
            <div className='mb-16'>
              <h2 className='text-4xl sm:text-5xl lg:text-6xl font-light text-gray-900 mb-6 leading-tight'>
                {content.categories.title}
              </h2>
              <p className='text-xl text-gray-600 font-light leading-relaxed'>
                {content.categories.subtitle}
              </p>
            </div>

            {/* Minimal Category Links */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-8'>
              {["Electronics", "Fashion", "Home", "Sports"].map(
                (category, index) => (
                  <div
                    key={index}
                    className='group cursor-pointer py-6 border-b border-gray-200 hover:border-gray-900 transition-colors'>
                    <div className='flex items-center justify-between mb-2'>
                      <span className='text-lg font-light text-gray-900'>
                        {category}
                      </span>
                      <ArrowRight className='w-4 h-4 text-gray-400 group-hover:text-gray-900 group-hover:translate-x-1 transition-all' />
                    </div>
                    <p className='text-sm text-gray-500 font-light'>
                      {20 + index * 5} items
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products - Minimal */}
      {content.featuredProducts.enabled && (
        <section className='py-20 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-8'>
          <div className='max-w-7xl mx-auto'>
            <div className='flex items-end justify-between mb-16'>
              <div>
                <h2 className='text-4xl sm:text-5xl lg:text-6xl font-light text-gray-900 mb-4 leading-tight'>
                  {content.featuredProducts.title}
                </h2>
                <p className='text-xl text-gray-600 font-light'>
                  {content.featuredProducts.subtitle}
                </p>
              </div>
            </div>

            <HomeFeaturedProducts
              title=''
              products={featuredProducts}
              showViewAllButton={false}
            />

            <div className='mt-12 text-center'>
              <Button
                variant='link'
                className='text-gray-900 hover:text-gray-600 font-light text-base group underline'
                onClick={handleCtaClick(content.featuredProducts.viewAllLink)}
                asChild={!onCtaClick}>
                {onCtaClick ? (
                  <>
                    {content.featuredProducts.viewAllText}
                    <ArrowRight className='ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform' />
                  </>
                ) : (
                  <a href={content.featuredProducts.viewAllLink}>
                    {content.featuredProducts.viewAllText}
                    <ArrowRight className='ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform' />
                  </a>
                )}
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Divider */}
      <div className='border-t border-gray-100' />

      {/* Newsletter - Minimal */}
      {content.newsletter.enabled && (
        <section className='py-20 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-8'>
          <div className='max-w-3xl mx-auto'>
            <div className='mb-12'>
              <h2 className='text-4xl sm:text-5xl font-light text-gray-900 mb-4 leading-tight'>
                {content.newsletter.title}
              </h2>
              <p className='text-xl text-gray-600 font-light leading-relaxed'>
                {content.newsletter.subtitle}
              </p>
            </div>

            <form className='mb-6'>
              <div className='flex flex-col sm:flex-row gap-4'>
                <input
                  type='email'
                  placeholder={content.newsletter.placeholderText}
                  className='flex-1 px-0 py-3 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 rounded-none text-base font-light placeholder:text-gray-400'
                  required
                />
                <Button
                  type='submit'
                  size='lg'
                  className='bg-gray-900 hover:bg-gray-800 text-white font-light px-8 py-3 rounded-none shadow-none hover:shadow-lg transition-all'>
                  {content.newsletter.ctaText}
                </Button>
              </div>
            </form>

            <p className='text-sm text-gray-500 font-light'>
              {content.newsletter.privacyText}
            </p>
          </div>
        </section>
      )}

      {/* Divider */}
      <div className='border-t border-gray-100' />

      {/* Footer CTA - Minimal */}
      {content.footerCta.enabled && (
        <section className='py-20 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-8'>
          <div className='max-w-4xl mx-auto text-center'>
            <h2 className='text-5xl sm:text-6xl lg:text-7xl font-light text-gray-900 mb-8 leading-[1.1]'>
              {content.footerCta.title}
            </h2>
            <p className='text-2xl text-gray-600 font-light mb-12 leading-relaxed'>
              {content.footerCta.subtitle}
            </p>

            <Button
              size='lg'
              className='bg-gray-900 hover:bg-gray-800 text-white font-light px-12 py-6 text-lg rounded-none shadow-none hover:shadow-xl transition-all'
              onClick={handleCtaClick(content.footerCta.ctaLink)}
              asChild={!onCtaClick}>
              {onCtaClick ? (
                <>{content.footerCta.ctaText}</>
              ) : (
                <a href={content.footerCta.ctaLink}>
                  {content.footerCta.ctaText}
                </a>
              )}
            </Button>
          </div>
        </section>
      )}

      {/* Bottom Spacer */}
      <div className='h-20' />
    </div>
  );
}

LandingTemplateMinimal.displayName = "LandingTemplateMinimal";
