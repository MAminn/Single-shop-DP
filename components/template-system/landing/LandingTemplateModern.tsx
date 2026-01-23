import type React from "react";
import { Button } from "#root/components/ui/button";
import { Card, CardContent } from "#root/components/ui/card";
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
 * Props for the LandingTemplateModern component
 */
export interface LandingTemplateModernProps {
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
 * Modern Landing Page Template Component
 *
 * A complete landing page template featuring:
 * - Hero section with CTA
 * - Promotional banner (optional)
 * - Value propositions highlighting key features
 * - Categories section
 * - Featured products section
 * - Newsletter subscription (optional)
 * - Footer CTA (optional)
 * - Fully responsive design
 *
 * Content is fully customizable by merchants via HomepageContent
 */
export function LandingTemplateModern({
  content,
  featuredProducts,
  className = "",
  onCtaClick,
}: LandingTemplateModernProps) {
  const handleCtaClick =
    (link: string) => (e: React.MouseEvent<HTMLButtonElement>) => {
      if (onCtaClick) {
        e.preventDefault();
        onCtaClick(link);
      }
    };

  return (
    <div className={`landing-template-modern ${className}`}>
      {/* Promotional Banner */}
      {content.promoBanner.enabled && (
        <div className='bg-stone-800 text-stone-100 py-3 px-4 text-center border-b border-stone-700'>
          <p className='text-[11px] uppercase tracking-[0.25em] font-light text-stone-300'>
            {content.promoBanner.text}
            {content.promoBanner.linkText && content.promoBanner.linkUrl && (
              <>
                {" "}
                <a
                  href={content.promoBanner.linkUrl}
                  className='underline font-normal hover:text-stone-300 transition-colors'>
                  {content.promoBanner.linkText}
                </a>
              </>
            )}
          </p>
        </div>
      )}

      {/* Hero Section - Percé Editorial Style */}
      {content.hero.enabled && (
        <section className='relative bg-stone-900 overflow-hidden h-screen '>
          {/* Full-bleed Background Image */}
          <div className='absolute inset-0 z-0'>
            {content.hero.backgroundImage ? (
              <img
                src={content.hero.backgroundImage}
                alt='Featured collection'
                className='w-full h-full object-cover'
              />
            ) : (
              <div className='w-full h-full bg-stone-800' />
            )}
          </div>

          {/* Dark Overlay for Text Readability */}
          <div className='absolute inset-0 z-1 bg-linear-to-b from-black/40 via-black/35 to-black/50' />

          {/* Content Overlay - Centered Editorial Layout */}
          <div className='relative z-10 container mx-auto px-6 sm:px-8 lg:px-12 h-full flex items-center justify-center'>
            <div className='w-full max-w-3xl text-center space-y-4 sm:space-y-5 lg:space-y-6'>
              {/* Headline - Editorial Serif Feel */}
              <h1 className='text-5xl lg:text-7xl font-light text-stone-50 leading-[1.05] tracking-tight max-w-2xl mx-auto'>
                {content.hero.title}
              </h1>

              {/* Subtext with Hairline Divider */}
              <div className='space-y-3 sm:space-y-4'>
                <p className='text-base lg:text-lg text-stone-200 font-light leading-relaxed max-w-md mx-auto'>
                  {content.hero.subtitle}
                </p>

                {/* Hairline Divider - Signature Detail */}
                <div className='w-16 h-px bg-stone-400 mx-auto' />
              </div>

              {/* CTA - Luxury Ghost Button */}
              <div className='pt-2 sm:pt-3'>
                <Button
                  variant='secondary-light'
                  size='lg'
                  onClick={handleCtaClick(content.hero.ctaLink)}
                  asChild={!onCtaClick}>
                  {onCtaClick ? (
                    <>{content.hero.ctaText}</>
                  ) : (
                    <a href={content.hero.ctaLink}>{content.hero.ctaText}</a>
                  )}
                </Button>
              </div>

              {/* Quiet Confidence Microcopy */}
              <p className='text-stone-400 text-[11px] font-light tracking-[0.25em] uppercase pt-3 sm:pt-4'>
                Quiet confidence.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Brand Statement Section - Editorial Split Layout */}
      {content.brandStatement.enabled && (
        <section className='py-20 sm:py-24 lg:py-32 bg-white'>
          <div className='container mx-auto px-6 sm:px-8 lg:px-12'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 lg:min-h-[80vh] items-center relative'>
              {/* Left Column - Text Content */}
              <div className='space-y-6 lg:pr-12'>
                {/* Eyebrow Label */}
                <p className='text-[11px] uppercase tracking-[0.25em] text-stone-500 font-light mb-4'>
                  Our Philosophy
                </p>

                <h2 className='text-3xl lg:text-5xl font-light text-stone-900 leading-[1.15] tracking-tight'>
                  {content.brandStatement.title}
                </h2>

                <p className='text-base lg:text-lg text-stone-600 font-light leading-relaxed max-w-md'>
                  {content.brandStatement.description}
                </p>
              </div>

              {/* Vertical Divider - Desktop Only */}
              <div className='hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-[60%] bg-stone-200' />

              {/* Right Column - Editorial Image */}
              <div
                className='relative h-[55vh] sm:h-[60vh] lg:h-[80vh] w-full overflow-hidden bg-stone-100 bg-contain bg-center bg-no-repeat shadow-[0_30px_80px_rgba(0,0,0,0.12)] lg:-translate-y-4'
                style={
                  content.brandStatement.image
                    ? {
                        backgroundImage: `url(${content.brandStatement.image})`,
                      }
                    : undefined
                }>
                {!content.brandStatement.image && (
                  <div className='absolute inset-0 flex items-center justify-center text-stone-400 text-sm'>
                    Image placeholder
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Value Propositions Section */}
      {content.valueProps.enabled && content.valueProps.items.length > 0 && (
        <section className='py-12 sm:py-16 lg:py-20 bg-white border-t border-stone-200'>
          <div className='container mx-auto px-6 sm:px-8 lg:px-12'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12'>
              {content.valueProps.items.map((item, index) => {
                const IconComponent = ICON_MAP[item.icon];
                return (
                  <div key={index} className='text-center space-y-4'>
                    <div className='inline-flex items-center justify-center w-12 h-12 text-stone-700'>
                      <IconComponent className='w-6 h-6' />
                    </div>
                    <h3 className='text-xl lg:text-2xl font-normal text-stone-900 leading-snug'>
                      {item.title}
                    </h3>
                    <p className='text-sm text-stone-600 font-light leading-relaxed max-w-xs mx-auto'>
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      {content.featuredProducts.enabled && (
        <section className='py-12 sm:py-16 lg:py-20 bg-gray-50'>
          <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='text-center mb-10 sm:mb-12 lg:mb-16'>
              <h2 className='text-3xl lg:text-5xl font-light text-stone-900 leading-[1.15] tracking-tight mb-6'>
                {content.featuredProducts.title}
              </h2>
              <p className='text-base lg:text-lg text-stone-600 font-light leading-relaxed max-w-md mx-auto'>
                {content.featuredProducts.subtitle}
              </p>
            </div>

            <div className='mb-8'>
              <HomeFeaturedProducts
                title=''
                products={featuredProducts}
                showViewAllButton={false}
              />
            </div>

            <div className='text-center mt-8 sm:mt-10'>
              <Button
                variant='secondary'
                size='lg'
                onClick={handleCtaClick(content.featuredProducts.viewAllLink)}
                asChild={!onCtaClick}>
                {onCtaClick ? (
                  <>
                    {content.featuredProducts.viewAllText}
                    <ArrowRight className='ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform' />
                  </>
                ) : (
                  <a href={content.featuredProducts.viewAllLink}>
                    {content.featuredProducts.viewAllText}
                    <ArrowRight className='ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform' />
                  </a>
                )}
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Newsletter Section */}
      {content.newsletter.enabled && (
        <section className='py-12 sm:py-16 lg:py-20 bg-white'>
          <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='max-w-2xl mx-auto text-center'>
              <h2 className='text-3xl lg:text-5xl font-light text-stone-900 leading-[1.15] tracking-tight mb-6'>
                {content.newsletter.title}
              </h2>
              <p className='text-base lg:text-lg text-stone-600 font-light leading-relaxed mb-8'>
                {content.newsletter.subtitle}
              </p>

              <form className='flex flex-col sm:flex-row gap-4 max-w-md mx-auto'>
                <input
                  type='email'
                  placeholder={content.newsletter.placeholderText}
                  className='flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent'
                  required
                />
                <Button type='submit' variant='primary' size='md'>
                  {content.newsletter.ctaText}
                </Button>
              </form>

              <p className='text-sm font-light leading-relaxed text-stone-600 mt-4'>
                {content.newsletter.privacyText}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Footer CTA Section */}
      {content.footerCta.enabled && (
        <section className='py-12 sm:py-16 lg:py-20 bg-stone-900 text-white'>
          <div className='container mx-auto px-4 sm:px-6 lg:px-8 text-center'>
            <h2 className='text-3xl lg:text-5xl font-light text-stone-50 leading-[1.15] tracking-tight mb-6'>
              {content.footerCta.title}
            </h2>
            <p className='text-base lg:text-lg text-stone-300 font-light leading-relaxed mb-8 max-w-md mx-auto'>
              {content.footerCta.subtitle}
            </p>

            <Button
              variant='secondary-light'
              size='lg'
              onClick={handleCtaClick(content.footerCta.ctaLink)}
              asChild={!onCtaClick}>
              {onCtaClick ? (
                <>
                  {content.footerCta.ctaText}
                  <ArrowRight className='ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform' />
                </>
              ) : (
                <a href={content.footerCta.ctaLink}>
                  {content.footerCta.ctaText}
                  <ArrowRight className='ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform' />
                </a>
              )}
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}

// Display name for debugging
LandingTemplateModern.displayName = "LandingTemplateModern";
