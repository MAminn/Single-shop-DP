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
  Sparkles,
} from "lucide-react";
import type {
  HomepageContent,
  ValuePropIconType,
} from "#root/shared/types/homepage-content";

/**
 * Props for the LandingTemplateEditorial component
 */
export interface LandingTemplateEditorialProps {
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
 * Editorial Premium Landing Page Template
 *
 * A magazine-style, storytelling-focused homepage featuring:
 * - Full-screen hero with dramatic imagery
 * - Editorial-style content sections
 * - Featured collections showcase
 * - Storytelling narrative flow
 * - Premium brand aesthetic
 *
 * Perfect for: Luxury brands, lifestyle products, premium collections
 */
export function LandingTemplateEditorial({
  content,
  featuredProducts,
  className = "",
  onCtaClick,
}: LandingTemplateEditorialProps) {
  const handleCtaClick =
    (link: string) => (e: React.MouseEvent<HTMLButtonElement>) => {
      if (onCtaClick) {
        e.preventDefault();
        onCtaClick(link);
      }
    };

  return (
    <div className={`landing-template-editorial ${className}`}>
      {/* Full-Screen Hero */}
      {content.hero.enabled && (
        <section className='relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden'>
          {/* Background */}
          <div className='absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black'>
            {content.hero.backgroundImage && (
              <div
                className='absolute inset-0 opacity-40'
                style={{
                  backgroundImage: `url(${content.hero.backgroundImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            )}
            <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent' />
          </div>

          {/* Promotional Strip */}
          {content.promoBanner.enabled && (
            <div className='absolute top-0 left-0 right-0 bg-white/10 backdrop-blur-md text-white py-2 px-4 text-center z-10 border-b border-white/20'>
              <p className='text-[11px] uppercase tracking-[0.25em] font-light'>
                {content.promoBanner.text}
                {content.promoBanner.linkText &&
                  content.promoBanner.linkUrl && (
                    <>
                      {" "}
                      <a
                        href={content.promoBanner.linkUrl}
                        className='font-light underline hover:text-stone-200 transition-colors'>
                        {content.promoBanner.linkText}
                      </a>
                    </>
                  )}
              </p>
            </div>
          )}

          {/* Hero Content */}
          <div className='relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center text-white'>
            <h1 className='text-5xl lg:text-7xl font-light tracking-tight leading-[1.05] mb-8'>
              {content.hero.title}
            </h1>

            <p className='text-base lg:text-lg text-stone-200 font-light leading-relaxed mb-10 max-w-md mx-auto'>
              {content.hero.subtitle}
            </p>

            <Button
              variant='secondary-light'
              size='lg'
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

          {/* Scroll Indicator */}
          <div className='absolute bottom-8 left-1/2 -translate-x-1/2 z-10'>
            <div className='animate-bounce'>
              <div className='w-6 h-10 border-2 border-stone-400/40 rounded-full flex items-start justify-center p-2'>
                <div className='w-1.5 h-1.5 bg-stone-400/60 rounded-full' />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Featured Collection Story */}
      {content.categories.enabled && (
        <section className='py-20 sm:py-24 lg:py-32 bg-white'>
          <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='grid lg:grid-cols-2 gap-12 lg:gap-16 items-center'>
              <div className='order-2 lg:order-1'>
                <div className='aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden'>
                  {/* Placeholder for collection image */}
                  <div className='w-full h-full flex items-center justify-center'>
                    <ShoppingBag className='w-24 h-24 text-stone-400' />
                  </div>
                </div>
              </div>

              <div className='order-1 lg:order-2'>
                <h2 className='text-3xl lg:text-5xl font-light text-stone-900 leading-[1.15] tracking-tight mb-6'>
                  {content.categories.title}
                </h2>
                <p className='text-base lg:text-lg text-stone-600 font-light leading-relaxed mb-8 max-w-md'>
                  {content.categories.subtitle}
                </p>
                <Button
                  variant='secondary'
                  size='lg'
                  onClick={handleCtaClick(content.categories.ctaLink)}
                  asChild={!onCtaClick}>
                  {onCtaClick ? (
                    <>
                      {content.categories.ctaText}
                      <ArrowRight className='ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform' />
                    </>
                  ) : (
                    <a href={content.categories.ctaLink}>
                      {content.categories.ctaText}
                      <ArrowRight className='ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform' />
                    </a>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Featured Products Collection */}
      {content.featuredProducts.enabled && (
        <section className='py-20 sm:py-24 lg:py-32 bg-gray-50'>
          <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='max-w-3xl mb-16'>
              <h2 className='text-3xl lg:text-5xl font-light text-stone-900 leading-[1.15] tracking-tight mb-6'>
                {content.featuredProducts.title}
              </h2>
              <p className='text-base lg:text-lg text-stone-600 font-light leading-relaxed max-w-md'>
                {content.featuredProducts.subtitle}
              </p>
            </div>

            <HomeFeaturedProducts
              title=''
              products={featuredProducts}
              showViewAllButton={false}
            />

            <div className='mt-12 text-center'>
              <Button
                variant='primary'
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

      {/* Value Propositions - Editorial Style */}
      {content.valueProps.enabled && content.valueProps.items.length > 0 && (
        <section className='py-20 sm:py-24 lg:py-32 bg-white'>
          <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='text-center mb-16'>
              <h2 className='text-3xl lg:text-5xl font-light text-stone-900 leading-[1.15] tracking-tight mb-4'>
                Why Choose Us
              </h2>
              <p className='text-base lg:text-lg text-stone-600 font-light leading-relaxed'>
                Experience the difference
              </p>
            </div>

            <div className='grid md:grid-cols-3 gap-12 lg:gap-16'>
              {content.valueProps.items.map((item, index) => {
                const IconComponent = ICON_MAP[item.icon];
                return (
                  <div key={index} className='text-center'>
                    <div className='inline-flex items-center justify-center w-12 h-12 text-stone-700 mb-6'>
                      <IconComponent className='w-6 h-6' />
                    </div>
                    <h3 className='text-xl lg:text-2xl font-normal text-stone-900 leading-snug mb-4'>
                      {item.title}
                    </h3>
                    <p className='text-sm text-stone-600 font-light leading-relaxed'>
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter - Editorial Format */}
      {content.newsletter.enabled && (
        <section className='py-20 sm:py-24 lg:py-32 bg-stone-900 text-white'>
          <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='max-w-3xl mx-auto text-center'>
              <h2 className='text-3xl lg:text-5xl font-light text-stone-50 leading-[1.15] tracking-tight mb-6'>
                {content.newsletter.title}
              </h2>
              <p className='text-base lg:text-lg text-stone-300 font-light leading-relaxed mb-10 max-w-md mx-auto'>
                {content.newsletter.subtitle}
              </p>

              <form className='flex flex-col sm:flex-row gap-4 max-w-xl mx-auto mb-6'>
                <input
                  type='email'
                  placeholder={content.newsletter.placeholderText}
                  className='flex-1 px-6 py-4 bg-white/10 border border-white/20 rounded-none text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm'
                  required
                />
                <Button type='submit' variant='primary-light' size='md'>
                  {content.newsletter.ctaText}
                </Button>
              </form>

              <p className='text-sm text-stone-400 font-light leading-relaxed'>
                {content.newsletter.privacyText}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Footer CTA - Editorial Closer */}
      {content.footerCta.enabled && (
        <section className='py-20 sm:py-24 lg:py-32 bg-white'>
          <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='max-w-4xl mx-auto text-center'>
              <h2 className='text-5xl lg:text-7xl font-light text-stone-900 leading-[1.05] tracking-tight mb-6'>
                {content.footerCta.title}
              </h2>
              <p className='text-base lg:text-lg text-stone-600 font-light leading-relaxed mb-12 max-w-md mx-auto'>
                {content.footerCta.subtitle}
              </p>

              <Button
                variant='primary'
                size='lg'
                onClick={handleCtaClick(content.footerCta.ctaLink)}
                asChild={!onCtaClick}>
                {onCtaClick ? (
                  <>
                    {content.footerCta.ctaText}
                    <ArrowRight className='ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform' />
                  </>
                ) : (
                  <a href={content.footerCta.ctaLink}>
                    {content.footerCta.ctaText}
                    <ArrowRight className='ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform' />
                  </a>
                )}
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

LandingTemplateEditorial.displayName = "LandingTemplateEditorial";
