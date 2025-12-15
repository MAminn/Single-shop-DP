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
        <div className='bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 text-center'>
          <p className='text-sm sm:text-base font-medium'>
            {content.promoBanner.text}
            {content.promoBanner.linkText && content.promoBanner.linkUrl && (
              <>
                {" "}
                <a
                  href={content.promoBanner.linkUrl}
                  className='underline font-semibold hover:text-blue-100 transition-colors'>
                  {content.promoBanner.linkText}
                </a>
              </>
            )}
          </p>
        </div>
      )}

      {/* Hero Section */}
      {content.hero.enabled && (
        <section
          // Apply gradient background only if no custom image is set; otherwise use the image with overlay
          className={`relative text-white overflow-hidden ${
            content.hero.backgroundImage
              ? ""
              : "bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800"
          }`}
          style={
            content.hero.backgroundImage
              ? {
                  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${content.hero.backgroundImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }>
          {/* Background Pattern */}
          <div className='absolute inset-0 opacity-10'>
            <div
              className='absolute inset-0'
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                backgroundSize: "40px 40px",
              }}
            />
          </div>

          <div className='relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28'>
            <div className='max-w-3xl mx-auto text-center'>
              <h1 className='text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight'>
                {content.hero.title}
              </h1>

              <p className='text-lg sm:text-xl lg:text-2xl text-blue-100 mb-8 leading-relaxed'>
                {content.hero.subtitle}
              </p>

              <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
                <Button
                  size='lg'
                  className='bg-white text-blue-700 hover:bg-blue-50 font-semibold px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 group'
                  onClick={handleCtaClick(content.hero.ctaLink)}
                  asChild={!onCtaClick}>
                  {onCtaClick ? (
                    <>
                      {content.hero.ctaText}
                      <ArrowRight className='ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform' />
                    </>
                  ) : (
                    <a href={content.hero.ctaLink}>
                      {content.hero.ctaText}
                      <ArrowRight className='ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform' />
                    </a>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Wave Divider */}
          <div className='absolute bottom-0 left-0 right-0'>
            <svg
              viewBox='0 0 1200 120'
              preserveAspectRatio='none'
              className='w-full h-12 sm:h-16 lg:h-20'>
              <path
                d='M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z'
                className='fill-white'
              />
            </svg>
          </div>
        </section>
      )}

      {/* Value Propositions Section */}
      {content.valueProps.enabled && content.valueProps.items.length > 0 && (
        <section className='py-12 sm:py-16 lg:py-20 bg-white'>
          <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8'>
              {content.valueProps.items.map((item, index) => {
                const IconComponent = ICON_MAP[item.icon];
                return (
                  <Card
                    key={index}
                    className='border-none shadow-lg hover:shadow-xl transition-shadow duration-300'>
                    <CardContent className='p-6 sm:p-8 text-center'>
                      <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4'>
                        <IconComponent className='w-8 h-8' />
                      </div>
                      <h3 className='text-xl font-semibold mb-3 text-gray-900'>
                        {item.title}
                      </h3>
                      <p className='text-gray-600 leading-relaxed'>
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
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
