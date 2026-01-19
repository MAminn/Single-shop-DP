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
          <p className='text-xs sm:text-sm font-light tracking-wide'>
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
        <section className='relative bg-stone-50 overflow-hidden'>
          <div className='container mx-auto px-6 sm:px-8 lg:px-12 py-16 sm:py-20 lg:py-32'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center'>
              {/* Left Column - Text Content */}
              <div className='space-y-8 lg:pr-8'>
                <h1 className='text-4xl sm:text-5xl lg:text-6xl font-light text-stone-900 leading-tight tracking-tight'>
                  Designed to be worn with intent.
                </h1>

                <p className='text-base sm:text-lg text-stone-600 font-light leading-relaxed max-w-lg'>
                  Piercings, refined.
                </p>

                <div className='pt-4'>
                  <Button
                    size='lg'
                    className='bg-stone-900 text-stone-50 hover:bg-stone-800 font-light px-10 py-6 text-base border border-stone-900 shadow-none hover:shadow-sm transition-all duration-200 rounded-none'
                    onClick={handleCtaClick(content.hero.ctaLink)}
                    asChild={!onCtaClick}>
                    {onCtaClick ? (
                      <>Explore the collection</>
                    ) : (
                      <a href={content.hero.ctaLink}>Explore the collection</a>
                    )}
                  </Button>
                </div>
              </div>

              {/* Right Column - Image Block */}
              <div className='relative aspect-[4/5] lg:aspect-[3/4] overflow-hidden bg-stone-200'>
                {content.hero.backgroundImage ? (
                  <img
                    src={content.hero.backgroundImage}
                    alt='Featured collection'
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <div className='w-full h-full flex items-center justify-center'>
                    <p className='text-stone-400 text-sm font-light'>
                      Image placeholder
                    </p>
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
                    <h3 className='text-base font-normal text-stone-900 tracking-wide'>
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
              <h2 className='text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4'>
                {content.featuredProducts.title}
              </h2>
              <p className='text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto'>
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
                variant='outline'
                size='lg'
                className='font-semibold px-8 group border-2 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-300'
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
              <h2 className='text-3xl sm:text-4xl font-bold text-gray-900 mb-4'>
                {content.newsletter.title}
              </h2>
              <p className='text-lg text-gray-600 mb-8'>
                {content.newsletter.subtitle}
              </p>

              <form className='flex flex-col sm:flex-row gap-4 max-w-md mx-auto'>
                <input
                  type='email'
                  placeholder={content.newsletter.placeholderText}
                  className='flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent'
                  required
                />
                <Button
                  type='submit'
                  size='lg'
                  className='bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8'>
                  {content.newsletter.ctaText}
                </Button>
              </form>

              <p className='text-sm text-gray-500 mt-4'>
                {content.newsletter.privacyText}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Footer CTA Section */}
      {content.footerCta.enabled && (
        <section className='py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white'>
          <div className='container mx-auto px-4 sm:px-6 lg:px-8 text-center'>
            <h2 className='text-3xl sm:text-4xl lg:text-5xl font-bold mb-4'>
              {content.footerCta.title}
            </h2>
            <p className='text-lg sm:text-xl text-blue-100 mb-8 max-w-2xl mx-auto'>
              {content.footerCta.subtitle}
            </p>

            <Button
              size='lg'
              className='bg-white text-blue-700 hover:bg-blue-50 font-semibold px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 group'
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
