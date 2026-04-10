import type React from "react";
import { useState } from "react";
import { Button } from "#root/components/ui/button";
import { HomeFeaturedProducts } from "../home/HomeFeaturedProducts";
import type {
  ProductPageProduct,
  ProductImage,
} from "./ProductPageModernSplit";
import type { FeaturedProduct } from "../home/HomeFeaturedProducts";
import {
  ShoppingCart,
  Heart,
  Star,
  ArrowRight,
  Plus,
  Minus,
  Share2,
  Facebook,
  Twitter,
  Link as LinkIcon,
  Mail,
} from "lucide-react";

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
      {/* Minimal Breadcrumb */}
      <div className='border-b border-gray-100 py-6 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-7xl mx-auto'>
          <nav className='text-sm text-gray-500 font-light'>
            <a href='/' className='hover:text-gray-900'>
              Home
            </a>
            <span className='mx-3'>/</span>
            <a href='/shop' className='hover:text-gray-900'>
              Shop
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
              {product.rating && (
                <div className='flex items-center gap-3'>
                  <div className='flex items-center gap-1'>
                    {renderStars(product.rating)}
                  </div>
                  <span className='text-sm text-gray-500 font-light'>
                    {product.rating} — {product.reviewCount || 0} reviews
                  </span>
                </div>
              )}
            </div>

            {/* Price - Minimal */}
            <div className='py-8 border-y border-gray-100'>
              {hasDiscount ? (
                <div className='flex items-baseline gap-4'>
                  <span className='text-5xl font-light text-gray-900'>
                    EGP {(product.discountPrice as number).toFixed(2)}
                  </span>
                  <span className='text-2xl font-light text-gray-400 line-through'>
                    EGP {product.price.toFixed(2)}
                  </span>
                </div>
              ) : (
                <span className='text-5xl font-light text-gray-900'>
                  EGP {product.price.toFixed(2)}
                </span>
              )}

              {/* Stock - Subtle */}
              {product.available && product.stock && (
                <p className='text-sm text-gray-500 font-light mt-4'>
                  {product.stock} in stock
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
                <span className='text-sm text-gray-500 font-light'>Quantity</span>
                <div className='flex items-center border border-gray-200'>
                  <button
                    onClick={decrementQty}
                    disabled={quantity <= 1}
                    className='w-10 h-10 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 transition-colors'
                    aria-label='Decrease quantity'>
                    <Minus className='w-4 h-4' />
                  </button>
                  <span className='w-12 h-10 flex items-center justify-center text-sm font-light border-x border-gray-200 tabular-nums'>
                    {quantity}
                  </span>
                  <button
                    onClick={incrementQty}
                    disabled={quantity >= maxQty}
                    className='w-10 h-10 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 transition-colors'
                    aria-label='Increase quantity'>
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
                {product.available ? "Add to Cart" : "Out of Stock"}
              </Button>

              {showWishlist && (
                <Button
                  size='lg'
                  variant='ghost'
                  className='rounded-none px-8 py-6 text-base font-light hover:bg-gray-50 group'
                  onClick={handleAddToWishlist}>
                  <Heart className='mr-2 w-5 h-5 group-hover:fill-gray-900 transition-all' />
                  Save
                </Button>
              )}
            </div>

            {/* Social Sharing */}
            <div className='relative'>
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className='flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-light transition-colors'>
                <Share2 className='w-4 h-4' />
                Share
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

        {/* Related Products - Minimal */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className='mt-32 pt-16 border-t border-gray-100'>
            <h2 className='text-4xl font-light text-gray-900 mb-16'>
              Related Items
            </h2>
            <HomeFeaturedProducts
              title=''
              products={relatedProducts}
              showViewAllButton={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}

ProductPageMinimal.displayName = "ProductPageMinimal";
