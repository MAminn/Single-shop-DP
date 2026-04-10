import type React from "react";
import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "#root/components/ui/button";
import type {
  ProductPageProduct,
  ProductImage,
} from "./ProductPageModernSplit";
import type { FeaturedProduct } from "../home/HomeFeaturedProducts";
import {
  ShoppingCart,
  Heart,
  Star,
  Plus,
  Minus,
  Share2,
  Facebook,
  Twitter,
  Link as LinkIcon,
  Mail,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  X,
} from "lucide-react";
import { useMinimalI18n } from "#root/lib/i18n/MinimalI18nContext";
import { useCart } from "#root/lib/context/CartContext";
import { Link } from "#root/components/utils/Link";
import { getProductUrl } from "#root/lib/utils/route-helpers";
import { STORE_CURRENCY } from "#root/shared/config/branding";

/**
 * Props for ProductPageMinimal
 */
export interface ProductPageMinimalProps {
  product?: ProductPageProduct;
  relatedProducts?: FeaturedProduct[];
  showWishlist?: boolean;
  showSocialShare?: boolean;
  isLoading?: boolean;
  onAddToCart?: (product: ProductPageProduct) => void;
  onAddToWishlist?: (product: ProductPageProduct) => void;
  onImageClick?: (imageUrl: string, index: number) => void;
  className?: string;
}

// Default product for preview
const DEFAULT_PRODUCT: ProductPageProduct = {
  id: "mock-1",
  name: "Premium Wireless Headphones",
  price: 199.99,
  discountPrice: 149.99,
  stock: 45,
  available: true,
  imageUrl:
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
  images: [
    {
      url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
      isPrimary: true,
    },
    {
      url: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800",
    },
    {
      url: "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=800",
    },
  ],
  description:
    "High-quality wireless headphones with premium sound and comfort",
  longDescription:
    "Experience superior sound quality with our Premium Wireless Headphones. Featuring advanced noise cancellation, 40-hour battery life, and premium comfort padding.",
  rating: 4.5,
  reviewCount: 128,
  sku: "WH-PRO-2024",
  brand: "TechGear",
  specifications: [
    { label: "Connectivity", value: "Bluetooth 5.0" },
    { label: "Battery Life", value: "40 hours" },
    { label: "Weight", value: "250g" },
  ],
};

/**
 * Product Page Minimal Template
 *
 * Premium minimal product page with clean aesthetic:
 * - Heavy whitespace and breathing room
 * - Typography-driven design
 * - Minimal UI elements
 * - Calm, high-end aesthetic
 * - Focus on product and content
 * - Borderless, clean layout
 * - Scrollable recommendation carousel with expandable cards
 *
 * Best for: Premium brands, luxury items, minimalist aesthetics
 */
