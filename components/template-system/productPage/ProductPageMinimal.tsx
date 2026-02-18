import type React from "react";
import { useState } from "react";
import { Button } from "#root/components/ui/button";
import { HomeFeaturedProducts } from "../home/HomeFeaturedProducts";
import type {
  ProductPageProduct,
  ProductImage,
} from "./ProductPageModernSplit";
import type { FeaturedProduct } from "../home/HomeFeaturedProducts";
import { ShoppingCart, Heart, Star, ArrowRight } from "lucide-react";

/**
 * Props for ProductPageMinimal
 */
export interface ProductPageMinimalProps {
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
  product = DEFAULT_PRODUCT,
  relatedProducts,
  showWishlist = true,
  onAddToCart,
  onAddToWishlist,
  onImageClick,
  className = "",
}: ProductPageMinimalProps) {
  const [selectedImage, setSelectedImage] = useState(0);

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

            {/* Actions - Minimal Buttons */}
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
