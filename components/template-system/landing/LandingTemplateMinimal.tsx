import { useState, useRef, useCallback, useEffect } from "react";
import type React from "react";
import { Link } from "#root/components/utils/Link";
import { Button } from "#root/components/ui/button";
import { HeroCarousel } from "#root/components/ui/hero-carousel";
import type { HeroSlide } from "#root/components/ui/hero-carousel";
import { MinimalProductCarousel } from "#root/components/template-system/minimal/MinimalProductCarousel";
import { QuickViewDialog } from "#root/components/template-system/minimal/QuickViewDialog";
import { MinimalTestimonialsSection } from "#root/components/template-system/minimal/MinimalTestimonials";
import type { MinimalProduct } from "#root/components/template-system/minimal/MinimalProductCard";
import { HomeFeaturedProducts } from "../home/HomeFeaturedProducts";
import type { FeaturedProduct } from "../home/HomeFeaturedProducts";
import type { CategoryStripItem } from "#root/components/shop/CategoryStrip";
import type { NewArrivalProduct } from "#root/components/shop/NewArrivals";
import {
  ShoppingBag,
  Truck,
  Shield,
  Headphones,
  Award,
  RefreshCw,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type {
  HomepageContent,
  ValuePropIconType,
} from "#root/shared/types/homepage-content";
import { useMinimalI18n } from "#root/lib/i18n/MinimalI18nContext";

/**
 * Props for the LandingTemplateMinimal component
 */
export interface LandingTemplateMinimalProps {
  content: HomepageContent;
  featuredProducts?: FeaturedProduct[];
  discountedProducts?: FeaturedProduct[];
  categories?: CategoryStripItem[];
  categoriesLoading?: boolean;
  newArrivals?: (NewArrivalProduct & { categories?: { id: string; name: string }[] })[];
  newArrivalsLoading?: boolean;
  className?: string;
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

// ─── Helpers ─────────────────────────────────────────────

function resolveImageUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http")) return url;
  if (url.startsWith("/")) return url;
  return `/uploads/${url}`;
}

// ─── Category Carousel ───────────────────────────────────────────────

function CategoryCarousel({ categories }: { categories: CategoryStripItem[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll, categories]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector("[data-cat-card]");
    const cardWidth = card?.clientWidth ?? 240;
    const gap = 24;
    const distance = (cardWidth + gap) * 2;
    el.scrollBy({ left: direction === "right" ? distance : -distance, behavior: "smooth" });
  };

  return (
    <div className='relative'>
      <button
        onClick={() => scroll("left")}
        disabled={!canScrollLeft}
        className='absolute -start-2 top-1/2 -translate-y-1/2 z-10 hidden md:flex w-9 h-9 items-center justify-center border border-stone-200 bg-white hover:border-stone-900 disabled:opacity-20 disabled:cursor-not-allowed transition-colors'
        aria-label='Scroll left'>
        <ChevronLeft className='w-4 h-4' />
      </button>
      <button
        onClick={() => scroll("right")}
        disabled={!canScrollRight}
        className='absolute -end-2 top-1/2 -translate-y-1/2 z-10 hidden md:flex w-9 h-9 items-center justify-center border border-stone-200 bg-white hover:border-stone-900 disabled:opacity-20 disabled:cursor-not-allowed transition-colors'
        aria-label='Scroll right'>
        <ChevronRight className='w-4 h-4' />
      </button>

      <div
        ref={scrollRef}
        className='flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 justify-center'>
        {categories.map((cat) => {
          const imgSrc = resolveImageUrl(cat.imageUrl);
          return (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              data-cat-card
              className='group text-center flex-none w-[180px] sm:w-[220px] lg:w-[260px] snap-start'>
              <div className='aspect-[4/5] overflow-hidden bg-stone-50'>
                {imgSrc ? (
                  <img
                    src={imgSrc}
                    alt={cat.name}
                    className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
                    loading='lazy'
                  />
                ) : (
                  <div className='w-full h-full flex items-center justify-center bg-stone-100'>
                    <ShoppingBag className='w-12 h-12 text-stone-300' />
                  </div>
                )}
              </div>
              <h3 className='mt-3 text-sm sm:text-base font-normal text-stone-800 group-hover:text-stone-600 transition-colors'>
                {cat.name}
              </h3>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ─── Testimonials Data ────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    name: "نورة العتيبي",
    nameEn: "Sarah Mitchell",
    review: "من أفضل المنتجات اللي استخدمتها وبصراحة يستاهل أضعاف سعره، جودة عالية وتوصيل سريع",
    reviewEn: "Absolutely love the quality! Fast shipping and the product exceeded my expectations. Will definitely order again.",
  },
  {
    name: "محمد المحسن",
    nameEn: "James Cooper",
    review: "تجربة شراء ممتازة من البداية للنهاية، خدمة عملاء رائعة والمنتج طلع أحلى من الصور",
    reviewEn: "Excellent shopping experience from start to finish. Customer service was outstanding and the product looks even better in person.",
  },
  {
    name: "فرح أحمد",
    nameEn: "Emily Chen",
    review: "بصراحة تميز وإتقان سواء على مستوى التقديم أو على مستوى جودة المنتجات، شكراً جزيلاً",
    reviewEn: "The attention to detail is remarkable. Premium quality packaging and the product itself is simply stunning. Highly recommended!",
  },
  {
    name: "مهند المري",
    nameEn: "David Wilson",
    review: "ممتاز! المنتج وصل بسرعة والجودة فوق الممتازة، أنصح الكل يجربه بدون تردد",
    reviewEn: "Top-notch product and incredibly fast delivery. The quality speaks for itself — I've already recommended it to all my friends.",
  },
  {
    name: "ريم الشمري",
    nameEn: "Olivia Taylor",
    review: "يجنن! كل شي كان مرتب ومغلف بشكل أنيق، والمنتج نفسه جودته عالية جداً",
    reviewEn: "Everything was beautifully packaged and presented. The product quality is exceptional — worth every penny!",
  },
];

function TestimonialsSection() {
  const { t, locale } = useMinimalI18n();
  const isAr = locale === "ar";
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector("[data-testimonial]");
    const cardWidth = card?.clientWidth ?? 320;
    const gap = 24;
    el.scrollBy({
      left: direction === "right" ? cardWidth + gap : -(cardWidth + gap),
      behavior: "smooth",
    });
  };

  return (
    <section className="py-14 sm:py-20 bg-stone-50">
      <div className="max-w-[1400px] mx-auto">
        {/* Section heading */}
        <div className="text-center mb-10 sm:mb-14 px-4">
          <h2 className="text-2xl sm:text-3xl font-light text-stone-900 tracking-tight inline-block relative pb-3">
            {t("testimonials")}
            <span className="absolute bottom-0 left-1/4 right-1/4 h-[2px] bg-stone-900" />
          </h2>
        </div>

        {/* Carousel */}
        <div className="relative">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="absolute -start-2 top-1/2 -translate-y-1/2 z-10 hidden md:flex w-9 h-9 items-center justify-center border border-stone-200 bg-white hover:border-stone-900 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="absolute -end-2 top-1/2 -translate-y-1/2 z-10 hidden md:flex w-9 h-9 items-center justify-center border border-stone-200 bg-white hover:border-stone-900 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 px-4 sm:px-6"
          >
            {TESTIMONIALS.map((item, i) => (
              <div
                key={i}
                data-testimonial
                className="flex-none w-[280px] sm:w-[320px] snap-start bg-white border border-stone-100 p-6 flex flex-col items-center text-center"
              >
                {/* Avatar */}
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-stone-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                  </svg>
                </div>

                {/* Name */}
                <h3 className="text-sm font-medium text-stone-900 mb-2">
                  {isAr ? item.name : item.nameEn}
                </h3>

                {/* Stars — always 5 */}
                <div className="flex items-center gap-0.5 mb-3">
                  {[...Array(5)].map((_, s) => (
                    <svg key={s} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Review text */}
                <p className="text-sm text-stone-600 leading-relaxed line-clamp-4">
                  {isAr ? item.review : item.reviewEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Minimal Landing Page — Commerce-First
 *
 * Inspired by matchperfumes.com. Image-heavy, clean, designed to sell:
 * - Scrolling marquee announcement bar
 * - Full-width hero image carousel
 * - Visual category grid with images
 * - Horizontal product carousels (Featured + New Arrivals)
 * - Full-width promotional banner
 * - Value propositions strip
 * - Newsletter + closing CTA
 */
export function LandingTemplateMinimal({
  content,
  featuredProducts = [],
  discountedProducts = [],
  categories = [],
  categoriesLoading = false,
  newArrivals = [],
  newArrivalsLoading = false,
  className = "",
  onCtaClick,
}: LandingTemplateMinimalProps) {
  const { t, locale } = useMinimalI18n();
  const [quickViewProduct, setQuickViewProduct] = useState<MinimalProduct | null>(null);

  const navigate = (link: string) => {
    if (onCtaClick) {
      onCtaClick(link);
    } else {
      window.location.href = link;
    }
  };

  // ─── Build hero slides from CMS ───
  // Priority: heroSlides array > legacy single backgroundImage
  const heroSlides: HeroSlide[] = (() => {
    // 1. Use heroSlides array if it has entries
    if (content.hero.heroSlides && content.hero.heroSlides.length > 0) {
      return content.hero.heroSlides.map((slide) => ({
        imageUrl: resolveImageUrl(slide.imageUrl) || "",
        mobileImageUrl: resolveImageUrl(slide.mobileImageUrl),
        linkUrl: slide.linkUrl,
        alt: slide.alt,
      }));
    }

    // 2. Fallback: build from legacy backgroundImage + brandStatement
    const slides: HeroSlide[] = [];
    if (content.hero.backgroundImage) {
      slides.push({
        imageUrl: resolveImageUrl(content.hero.backgroundImage) || "",
        mobileImageUrl: resolveImageUrl(content.hero.mobileBackgroundImage),
        linkUrl: content.hero.ctaLink,
        alt: content.hero.title,
      });
    }
    if (content.brandStatement.enabled && content.brandStatement.image) {
      slides.push({
        imageUrl: resolveImageUrl(content.brandStatement.image) || "",
        linkUrl: content.categories.ctaLink || "/shop",
        alt: content.brandStatement.title,
      });
    }
    return slides;
  })();

  // Convert newArrivals to MinimalProduct[] for the carousel
  const newArrivalProducts: MinimalProduct[] = newArrivals.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    discountPrice: p.discountPrice,
    stock: p.stock,
    imageUrl: p.imageUrl,
    images: p.images,
    categoryName: p.categoryName ?? undefined,
    available: p.available,
    categories: p.categories,
    isNew: true,
  }));

  // Convert featuredProducts to MinimalProduct[]
  const featuredMinimal: MinimalProduct[] = featuredProducts.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    discountPrice: p.discountPrice,
    stock: p.stock,
    imageUrl: p.imageUrl,
    images: p.images,
    categoryName: p.categoryName ?? undefined,
    available: p.available,
    categories: p.categories,
  }));

  // Convert discountedProducts to MinimalProduct[]
  const discountedMinimal: MinimalProduct[] = discountedProducts.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    discountPrice: p.discountPrice,
    stock: p.stock,
    imageUrl: p.imageUrl,
    images: p.images,
    categoryName: p.categoryName ?? undefined,
    available: p.available,
    categories: p.categories,
  }));

  return (
    <div className={`landing-template-minimal bg-white ${className}`}>

      {/* ═══════════════════════════════════════════════
          2. HERO IMAGE CAROUSEL
          ═══════════════════════════════════════════════ */}
      {content.hero.enabled && heroSlides.length > 0 ? (
        <HeroCarousel
          slides={heroSlides}
          interval={5000}
        />
      ) : content.hero.enabled ? (
        /* Fallback: text-only hero when no images are uploaded */
        <section className='relative min-h-[50vh] flex items-center justify-center bg-stone-100'>
          <div className='max-w-3xl mx-auto text-center px-6'>
            <h1 className='text-4xl sm:text-5xl lg:text-7xl font-light text-stone-900 mb-6 leading-[1.1] tracking-tight'>
              {content.hero.title}
            </h1>
            <p className='text-lg sm:text-xl text-stone-500 font-light mb-10 leading-relaxed'>
              {content.hero.subtitle}
            </p>
            <Button
              variant='primary'
              size='lg'
              onClick={() => navigate(content.hero.ctaLink)}
              asChild={!onCtaClick}>
              {onCtaClick ? (
                <>{content.hero.ctaText}</>
              ) : (
                <a href={content.hero.ctaLink}>{content.hero.ctaText}</a>
              )}
            </Button>
          </div>
        </section>
      ) : null}

      {/* ═══════════════════════════════════════════════
          3. CATEGORY GRID — Clean image + title (matchperfumes style)
          ═══════════════════════════════════════════════ */}
      {content.categories.enabled && (
        <section className='py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8'>
          <div className='max-w-[1400px] mx-auto'>
            {/* Centred heading with underline */}
            <div className='text-center mb-10 sm:mb-14'>
              <h2 className='text-2xl sm:text-3xl lg:text-4xl font-light text-stone-900 tracking-tight inline-block relative pb-3'>
                {locale === "ar" && content.categories.titleAr ? content.categories.titleAr : content.categories.title}
                <span className='absolute bottom-0 left-1/4 right-1/4 h-[2px] bg-stone-900' />
              </h2>
            </div>

            {categoriesLoading ? (
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6'>
                {[...Array(4)].map((_, i) => (
                  <div key={i}>
                    <div className='aspect-[4/5] bg-stone-100 animate-pulse' />
                    <div className='h-4 bg-stone-100 animate-pulse mt-3 mx-auto w-24' />
                  </div>
                ))}
              </div>
            ) : categories.length > 0 ? (
              <CategoryCarousel categories={categories} />
            ) : (
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6'>
                {[t("new_arrivals"), t("featured"), t("categories"), t("on_sale")].map(
                  (label, i) => (
                    <div
                      key={i}
                      className='group text-center cursor-pointer'
                      onClick={() => navigate("/shop")}>
                      <div className='aspect-[4/5] bg-stone-100 flex items-center justify-center'>
                        <ShoppingBag className='w-12 h-12 text-stone-300' />
                      </div>
                      <h3 className='mt-3 text-sm sm:text-base font-normal text-stone-800'>
                        {label}
                      </h3>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════
          4. DISCOUNTED / ON-SALE PRODUCTS CAROUSEL
          ═══════════════════════════════════════════════ */}
      {(content.discountedProducts?.enabled !== false) && discountedMinimal.length > 0 && (
        <MinimalProductCarousel
          products={discountedMinimal}
          title={locale === "ar" && content.discountedProducts?.titleAr ? content.discountedProducts.titleAr : (content.discountedProducts?.title || t("on_sale"))}
          viewAllHref={content.discountedProducts?.viewAllLink || '/shop'}
          viewAllText={locale === "ar" && content.discountedProducts?.viewAllTextAr ? content.discountedProducts.viewAllTextAr : (content.discountedProducts?.viewAllText || t("view_all"))}
          className='bg-white'
          onQuickView={setQuickViewProduct}
        />
      )}

      {/* ═══════════════════════════════════════════════
          5. FEATURED PRODUCTS — Minimal card carousel
          ═══════════════════════════════════════════════ */}
      {content.featuredProducts.enabled && featuredMinimal.length > 0 && (
        <MinimalProductCarousel
          products={featuredMinimal}
          title={locale === "ar" && content.featuredProducts.titleAr ? content.featuredProducts.titleAr : content.featuredProducts.title}
          viewAllHref={content.featuredProducts.viewAllLink}
          viewAllText={locale === "ar" && content.featuredProducts.viewAllTextAr ? content.featuredProducts.viewAllTextAr : content.featuredProducts.viewAllText}
          className='bg-stone-50'
          onQuickView={setQuickViewProduct}
        />
      )}

      

      {/* ═══════════════════════════════════════════════
          7. NEW ARRIVALS — Minimal card carousel
          ═══════════════════════════════════════════════ */}
      {(content.newArrivals?.enabled !== false) && newArrivalProducts.length > 0 && (
        <MinimalProductCarousel
          products={newArrivalProducts}
          title={locale === "ar" && content.newArrivals?.titleAr ? content.newArrivals.titleAr : (content.newArrivals?.title || t("new_arrivals"))}
          viewAllHref={content.newArrivals?.viewAllLink || '/shop'}
          viewAllText={locale === "ar" && content.newArrivals?.viewAllTextAr ? content.newArrivals.viewAllTextAr : (content.newArrivals?.viewAllText || t("view_all"))}
          className='bg-stone-50'
          onQuickView={setQuickViewProduct}
        />
      )}



      {/* ═══════════════════════════════════════════════
          BOTTOM IMAGE CAROUSEL (above testimonials)
          ═══════════════════════════════════════════════ */}
      {(() => {
        const bottomSlides: HeroSlide[] = (content.bottomCarousel?.slides ?? [])
          .filter((s) => s.imageUrl)
          .map((s) => ({
            imageUrl: resolveImageUrl(s.imageUrl) || "",
            mobileImageUrl: resolveImageUrl(s.mobileImageUrl),
            linkUrl: s.linkUrl,
            alt: s.alt,
          }));
        return content.bottomCarousel?.enabled !== false && bottomSlides.length > 0 ? (
          <HeroCarousel slides={bottomSlides} interval={5000} />
        ) : null;
      })()}

      {/* ═══════════════════════════════════════════════
          8. TESTIMONIALS
          ═══════════════════════════════════════════════ */}
      <MinimalTestimonialsSection />

      {/* Quick View Dialog */}
      <QuickViewDialog
        product={quickViewProduct}
        open={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}

LandingTemplateMinimal.displayName = "LandingTemplateMinimal";