export function ProductPageMinimal({
  product,
  relatedProducts,
  showWishlist = true,
  isLoading = false,
  onAddToCart,
  onAddToWishlist,
  onImageClick,
  className = "",
}: ProductPageMinimalProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [cartToast, setCartToast] = useState(false);
  const { t, locale } = useMinimalI18n();
  const isAr = locale === "ar";

  if (isLoading || !product) {
    return (
      <div className={`min-h-screen bg-white ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb skeleton */}
          <div className="flex gap-2 mb-8">
            <div className="h-4 w-12 bg-stone-100 animate-pulse" />
            <div className="h-4 w-4 bg-stone-100 animate-pulse" />
            <div className="h-4 w-12 bg-stone-100 animate-pulse" />
            <div className="h-4 w-4 bg-stone-100 animate-pulse" />
            <div className="h-4 w-32 bg-stone-100 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image skeleton */}
            <div className="aspect-square bg-stone-100 animate-pulse" />
            {/* Info skeleton */}
            <div className="space-y-6 pt-4">
              <div className="h-8 w-3/4 bg-stone-100 animate-pulse" />
              <div className="h-6 w-1/4 bg-stone-100 animate-pulse" />
              <div className="h-4 w-full bg-stone-100 animate-pulse" />
              <div className="h-4 w-5/6 bg-stone-100 animate-pulse" />
              <div className="h-12 w-full bg-stone-100 animate-pulse mt-8" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const maxQty = Math.min(product.stock || 99, 99);
  const incrementQty = () => setQuantity((q) => Math.min(q + 1, maxQty));
  const decrementQty = () => setQuantity((q) => Math.max(q - 1, 1));

  const images = product.images || [
    { url: product.imageUrl || "", isPrimary: true },
  ];
  const hasDiscount =
    product.discountPrice &&
    typeof product.discountPrice === "number" &&
    product.discountPrice < product.price;

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product);
      setCartToast(true);
      setTimeout(() => setCartToast(false), 4000);
    }
  };

  const handleAddToWishlist = () => {
    if (onAddToWishlist) {
      onAddToWishlist(product);
    }
  };

  const handleImageClick = (index: number) => {
    setSelectedImage(index);
    if (onImageClick) {
      onImageClick(images[index]?.url || "", index);
    }
  };

  const renderStars = (rating: number = 0) => {
    const stars = [];
    const fullStars = Math.floor(rating);

    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-3 h-3 ${
            i < fullStars
              ? "fill-gray-900 text-gray-900"
              : "fill-gray-300 text-gray-300"
          }`}
        />,
      );
    }

    return stars;
  };

  return (
    <div className={`product-page-minimal bg-white ${className}`}>

      {/* ── Add-to-Cart Confirmation Toast ── */}
      {cartToast && (
      <div
        className='fixed top-4 start-4 z-[10001] w-[320px] bg-white border border-stone-200 shadow-xl animate-[slideDown_300ms_ease-out_forwards]'>
        <div className='h-1 bg-emerald-500 w-full animate-[shrink_4s_linear_forwards]' />
        <div className='p-4'>
          <div className='flex items-start justify-between mb-3'>
            <div className='flex items-center gap-2 text-emerald-600'>
              <Check className='w-4 h-4' />
              <span className='text-sm font-medium'>{t("product.added_to_cart")}</span>
            </div>
            <button
              type='button'
              onClick={() => setCartToast(false)}
              className='text-stone-400 hover:text-stone-600 transition-colors'>
              <X className='w-4 h-4' />
            </button>
          </div>
          <div className='flex items-center gap-3'>
            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt={product.name}
                className='w-14 h-14 object-cover flex-none'
              />
            )}
            <div className='min-w-0 flex-1'>
              <p className='text-sm text-stone-800 font-medium truncate'>{product.name}</p>
              <p className='text-sm text-stone-500'>
                {hasDiscount ? (product.discountPrice as number) : product.price} {STORE_CURRENCY}
              </p>
            </div>
          </div>
          <div className='flex gap-2 mt-3'>
            <Link
              href='/cart'
              className='flex-1 py-2 text-center text-xs font-medium border border-stone-200 text-stone-700 hover:bg-stone-50 transition-colors'>
              {t("product.view_cart")}
            </Link>
            <Link
              href='/checkout'
              className='flex-1 py-2 text-center text-xs font-medium bg-stone-900 text-white hover:bg-stone-800 transition-colors'>
              {t("product.checkout")}
            </Link>
          </div>
        </div>
      </div>
      )}

      {/* Minimal Breadcrumb */}
      <div className='border-b border-gray-100 py-6 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-7xl mx-auto'>
          <nav className='text-sm text-gray-500 font-light'>
            <a href='/' className='hover:text-gray-900'>
              {t("product.home")}
            </a>
            <span className='mx-3'>/</span>
            <a href='/shop' className='hover:text-gray-900'>
              {t("product.shop")}
            </a>
            <span className='mx-3'>/</span>
            <span className='text-gray-900'>{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Main Product Section */}
      <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24'>
        <div className='grid lg:grid-cols-2 gap-16 lg:gap-24'>
          {/* Left: Image */}
          <div className='space-y-8'>
            {/* Main Image - Minimal */}
            <div className='aspect-square overflow-hidden'>
              <img
                src={images[selectedImage]?.url || product.imageUrl}
                alt={product.name}
                className='w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity'
                onClick={() => handleImageClick(selectedImage)}
              />
            </div>

            {/* Minimal Image Selector */}
            {images.length > 1 && (
              <div className='flex gap-4'>
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleImageClick(idx)}
                    className={`flex-1 aspect-square overflow-hidden transition-opacity ${
                      idx === selectedImage
                        ? "opacity-100"
                        : "opacity-40 hover:opacity-70"
                    }`}>
                    <img
                      src={img.url}
                      alt={`View ${idx + 1}`}
                      className='w-full h-full object-cover'
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div className='space-y-12 pt-8'>
            {/* Brand */}
            {product.brand && (
              <p className='text-sm uppercase tracking-widest text-gray-500 font-light'>
                {product.brand}
              </p>
            )}

            {/* Product Name */}
            <div>
              <h1 className='text-5xl lg:text-6xl font-light text-gray-900 leading-[1.1] mb-8'>
                {product.name}
              </h1>

              {/* Rating */}
              {product.rating !== undefined && product.rating > 0 && (
                <div className='flex items-center gap-3'>
                  <div className='flex items-center gap-1'>
                    {renderStars(product.rating)}
                  </div>
                  <span className='text-sm text-gray-500 font-light'>
                    {product.rating} — {product.reviewCount || 0} {t("product.reviews")}
                  </span>
                </div>
              )}
            </div>

            {/* Price - Minimal */}
            <div className='py-8 border-y border-gray-100'>
              {hasDiscount ? (
                <div className='flex items-baseline gap-4'>
                  <span className='text-5xl font-light text-gray-900'>
                    {(product.discountPrice as number).toFixed(2)} {STORE_CURRENCY}
                  </span>
                  <span className='text-2xl font-light text-gray-400 line-through'>
                    {product.price.toFixed(2)} {STORE_CURRENCY}
                  </span>
                </div>
              ) : (
                <span className='text-5xl font-light text-gray-900'>
                  {product.price.toFixed(2)} {STORE_CURRENCY}
                </span>
              )}

              <p className='text-xs text-gray-400 font-light mt-2'>
                {t("price_includes_tax")}
              </p>

              {/* Stock - Subtle */}
              {product.available && product.stock && (
                <p className='text-sm text-emerald-600 font-light mt-3 flex items-center gap-1.5'>
                  <Check className='w-3.5 h-3.5' />
                  {t("in_stock")}
                </p>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className='text-lg text-gray-700 font-light leading-relaxed'>
                {product.description}
              </p>
            )}

            {/* Quantity Selector */}
            {product.available && (
              <div className='flex items-center gap-6'>
                <span className='text-sm text-gray-500 font-light'>{t("product.quantity")}</span>
                <div className='flex items-center border border-gray-200'>
                  <button
                    onClick={decrementQty}
                    disabled={quantity <= 1}
                    className='w-10 h-10 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 transition-colors'
                    aria-label={t("product.decrease_qty")}>
                    <Minus className='w-4 h-4' />
                  </button>
                  <span className='w-12 h-10 flex items-center justify-center text-sm font-light border-x border-gray-200 tabular-nums'>
                    {quantity}
                  </span>
                  <button
                    onClick={incrementQty}
                    disabled={quantity >= maxQty}
                    className='w-10 h-10 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 transition-colors'
                    aria-label={t("product.increase_qty")}>
                    <Plus className='w-4 h-4' />
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className='flex flex-col sm:flex-row gap-4'>
              <Button
                size='lg'
                className='bg-gray-900 hover:bg-gray-800 text-white rounded-none px-12 py-6 text-base font-light shadow-none hover:shadow-lg transition-all'
                onClick={handleAddToCart}
                disabled={!product.available}>
                {product.available ? t("add_to_cart") : t("out_of_stock")}
              </Button>

              {showWishlist && (
                <Button
                  size='lg'
                  variant='ghost'
                  className='rounded-none px-8 py-6 text-base font-light hover:bg-gray-50 group'
                  onClick={handleAddToWishlist}>
                  <Heart className='me-2 w-5 h-5 group-hover:fill-gray-900 transition-all' />
                  {t("product.save")}
                </Button>
              )}
            </div>

            {/* Social Sharing */}
            <div className='relative'>
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className='flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-light transition-colors'>
                <Share2 className='w-4 h-4' />
                {t("product.share")}
              </button>
              {showShareMenu && (
                <div className='flex items-center gap-3 mt-3'>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='w-9 h-9 flex items-center justify-center border border-gray-200 hover:border-gray-900 hover:bg-gray-900 hover:text-white transition-colors'
                    aria-label='Share on Facebook'>
                    <Facebook className='w-4 h-4' />
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}&text=${encodeURIComponent(product.name)}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='w-9 h-9 flex items-center justify-center border border-gray-200 hover:border-gray-900 hover:bg-gray-900 hover:text-white transition-colors'
                    aria-label='Share on Twitter'>
                    <Twitter className='w-4 h-4' />
                  </a>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(product.name + " " + (typeof window !== "undefined" ? window.location.href : ""))}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='w-9 h-9 flex items-center justify-center border border-gray-200 hover:border-gray-900 hover:bg-gray-900 hover:text-white transition-colors'
                    aria-label='Share on WhatsApp'>
                    <svg className='w-4 h-4' viewBox='0 0 24 24' fill='currentColor'><path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z'/></svg>
                  </a>
                  <a
                    href={`mailto:?subject=${encodeURIComponent(product.name)}&body=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                    className='w-9 h-9 flex items-center justify-center border border-gray-200 hover:border-gray-900 hover:bg-gray-900 hover:text-white transition-colors'
                    aria-label='Share via Email'>
                    <Mail className='w-4 h-4' />
                  </a>
                  <button
                    onClick={() => { if (typeof navigator !== "undefined") navigator.clipboard.writeText(window.location.href); }}
                    className='w-9 h-9 flex items-center justify-center border border-gray-200 hover:border-gray-900 hover:bg-gray-900 hover:text-white transition-colors'
                    aria-label='Copy link'>
                    <LinkIcon className='w-4 h-4' />
                  </button>
                </div>
              )}
            </div>

            {/* Long Description */}
            {product.longDescription && (
              <div className='pt-8 border-t border-gray-100'>
                <p className='text-gray-600 font-light leading-relaxed'>
                  {product.longDescription}
                </p>
              </div>
            )}

            {/* Specifications - Minimal */}
            {product.specifications && product.specifications.length > 0 && (
              <div className='pt-8 border-t border-gray-100 space-y-4'>
                {product.specifications.map((spec, idx) => (
                  <div
                    key={idx}
                    className='flex justify-between items-baseline py-2 border-b border-gray-100 last:border-0'>
                    <span className='text-gray-600 font-light'>
                      {spec.label}
                    </span>
                    <span className='text-gray-900 font-light'>
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Features - Minimal List */}
            {product.features && product.features.length > 0 && (
              <div className='pt-8 border-t border-gray-100 space-y-6'>
                {product.features.map((feature, idx) => (
                  <div key={idx}>
                    <h3 className='text-lg font-light text-gray-900 mb-1'>
                      {feature.title}
                    </h3>
                    <p className='text-sm text-gray-600 font-light'>
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            RECOMMENDATIONS — Scrollable Carousel
            Expandable cards inspired by matchperfumes.com
            ═══════════════════════════════════════════════ */}
        {relatedProducts && relatedProducts.length > 0 && (
          <RecommendationsCarousel
            products={relatedProducts}
            title={t("product.you_may_also_like")}
            currentProductId={product.id}
          />
        )}
      </div>
    </div>
  );
}

// ─── Recommendations Carousel ────────────────────────────────────────

function RecommendationsCarousel({
  products,
  title,
  currentProductId,
}: {
  products: FeaturedProduct[];
  title: string;
  currentProductId: string;
}) {
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
  }, [checkScroll, products]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector("[data-rec-card]");
    const cardWidth = card?.clientWidth ?? 220;
    const gap = 16;
    el.scrollBy({
      left: direction === "right" ? (cardWidth + gap) * 2 : -(cardWidth + gap) * 2,
      behavior: "smooth",
    });
  };

  const filteredProducts = products.filter((p) => p.id !== currentProductId);
  if (filteredProducts.length === 0) return null;

  return (
    <div className='mt-24 pt-16 border-t border-gray-100'>
      {/* Section heading */}
      <div className='text-center mb-10'>
        <h2 className='text-2xl sm:text-3xl font-light text-stone-900 tracking-tight inline-block relative pb-3'>
          {title}
          <span className='absolute bottom-0 left-1/4 right-1/4 h-[2px] bg-stone-900' />
        </h2>
      </div>

      {/* Carousel */}
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
          className='flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 justify-center'>
          {filteredProducts.map((product) => (
            <RecommendationCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Expandable Recommendation Card ──────────────────────────────────

function RecommendationCard({ product }: { product: FeaturedProduct }) {
  const [expanded, setExpanded] = useState(false);
  const { t } = useMinimalI18n();
  const { addItem } = useCart();

  const imageUrl = (() => {
    if (product.images && product.images.length > 0) {
      const primary = product.images.find((img) => img.isPrimary);
      const url = (primary || product.images[0])?.url;
      if (!url) return "/assets/placeholder-product.png";
      if (url.startsWith("http") || url.startsWith("/")) return url;
      return `/uploads/${url}`;
    }
    if (!product.imageUrl) return "/assets/placeholder-product.png";
    if (product.imageUrl.startsWith("http") || product.imageUrl.startsWith("/")) return product.imageUrl;
    return `/uploads/${product.imageUrl}`;
  })();

  const hasDiscount =
    product.discountPrice !== undefined &&
    product.discountPrice !== null &&
    Number(product.discountPrice) < product.price;

  const displayPrice = hasDiscount ? Number(product.discountPrice) : product.price;
  const productUrl = getProductUrl(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.available) return;
    addItem(
      {
        id: product.id,
        name: product.name,
        price: displayPrice,
        imageUrl,
        stock: product.stock,
      },
      1,
      {},
    );
  };

  return (
    <div
      data-rec-card
      className='flex-none w-[180px] sm:w-[200px] snap-start group'>
      {/* Clickable card container */}
      <div
        className='relative cursor-pointer'
        onClick={() => setExpanded(!expanded)}>
        {/* Image */}
        <div className='aspect-square bg-stone-50 overflow-hidden'>
          <img
            src={imageUrl}
            alt={product.name}
            className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
            loading='lazy'
          />
        </div>

        {/* Expand indicator */}
        <div className='absolute bottom-2 end-2 w-6 h-6 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm'>
          <ChevronDown
            className={`w-3.5 h-3.5 text-stone-600 transition-transform duration-300 ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {/* Basic info (always visible) */}
      <div className='pt-2.5 text-center'>
        <Link href={productUrl}>
          <h3 className='text-sm font-normal text-stone-800 line-clamp-1 hover:text-stone-600 transition-colors'>
            {product.name}
          </h3>
        </Link>
        <div className='mt-1 flex items-center justify-center gap-2'>
          {hasDiscount && (
            <span className='text-xs text-stone-400 line-through'>
              {product.price} {STORE_CURRENCY}
            </span>
          )}
          <span className={`text-sm font-medium ${hasDiscount ? "text-red-600" : "text-stone-800"}`}>
            {displayPrice} {STORE_CURRENCY}
          </span>
        </div>
      </div>

      {/* Expandable detail panel */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          expanded ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0"
        }`}>
        <div className='border-t border-stone-100 pt-2 space-y-2'>
          {product.categoryName && (
            <p className='text-xs text-stone-400 text-center'>{product.categoryName}</p>
          )}
          <Link
            href={productUrl}
            className='block w-full py-2 text-center text-xs font-medium border border-stone-200 text-stone-700 hover:border-stone-900 hover:text-stone-900 transition-colors'>
            {t("product.view_details")}
          </Link>
          <button
            type='button'
            onClick={handleAddToCart}
            disabled={!product.available}
            className='w-full py-2 border border-stone-900 text-stone-900 text-xs font-medium tracking-wide uppercase hover:bg-stone-900 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed'>
            {product.available ? t("add_to_cart") : t("out_of_stock")}
          </button>
        </div>
      </div>
    </div>
  );
}

ProductPageMinimal.displayName = "ProductPageMinimal";
