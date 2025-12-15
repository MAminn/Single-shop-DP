import type React from "react";
import { Button } from "#root/components/ui/button";
import { Card, CardContent } from "#root/components/ui/card";
import { Badge } from "#root/components/ui/badge";
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
  CheckCircle,
  Star,
} from "lucide-react";
import type {
  HomepageContent,
  ValuePropIconType,
} from "#root/shared/types/homepage-content";

/**
 * Props for the LandingTemplateClassic component
 */
export interface LandingTemplateClassicProps {
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
 * Classic Commerce-First Landing Page Template
 *
 * A traditional e-commerce homepage featuring:
 * - Clean hero with centered content
 * - Prominent category showcase
 * - Featured products grid
 * - Trust badges and value propositions
 * - Newsletter subscription
 * - Professional, conversion-focused layout
 *
 * Perfect for: General e-commerce, established brands, traditional retail
 */
export function LandingTemplateClassic({
  content,
  featuredProducts,
  className = "",
  onCtaClick,
}: LandingTemplateClassicProps) {
  const handleCtaClick =
    (link: string) => (e: React.MouseEvent<HTMLButtonElement>) => {
      if (onCtaClick) {
        e.preventDefault();
        onCtaClick(link);
      }
    };

  return (
    <div className={`landing-template-classic ${className}`}>
      {/* Promotional Banner */}
      {content.promoBanner.enabled && (
        <div className='bg-gray-900 text-white py-2.5 px-4 text-center'>
          <p className='text-sm font-medium'>
            {content.promoBanner.text}
            {content.promoBanner.linkText && content.promoBanner.linkUrl && (
              <>
                {" "}
                <a
                  href={content.promoBanner.linkUrl}
                  className='underline font-semibold hover:text-gray-300 transition-colors'>
                  {content.promoBanner.linkText}
                </a>
              </>
            )}
          </p>
        </div>
      )}

      {/* Hero Section */}
      {content.hero.enabled && (
        <section className='relative bg-white border-b border-gray-200'>
          <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24'>
            <div className='max-w-4xl mx-auto text-center'>
              <Badge className='mb-6 bg-blue-600 text-white hover:bg-blue-700'>
                Welcome to Our Store
              </Badge>

              <h1 className='text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight'>
                {content.hero.title}
              </h1>

              <p className='text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto'>
                {content.hero.subtitle}
              </p>

              <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                <Button
                  size='lg'
                  className='bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-6 text-base shadow-lg hover:shadow-xl transition-all group'
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

                {content.categories.enabled && (
                  <Button
                    size='lg'
                    variant='outline'
                    className='font-semibold px-8 py-6 text-base border-2 hover:bg-gray-50'
                    onClick={handleCtaClick(content.categories.ctaLink)}
                    asChild={!onCtaClick}>
                    {onCtaClick ? (
                      <>{content.categories.ctaText}</>
                    ) : (
                      <a href={content.categories.ctaLink}>
                        {content.categories.ctaText}
                      </a>
                    )}
                  </Button>
                )}
              </div>

              {/* Trust Indicators */}
              <div className='mt-12 flex flex-wrap justify-center items-center gap-6 text-sm text-gray-600'>
                <div className='flex items-center gap-2'>
                  <CheckCircle className='w-5 h-5 text-green-600' />
                  <span>Free Shipping</span>
                </div>
                <div className='flex items-center gap-2'>
                  <CheckCircle className='w-5 h-5 text-green-600' />
                  <span>Secure Payment</span>
                </div>
                <div className='flex items-center gap-2'>
                  <CheckCircle className='w-5 h-5 text-green-600' />
                  <span>Easy Returns</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Star className='w-5 h-5 text-yellow-500 fill-yellow-500' />
                  <span>Trusted by 10,000+ Customers</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Categories Section */}
      {content.categories.enabled && (
        <section className='py-12 sm:py-16 lg:py-20 bg-gray-50'>
          <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='text-center mb-12'>
              <h2 className='text-3xl sm:text-4xl font-bold text-gray-900 mb-4'>
                {content.categories.title}
              </h2>
              <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
                {content.categories.subtitle}
              </p>
            </div>

            {/* Category Cards Placeholder */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8'>
              {["Electronics", "Fashion", "Home & Garden", "Sports"].map(
                (category, index) => (
                  <Card
                    key={index}
                    className='group cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-600'>
                    <CardContent className='p-6 text-center'>
                      <div className='w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center group-hover:from-blue-600 group-hover:to-blue-700 transition-all'>
                        <ShoppingBag className='w-8 h-8 text-blue-600 group-hover:text-white transition-colors' />
                      </div>
                      <h3 className='font-semibold text-gray-900 group-hover:text-blue-600 transition-colors'>
                        {category}
                      </h3>
                    </CardContent>
                  </Card>
                )
              )}
            </div>
          </div>
        </section>
      )}

      {/* Value Propositions */}
      {content.valueProps.enabled && content.valueProps.items.length > 0 && (
        <section className='py-12 sm:py-16 lg:py-20 bg-white border-y border-gray-200'>
          <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
              {content.valueProps.items.map((item, index) => {
                const IconComponent = ICON_MAP[item.icon];
                return (
                  <div key={index} className='flex items-start gap-4'>
                    <div className='flex-shrink-0 w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center'>
                      <IconComponent className='w-6 h-6' />
                    </div>
                    <div>
                      <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                        {item.title}
                      </h3>
                      <p className='text-gray-600 text-sm leading-relaxed'>
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {content.featuredProducts.enabled && (
        <section className='py-12 sm:py-16 lg:py-20 bg-gray-50'>
          <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='flex items-end justify-between mb-10'>
              <div>
                <h2 className='text-3xl sm:text-4xl font-bold text-gray-900 mb-2'>
                  {content.featuredProducts.title}
                </h2>
                <p className='text-lg text-gray-600'>
                  {content.featuredProducts.subtitle}
                </p>
              </div>
              <Button
                variant='link'
                className='hidden sm:flex items-center text-blue-600 hover:text-blue-700 font-semibold group'
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

            <HomeFeaturedProducts
              title=''
              products={featuredProducts}
              showViewAllButton={false}
            />

            <div className='text-center mt-8 sm:hidden'>
              <Button
                variant='outline'
                size='lg'
                className='font-semibold w-full'
                onClick={handleCtaClick(content.featuredProducts.viewAllLink)}
                asChild={!onCtaClick}>
                {onCtaClick ? (
                  <>{content.featuredProducts.viewAllText}</>
                ) : (
                  <a href={content.featuredProducts.viewAllLink}>
                    {content.featuredProducts.viewAllText}
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
            <Card className='border-2 border-blue-600 shadow-xl'>
              <CardContent className='p-8 sm:p-12'>
                <div className='max-w-2xl mx-auto text-center'>
                  <h2 className='text-3xl sm:text-4xl font-bold text-gray-900 mb-4'>
                    {content.newsletter.title}
                  </h2>
                  <p className='text-lg text-gray-600 mb-8'>
                    {content.newsletter.subtitle}
                  </p>

                  <form className='flex flex-col sm:flex-row gap-3'>
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
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Footer CTA */}
      {content.footerCta.enabled && (
        <section className='py-12 sm:py-16 lg:py-20 bg-gray-900 text-white'>
          <div className='container mx-auto px-4 sm:px-6 lg:px-8 text-center'>
            <h2 className='text-3xl sm:text-4xl lg:text-5xl font-bold mb-4'>
              {content.footerCta.title}
            </h2>
            <p className='text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto'>
              {content.footerCta.subtitle}
            </p>

            <Button
              size='lg'
              className='bg-white text-gray-900 hover:bg-gray-100 font-semibold px-10 py-6 text-lg shadow-xl hover:shadow-2xl transition-all group'
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

LandingTemplateClassic.displayName = "LandingTemplateClassic";
