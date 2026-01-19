import type React from "react";
import { useState } from "react";
import { Button } from "#root/components/ui/button";
import { Badge } from "#root/components/ui/badge";
import { HomeFeaturedProducts } from "../home/HomeFeaturedProducts";
import type {
  ProductPageProduct,
  ProductImage,
} from "./ProductPageModernSplit";
import type { FeaturedProduct } from "../home/HomeFeaturedProducts";
import { ShoppingCart, Heart, Star, ArrowRight, Check } from "lucide-react";

/**
 * Props for ProductPageEditorial
 */
export interface ProductPageEditorialProps {
  product?: ProductPageProduct;
  relatedProducts?: FeaturedProduct[];
  showWishlist?: boolean;
  showSocialShare?: boolean;
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
    "Experience superior sound quality with our Premium Wireless Headphones. Featuring advanced noise cancellation, 40-hour battery life, and premium comfort padding. Every detail has been meticulously crafted to deliver an unparalleled listening experience.",
  rating: 4.5,
  reviewCount: 128,
  sku: "WH-PRO-2024",
  brand: "TechGear",
};

/**
 * Product Page Editorial Template
 *
 * Luxury lifestyle product page with storytelling focus:
 * - Large, immersive hero image
 * - Editorial typography and spacing
 * - Emotion-first design language
 * - Magazine-style layout
 * - Premium minimal aesthetic
 * - Story-driven content presentation
 *
 * Best for: Luxury goods, fashion, lifestyle brands, high-end products
 */
export function ProductPageEditorial({
  product = DEFAULT_PRODUCT,
  relatedProducts,
  showWishlist = true,
  onAddToCart,
  onAddToWishlist,
  onImageClick,
  className = "",
}: ProductPageEditorialProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  const images = product.images || [
    { url: product.imageUrl || "", isPrimary: true },
  ];
  const hasDiscount =
    product.discountPrice &&
    typeof product.discountPrice === "number" &&
    product.discountPrice < product.price;
  const discount = hasDiscount
    ? Math.round(
        ((product.price - (product.discountPrice as number)) / product.price) *
          100
      )
    : 0;

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
          className={`w-4 h-4 ${
            i < fullStars
              ? "fill-gray-900 text-gray-900"
              : "fill-gray-300 text-gray-300"
          }`}
        />
      );
    }

    return stars;
  };

  return (
    <div className={`product-page-editorial bg-white ${className}`}>
      {/* Hero Section - Full Width Image */}
      <div className='relative h-[70vh] lg:h-[80vh] bg-gray-900 overflow-hidden'>
        <img
          src={images[selectedImage]?.url || product.imageUrl}
          alt={product.name}
          className='w-full h-full object-cover cursor-pointer'
          onClick={() => handleImageClick(selectedImage)}
        />

        {/* Discount Badge */}
        {discount > 0 && (
          <div className='absolute top-8 right-8'>
            <Badge className='bg-white text-gray-900 hover:bg-gray-100 text-lg px-4 py-2 rounded-full'>
              -{discount}%
            </Badge>
          </div>
        )}

        {/* Image Selector Dots */}
        {images.length > 1 && (
          <div className='absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3'>
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => handleImageClick(idx)}
                className={`w-3 h-3 rounded-full transition-all ${
                  idx === selectedImage
                    ? "bg-white w-8"
                    : "bg-white/50 hover:bg-white/75"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Info Section */}
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24'>
        <div className='text-center mb-16'>
          {/* Brand */}
          {product.brand && (
            <p className='text-sm uppercase tracking-widest text-gray-500 mb-4'>
              {product.brand}
            </p>
          )}

          {/* Product Name */}
          <h1 className='text-5xl sm:text-6xl lg:text-7xl font-light text-gray-900 mb-6 leading-tight'>
            {product.name}
          </h1>

          {/* Rating */}
          {product.rating && (
            <div className='flex items-center justify-center gap-2 mb-8'>
              <div className='flex items-center gap-1'>
                {renderStars(product.rating)}
              </div>
              <span className='text-sm text-gray-600 font-light'>
                {product.rating} — {product.reviewCount || 0} reviews
              </span>
            </div>
          )}

          {/* Price */}
          <div className='flex items-center justify-center gap-4 mb-12'>
            {hasDiscount ? (
              <>
                <span className='text-5xl font-light text-gray-900'>
                  ${(product.discountPrice as number).toFixed(2)}
                </span>
                <span className='text-3xl font-light text-gray-400 line-through'>
                  ${product.price.toFixed(2)}
                </span>
              </>
            ) : (
              <span className='text-5xl font-light text-gray-900'>
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>

          {/* CTA Buttons */}
          <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
            <Button
              size='lg'
              className='bg-gray-900 hover:bg-gray-800 text-white rounded-full px-12 py-6 text-lg font-light'
              onClick={handleAddToCart}
              disabled={!product.available}>
              {product.available ? "Add to Cart" : "Out of Stock"}
            </Button>

            {showWishlist && (
              <Button
                size='lg'
                variant='ghost'
                className='rounded-full px-8 py-6 hover:bg-gray-100'
                onClick={handleAddToWishlist}>
                <Heart className='mr-2 w-5 h-5' />
                Save
              </Button>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className='border-t border-gray-200 my-16' />

        {/* Description - Editorial Style */}
        <div className='prose prose-lg max-w-2xl mx-auto text-center'>
          <p className='text-2xl font-light text-gray-700 leading-relaxed mb-8'>
            {product.description}
          </p>

          {product.longDescription && (
            <p className='text-lg font-light text-gray-600 leading-relaxed'>
              {product.longDescription}
            </p>
          )}
        </div>

        {/* Features - Editorial Grid */}
        {product.features && product.features.length > 0 && (
          <>
            <div className='border-t border-gray-200 my-16' />

            <div className='grid md:grid-cols-2 gap-12 max-w-3xl mx-auto'>
              {product.features.map((feature, idx) => (
                <div key={idx} className='text-center'>
                  <Check className='w-8 h-8 text-gray-900 mx-auto mb-4' />
                  <h3 className='text-xl font-light text-gray-900 mb-2'>
                    {feature.title}
                  </h3>
                  <p className='text-gray-600 font-light leading-relaxed'>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Specifications - Minimal List */}
        {product.specifications && product.specifications.length > 0 && (
          <>
            <div className='border-t border-gray-200 my-16' />

            <div className='max-w-2xl mx-auto'>
              <h2 className='text-3xl font-light text-gray-900 mb-8 text-center'>
                Specifications
              </h2>
              <div className='space-y-4'>
                {product.specifications.map((spec, idx) => (
                  <div
                    key={idx}
                    className='flex justify-between py-4 border-b border-gray-200 last:border-0'>
                    <span className='text-gray-600 font-light'>
                      {spec.label}
                    </span>
                    <span className='text-gray-900 font-light'>
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Related Products - Editorial Style */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className='bg-gray-50 py-20'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <h2 className='text-4xl font-light text-gray-900 mb-12 text-center'>
              Explore Similar Pieces
            </h2>
            <HomeFeaturedProducts
              title=''
              products={relatedProducts}
              showViewAllButton={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}

ProductPageEditorial.displayName = "ProductPageEditorial";
