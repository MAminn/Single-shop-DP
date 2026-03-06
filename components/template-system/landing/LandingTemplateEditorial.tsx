import type React from "react";
import { useState, memo } from "react";
import { Button } from "#root/components/ui/button";
import { Skeleton } from "#root/components/ui/skeleton";
import { Input } from "#root/components/ui/input";
import { Label } from "#root/components/ui/label";
import {
  ShoppingBag,
  Truck,
  Shield,
  Headphones,
  Award,
  RefreshCw,
} from "lucide-react";
import type {
  HomepageContent,
  ValuePropIconType,
} from "#root/shared/types/homepage-content";
import type { FeaturedProduct } from "../home/HomeFeaturedProducts";
import type { CategoryStripItem } from "#root/components/shop/CategoryStrip";
import type { NewArrivalProduct } from "#root/components/shop/NewArrivals";
import { getProductUrl } from "#root/lib/utils/route-helpers";
import { EditorialChrome } from "../editorial/EditorialChrome";
import { Reveal } from "../motion/Reveal";
import { StaggerContainer, StaggerItem } from "../motion/Stagger";
import { ParallaxImage } from "../motion/ParallaxImage";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export interface LandingTemplateEditorialProps {
  content: HomepageContent;
  featuredProducts?: FeaturedProduct[];
  categories?: CategoryStripItem[];
  categoriesLoading?: boolean;
  newArrivals?: NewArrivalProduct[];
  newArrivalsLoading?: boolean;
  className?: string;
  onCtaClick?: (link: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

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

const NOISE_SVG =
  "data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E";

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function safePrice(v: number | string | null | undefined): number | null {
  if (v == null) return null;
  const n = typeof v === "string" ? Number.parseFloat(v) : v;
  return Number.isFinite(n) ? n : null;
}

function formatPrice(v: number): string {
  return `EGP ${v.toFixed(2)}`;
}

function resolveImage(
  product: FeaturedProduct | NewArrivalProduct,
): string | null {
  const primary = product.images?.find((i) => i.isPrimary);
  if (primary?.url) return primary.url;
  if (product.images?.[0]?.url) return product.images[0].url;
  if (product.imageUrl) return product.imageUrl;
  return null;
}

function resolveSecondaryImage(
  product: FeaturedProduct | NewArrivalProduct,
): string | null {
  if (!product.images || product.images.length < 2) return null;
  const primaryIdx = product.images.findIndex((i) => i.isPrimary);
  const secondIdx = primaryIdx >= 0 ? (primaryIdx === 0 ? 1 : 0) : 1;
  return product.images[secondIdx]?.url ?? null;
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                    */
/* ------------------------------------------------------------------ */

export const EditorialProductTile = memo(function EditorialProductTile({
  product,
}: {
  product: FeaturedProduct | NewArrivalProduct;
}) {
  const img = resolveImage(product);
  const secondaryImg = resolveSecondaryImage(product);
  const discount = safePrice(product.discountPrice);
  const hasDiscount = discount != null && discount < product.price;
  const isSoldOut = !product.available || product.stock <= 0;

  return (
    <a
      href={getProductUrl(product.id)}
      className="group block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-stone-900/25 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-50"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-stone-200">
        {img ? (
          <>
            <img
              src={img}
              alt={product.name}
              loading="lazy"
              decoding="async"
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ${
                secondaryImg ? "group-hover:opacity-0" : ""
              }`}
            />
            {secondaryImg && (
              <img
                src={secondaryImg}
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              />
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs tracking-[0.28em] uppercase text-stone-400">
              No image
            </span>
          </div>
        )}
      </div>
      <div className="mt-3">
        {product.categoryName && (
          <p className="text-[10px] tracking-[0.28em] uppercase text-stone-500">
            {product.categoryName}
          </p>
        )}
        <p className="mt-1 text-sm font-medium text-stone-900 line-clamp-2">
          {product.name}
        </p>
        <div className="mt-1 flex items-center gap-2 text-sm">
          {hasDiscount ? (
            <>
              <span className="font-medium text-stone-900">
                {formatPrice(discount)}
              </span>
              <span className="text-stone-500 line-through">
                {formatPrice(product.price)}
              </span>
            </>
          ) : (
            <span className="text-stone-700">{formatPrice(product.price)}</span>
          )}
        </div>
        {isSoldOut && (
          <p className="mt-2 text-[10px] tracking-[0.28em] uppercase text-stone-500">
            Sold out
          </p>
        )}
      </div>
    </a>
  );
});

function SkeletonTile() {
  return (
    <div>
      <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
      <Skeleton className="mt-3 h-3 w-20 rounded" />
      <Skeleton className="mt-2 h-4 w-32 rounded" />
    </div>
  );
}

function SkeletonTileGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonTile key={i} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                    */
/* ------------------------------------------------------------------ */

export function LandingTemplateEditorial({
  content,
  featuredProducts,
  categories,
  categoriesLoading = false,
  newArrivals,
  newArrivalsLoading = false,
  className = "",
  onCtaClick,
}: LandingTemplateEditorialProps) {
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  const handleCta =
    (link: string) => (e: React.MouseEvent<HTMLButtonElement>) => {
      if (onCtaClick) {
        e.preventDefault();
        onCtaClick(link);
      }
    };

  return (
    <EditorialChrome>
    <div className={`landing-template-editorial bg-stone-50 ${className}`}>
      {/* ============================================================ */}
      {/*  HERO                                                        */}
      {/* ============================================================ */}
      {content.hero.enabled && (
        <section className="relative isolate min-h-[70vh] sm:min-h-[80vh] lg:min-h-[85vh] w-full overflow-hidden bg-stone-950">
          {/* Promo banner strip */}
          {content.promoBanner.enabled && (
            <div className="relative z-10 w-full border-b border-white/10 bg-black/25 backdrop-blur-sm">
              <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 text-white/80 sm:px-6 lg:px-10">
                <p className="text-xs tracking-[0.22em] uppercase">
                  {content.promoBanner.text}
                </p>
                {content.promoBanner.linkText &&
                  content.promoBanner.linkUrl &&
                  (onCtaClick ? (
                    <button
                      type="button"
                      onClick={() => onCtaClick(content.promoBanner.linkUrl!)}
                      className="text-xs tracking-[0.22em] uppercase text-white/85 hover:text-white hover:underline underline-offset-4 decoration-white/30"
                    >
                      {content.promoBanner.linkText}
                    </button>
                  ) : (
                    <a
                      href={content.promoBanner.linkUrl}
                      className="text-xs tracking-[0.22em] uppercase text-white/85 hover:text-white hover:underline underline-offset-4 decoration-white/30"
                    >
                      {content.promoBanner.linkText}
                    </a>
                  ))}
              </div>
            </div>
          )}

          {/* Background image / fallback */}
          {content.hero.backgroundImage ? (
            <div className="absolute inset-0 overflow-hidden">
              <ParallaxImage
                src={content.hero.backgroundImage}
                alt=""
                strength={30}
              />
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-b from-stone-900 via-stone-950 to-black" />
          )}

          {/* Noise overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: `url("${NOISE_SVG}")`,
              backgroundSize: "128px 128px",
            }}
          />

          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-transparent" />

          {/* Hero content */}
          <div className="relative z-[5] mx-auto flex w-full max-w-6xl flex-col justify-end px-4 sm:px-6 lg:px-10 pb-16 sm:pb-20 lg:pb-24 min-h-[inherit]">
            <Reveal variant="fadeUp" delay={0.1}>
            <p className="text-xs tracking-[0.32em] uppercase text-white/75">
              {content.promoBanner.enabled &&
              content.promoBanner.text.length <= 60
                ? content.promoBanner.text
                : "New Collection"}
            </p>
            </Reveal>

            <Reveal variant="fadeUp" delay={0.25}>
            <h1 className="mt-3 max-w-[22ch] text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-7xl leading-[0.95] line-clamp-2">
              {content.hero.title}
            </h1>
            </Reveal>

            {content.hero.subtitle && (
              <Reveal variant="fadeUp" delay={0.4}>
              <p className="mt-5 max-w-[54ch] text-sm text-white/80 sm:text-base leading-relaxed">
                {content.hero.subtitle}
              </p>
              </Reveal>
            )}

            <div className="mt-8 hidden h-px w-14 bg-white/25 lg:block" />

            <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button
                size="lg"
                className="rounded-full px-7 py-6 text-sm tracking-wide"
                onClick={handleCta(content.hero.ctaLink)}
                asChild={!onCtaClick}
              >
                {onCtaClick ? (
                  content.hero.ctaText
                ) : (
                  <a href={content.hero.ctaLink}>{content.hero.ctaText}</a>
                )}
              </Button>

              {content.categories.enabled &&
                (onCtaClick ? (
                  <button
                    type="button"
                    onClick={() => onCtaClick(content.categories.ctaLink)}
                    className="rounded-full border border-white/25 bg-transparent px-7 py-3 text-sm tracking-wide text-white hover:bg-white/10 transition-colors"
                  >
                    {content.categories.ctaText || "Shop All"}
                  </button>
                ) : (
                  <a
                    href={content.categories.ctaLink}
                    className="inline-flex items-center justify-center rounded-full border border-white/25 bg-transparent px-7 py-3 text-sm tracking-wide text-white hover:bg-white/10 transition-colors"
                  >
                    {content.categories.ctaText || "Shop All"}
                  </a>
                ))}
            </div>
          </div>

          <div className="absolute bottom-6 start-1/2 -translate-x-1/2 z-10 text-white/50 text-xs tracking-[0.28em] uppercase animate-pulse">
            Scroll
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/*  BRAND STATEMENT                                             */}
      {/* ============================================================ */}
      {content.brandStatement.enabled && (
        <section className="bg-stone-50 py-16 sm:py-20">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-10">
            <Reveal variant="clipReveal" className="lg:col-span-7">
              <div className="group relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-stone-200">
                {content.brandStatement.image ? (
                  <img
                    src={content.brandStatement.image}
                    alt={content.brandStatement.title}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs tracking-[0.28em] uppercase text-stone-400">
                      The Edit
                    </span>
                  </div>
                )}
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-overlay"
                  style={{
                    backgroundImage: `url("${NOISE_SVG}")`,
                    backgroundSize: "128px 128px",
                  }}
                />
              </div>
            </Reveal>
            <Reveal variant="fadeUp" delay={0.15} className="lg:col-span-5 lg:flex lg:flex-col lg:justify-end">
              <p className="text-xs tracking-[0.32em] uppercase text-stone-500">
                The Edit
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl leading-tight">
                {content.brandStatement.title}
              </h2>
              <p className="mt-5 text-sm leading-relaxed text-stone-600 sm:text-base">
                {content.brandStatement.description}
              </p>
              {content.categories.enabled &&
                (onCtaClick ? (
                  <button
                    type="button"
                    onClick={() => onCtaClick(content.categories.ctaLink)}
                    className="mt-6 inline-block text-start text-sm font-medium text-stone-900 underline underline-offset-8 decoration-stone-900/20 hover:decoration-stone-900/40 transition-colors"
                  >
                    {content.categories.ctaText || "Explore"}
                  </button>
                ) : (
                  <a
                    href={content.categories.ctaLink}
                    className="mt-6 inline-block text-sm font-medium text-stone-900 underline underline-offset-8 decoration-stone-900/20 hover:decoration-stone-900/40 transition-colors"
                  >
                    {content.categories.ctaText || "Explore"}
                  </a>
                ))}
            </Reveal>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/*  CATEGORIES STRIP                                            */}
      {/* ============================================================ */}
      {content.categories.enabled && (
        <section className="py-16 sm:py-20 bg-stone-50">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10">
            <p className="text-xs tracking-[0.32em] uppercase text-stone-500">
              Shop by Edit
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl leading-tight">
              {content.categories.title}
            </h2>
            {content.categories.subtitle && (
              <p className="mt-3 text-sm text-stone-600 sm:text-base leading-relaxed max-w-lg">
                {content.categories.subtitle}
              </p>
            )}

            <Reveal variant="fadeUp">
            {categoriesLoading ? (
              <div className="mt-10 flex gap-4 overflow-x-auto pb-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className="w-[220px] shrink-0">
                    <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
                    <Skeleton className="mt-3 h-4 w-20 rounded" />
                  </div>
                ))}
              </div>
            ) : categories && categories.length > 0 ? (
              <div className="mt-10 overflow-x-auto">
                <StaggerContainer className="flex gap-4 pb-2 snap-x snap-mandatory">
                  {categories.map((cat) => (
                    <StaggerItem key={cat.id} className="w-[220px] shrink-0 snap-start">
                    <a
                      href={`/featured/categories/${cat.slug}`}
                      className="group relative block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-stone-900/25 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-50"
                    >
                      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-stone-200">
                        {cat.imageUrl ? (
                          <img
                            src={cat.imageUrl}
                            alt={cat.name}
                            loading="lazy"
                            decoding="async"
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs tracking-[0.28em] uppercase text-stone-400">
                              {cat.name}
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent" />
                        <p className="absolute bottom-4 start-4 text-sm font-medium tracking-wide text-white">
                          {cat.name}
                        </p>
                      </div>
                    </a>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </div>
            ) : null}
            </Reveal>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/*  NEW ARRIVALS                                                */}
      {/* ============================================================ */}
      {(newArrivalsLoading || (newArrivals && newArrivals.length > 0)) && (
        <section className="py-16 sm:py-20 bg-stone-50">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10">
            <p className="text-xs tracking-[0.32em] uppercase text-stone-500">
              New In
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl leading-tight">
              Just Arrived
            </h2>
            <p className="mt-3 text-sm text-stone-600 leading-relaxed">
              The latest additions to our collection.
            </p>
            <div className="mt-10">
              {newArrivalsLoading ? (
                <SkeletonTileGrid count={4} />
              ) : (
                <StaggerContainer className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
                  {newArrivals!.slice(0, 8).map((product) => (
                    <StaggerItem key={product.id}>
                      <EditorialProductTile product={product} />
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/*  FEATURED PRODUCTS                                           */}
      {/* ============================================================ */}
      {content.featuredProducts.enabled && (
        <section className="py-16 sm:py-20 bg-stone-50">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <p className="text-xs tracking-[0.32em] uppercase text-stone-500">
                  Curated
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl leading-tight">
                  {content.featuredProducts.title}
                </h2>
                {content.featuredProducts.subtitle && (
                  <p className="mt-3 text-sm text-stone-600 sm:text-base leading-relaxed max-w-lg">
                    {content.featuredProducts.subtitle}
                  </p>
                )}
              </div>
              {content.featuredProducts.viewAllLink &&
                (onCtaClick ? (
                  <button
                    type="button"
                    onClick={() =>
                      onCtaClick(content.featuredProducts.viewAllLink)
                    }
                    className="inline-flex text-sm font-medium text-stone-900 underline underline-offset-8 decoration-stone-900/20 hover:decoration-stone-900/40 transition-colors"
                  >
                    {content.featuredProducts.viewAllText || "View All"}
                  </button>
                ) : (
                  <a
                    href={content.featuredProducts.viewAllLink}
                    className="inline-flex text-sm font-medium text-stone-900 underline underline-offset-8 decoration-stone-900/20 hover:decoration-stone-900/40 transition-colors"
                  >
                    {content.featuredProducts.viewAllText || "View All"}
                  </a>
                ))}
            </div>
            <div className="mt-10">
              {!featuredProducts ? (
                <SkeletonTileGrid count={8} />
              ) : featuredProducts.length > 0 ? (
                <StaggerContainer className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
                  {featuredProducts.map((product) => (
                    <StaggerItem key={product.id}>
                      <EditorialProductTile product={product} />
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              ) : null}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/*  VALUE PROPS                                                 */}
      {/* ============================================================ */}
      {content.valueProps.enabled && content.valueProps.items.length > 0 && (
        <section className="py-14 sm:py-16 bg-stone-50">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10">
            <div className="mb-10 h-px w-full bg-stone-900/10" />
            <StaggerContainer className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              {content.valueProps.items.map((item, idx) => {
                const IconComp = ICON_MAP[item.icon];
                return (
                  <StaggerItem key={idx}>
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-900/10 bg-stone-100">
                      <IconComp
                        className="h-4 w-4 text-stone-700"
                        aria-hidden="true"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-stone-900">
                        {item.title}
                      </p>
                      <p className="mt-1 text-sm text-stone-600 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/*  NEWSLETTER                                                  */}
      {/* ============================================================ */}
      {content.newsletter.enabled && (
        <section className="py-16 sm:py-20 bg-stone-950 text-white">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end">
              <Reveal variant="fadeUp" className="lg:col-span-6">
                <p className="text-xs tracking-[0.32em] uppercase text-white/60">
                  Stay in the loop
                </p>
                <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-white">
                  {content.newsletter.title}
                </h2>
                <p className="mt-4 text-sm sm:text-base text-white/70 leading-relaxed">
                  {content.newsletter.subtitle}
                </p>
              </Reveal>
              <Reveal variant="fadeUp" delay={0.15} className="lg:col-span-6">
                {newsletterSubmitted ? (
                  <p className="text-sm text-white/80">
                    Thank you for subscribing.
                  </p>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setNewsletterSubmitted(true);
                      setTimeout(() => setNewsletterSubmitted(false), 3000);
                    }}
                    className="flex flex-col gap-3 sm:flex-row"
                  >
                    <Label
                      htmlFor="editorial-newsletter-email"
                      className="sr-only"
                    >
                      Email
                    </Label>
                    <Input
                      id="editorial-newsletter-email"
                      type="email"
                      required
                      placeholder={content.newsletter.placeholderText}
                      className="h-12 flex-1 rounded-full bg-white/5 text-white placeholder:text-white/40 border border-white/15 focus-visible:ring-2 focus-visible:ring-white/40"
                    />
                    <Button
                      type="submit"
                      size="lg"
                      className="h-12 rounded-full px-7 text-sm tracking-wide"
                    >
                      {content.newsletter.ctaText}
                    </Button>
                  </form>
                )}
                {content.newsletter.privacyText && (
                  <p className="mt-4 text-xs text-white/40 leading-relaxed">
                    {content.newsletter.privacyText}
                  </p>
                )}
              </Reveal>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/*  FOOTER CTA                                                  */}
      {/* ============================================================ */}
      {content.footerCta.enabled && (
        <section className="py-16 sm:py-20 bg-stone-50">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10">
            <div className="mb-10 h-px w-full bg-stone-900/10" />
            <Reveal variant="fadeUp">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs tracking-[0.32em] uppercase text-stone-500">
                {content.footerCta.subtitle}
              </p>
              <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-stone-900 leading-tight">
                {content.footerCta.title}
              </h2>
              <div className="mt-8">
                <Button
                  size="lg"
                  className="rounded-full px-8 py-6 text-sm tracking-wide"
                  onClick={handleCta(content.footerCta.ctaLink)}
                  asChild={!onCtaClick}
                >
                  {onCtaClick ? (
                    content.footerCta.ctaText
                  ) : (
                    <a href={content.footerCta.ctaLink}>
                      {content.footerCta.ctaText}
                    </a>
                  )}
                </Button>
              </div>
            </div>
            </Reveal>
          </div>
        </section>
      )}
    </div>
    </EditorialChrome>
  );
}

LandingTemplateEditorial.displayName = "LandingTemplateEditorial";
