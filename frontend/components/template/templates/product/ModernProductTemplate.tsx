import type React from 'react';
import { Star, Heart, ShoppingCart, Minus, Plus, Truck, Shield, RotateCcw, ZoomIn, Share2 } from 'lucide-react';
import type { ProductTemplateData } from '../../templateRegistry';
import { useCart } from "#root/lib/context/CartContext";
import { trpc } from "#root/shared/trpc/client";

interface ModernProductTemplateProps {
  data: ProductTemplateData;
  onUpdateData?: (updates: Partial<ProductTemplateData>) => void;
}

const ModernProductTemplate: React.FC<ModernProductTemplateProps> = ({ data, onUpdateData }) => {
  const { addItem } = useCart();
  
  // Use provided data or fallback to empty state
  const templateData = data || {
    product: {
      id: '',
      name: '',
      description: '',
      price: 0,
      discountPrice: null,
      images: [],
      stock: 0,
      available: false,
      categoryId: '',
      categoryName: '',
      vendorId: '',
      vendorName: '',
      variants: [],
      specifications: {},
      features: []
    },
    reviews: [],
    reviewStats: { averageRating: 0, totalReviews: 0 },
    relatedProducts: [],
    selectedOptions: {},
    quantity: 1,
    currentImageIndex: 0,
    isZoomed: false,
    isAddingToCart: false,
    isSubmittingReview: false,
    isLoading: false,
    error: null
  };

  const updateLocalData = (updates: Partial<ProductTemplateData>) => {
    onUpdateData?.(updates);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= templateData.product.stock) {
      updateLocalData({ quantity: newQuantity });
    }
  };

  const handleOptionChange = (optionName: string, value: string) => {
    updateLocalData({
      selectedOptions: {
        ...templateData.selectedOptions,
        [optionName]: value
      }
    });
  };

  const handleImageChange = (index: number) => {
    updateLocalData({ currentImageIndex: index });
  };

  const toggleZoom = () => {
    updateLocalData({ isZoomed: !templateData.isZoomed });
  };

  const handleAddToCart = async () => {
    updateLocalData({ isAddingToCart: true });
    try {
      const success = addItem(
        {
          id: templateData.product.id,
          name: templateData.product.name,
          price: typeof templateData.product.price === 'string' ? Number.parseFloat(templateData.product.price) : templateData.product.price,
          stock: templateData.product.stock,
          categoryName: templateData.product.categoryName,
          vendorId: templateData.product.vendorId ? Number(templateData.product.vendorId) : undefined,
          variants: templateData.product.variants,
          imageUrl: templateData.product.images && templateData.product.images.length > 0 
            ? templateData.product.images.find(img => img.isPrimary)?.url || templateData.product.images[0]?.url
            : undefined
        },
        templateData.quantity,
        templateData.selectedOptions
      );
      
      if (!success) {
        console.error('Failed to add to cart: insufficient stock or invalid quantity');
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      updateLocalData({ isAddingToCart: false });
    }
  };

  const handleWishlistToggle = () => {
    // For now, just show an alert - this would typically integrate with a wishlist service
    alert('Wishlist functionality coming soon!');
  };

  const currentImage = templateData.product.images?.[templateData.currentImageIndex]?.url || '/placeholder-product.jpg';
  const price = typeof templateData.product.price === 'string' ? Number.parseFloat(templateData.product.price) : templateData.product.price;
  const discountPrice = templateData.product.discountPrice;

  if (templateData.isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="relative">
          <div className="animate-spin rounded-full h-32 w-32 border-4 border-gray-200"></div>
          <div className="animate-spin rounded-full h-32 w-32 border-4 border-blue-500 border-t-transparent absolute top-0 left-0"></div>
        </div>
      </div>
    );
  }

  if (templateData.error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">😞</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <p className="text-gray-600">{templateData.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-6">
            <div className="relative group">
              <div className={`aspect-square bg-white rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 ${
                templateData.isZoomed ? 'scale-110' : 'hover:shadow-3xl'
              }`}>
                <img
                  src={currentImage}
                  alt={templateData.product.name}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <button
                type="button"
                onClick={toggleZoom}
                className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-all duration-200 opacity-0 group-hover:opacity-100"
              >
                <ZoomIn className="h-5 w-5 text-gray-700" />
              </button>
              <button
                type="button"
                className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-all duration-200 opacity-0 group-hover:opacity-100"
              >
                <Share2 className="h-5 w-5 text-gray-700" />
              </button>
            </div>
            
            {templateData.product.images && templateData.product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {templateData.product.images.map((image, index) => (
                  <button
                    type="button"
                    key={image.url}
                    onClick={() => handleImageChange(index)}
                    className={`aspect-square bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-300 ${
                      index === templateData.currentImageIndex 
                        ? 'ring-4 ring-blue-500 scale-105 shadow-xl' 
                        : 'hover:scale-105 hover:shadow-xl'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`${templateData.product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-8">
            <div className="bg-white rounded-3xl p-8 shadow-xl">
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {templateData.product.categoryName}
                  </span>
                  <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {templateData.product.vendorName}
                  </span>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 leading-tight">{templateData.product.name}</h1>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-3 mb-6">
                {discountPrice ? (
                  <>
                    <span className="text-4xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                      ${discountPrice}
                    </span>
                    <span className="text-2xl text-gray-400 line-through">${price}</span>
                    <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
                      {Math.round(((price - discountPrice) / price) * 100)}% OFF
                    </span>
                  </>
                ) : (
                  <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    ${price}
                  </span>
                )}
              </div>

              {/* Reviews */}
              <div className="flex items-center space-x-3 mb-6">
                <div className="flex items-center bg-yellow-50 px-3 py-2 rounded-full">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={"skeleton"}
                      className={`h-5 w-5 ${
                        i < Math.floor(templateData.reviewStats.averageRating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm font-semibold text-gray-700">
                    {templateData.reviewStats.averageRating.toFixed(1)}
                  </span>
                </div>
                <span className="text-sm text-gray-600">
                  ({templateData.reviewStats.totalReviews} reviews)
                </span>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-600 leading-relaxed">{templateData.product.description}</p>
              </div>

              {/* Variants */}
              {templateData.product.variants?.map((variant) => (
                <div key={variant.name} className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">{variant.name}</h4>
                  <div className="flex flex-wrap gap-3">
                    {variant.values.map((value) => (
                      <button
                        type="button"
                        key={value}
                        onClick={() => handleOptionChange(variant.name, value)}
                        className={`px-6 py-3 text-sm font-medium border-2 rounded-xl transition-all duration-200 ${
                          templateData.selectedOptions[variant.name] === value
                            ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-lg scale-105'
                            : 'border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:scale-105'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Quantity */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Quantity</h4>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(templateData.quantity - 1)}
                      disabled={templateData.quantity <= 1}
                      className="p-3 hover:bg-gray-200 disabled:opacity-50 transition-colors duration-200"
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                    <span className="px-6 py-3 text-lg font-semibold bg-white">{templateData.quantity}</span>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(templateData.quantity + 1)}
                      disabled={templateData.quantity >= templateData.product.stock}
                      className="p-3 hover:bg-gray-200 disabled:opacity-50 transition-colors duration-200"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
                    {templateData.product.stock} available
                  </span>
                </div>
              </div>

              {/* Add to Cart */}
              <div className="flex space-x-4 mb-8">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!templateData.product.available || templateData.isAddingToCart}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 flex items-center justify-center space-x-3 font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  <ShoppingCart className="h-6 w-6" />
                  <span>{templateData.isAddingToCart ? 'Adding...' : 'Add to Cart'}</span>
                </button>
                <button 
                  type="button" 
                  onClick={handleWishlistToggle}
                  className="p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-red-300 hover:bg-red-50 transition-all duration-200 group"
                >
                  <Heart className="h-6 w-6 text-gray-400 group-hover:text-red-500" />
                </button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-xl">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Truck className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-800">Free Shipping</p>
                    <p className="text-sm text-green-600">On orders over $50</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-xl">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-blue-800">2-Year Warranty</p>
                    <p className="text-sm text-blue-600">Full coverage included</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-xl">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <RotateCcw className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-purple-800">30-Day Returns</p>
                    <p className="text-sm text-purple-600">Hassle-free policy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-20">
          <div className="bg-white rounded-3xl p-8 shadow-xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Customer Reviews</h2>
            
            {templateData.reviews.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">💭</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
                <p className="text-gray-600">Be the first to review this product!</p>
              </div>
            ) : (
              <div className="space-y-8">
                {templateData.reviews.map((review) => (
                  <div key={review.id} className="bg-gray-50 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {review.userName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-900">{review.userName}</span>
                          <div className="flex items-center mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={"skeleton"}
                                className={`h-4 w-4 ${
                                  i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {templateData.relatedProducts && templateData.relatedProducts.length > 0 && (
          <div className="mt-20">
            <div className="bg-white rounded-3xl p-8 shadow-xl">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">You Might Also Like</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {templateData.relatedProducts.map((product) => (
                  <div key={product.id} className="group cursor-pointer">
                    <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden mb-4 shadow-lg group-hover:shadow-2xl transition-all duration-300">
                      <img
                        src={product.imageUrl || product.images?.[0]?.url || '/placeholder-product.jpg'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">{product.categoryName}</p>
                    <div className="flex items-center space-x-2">
                      {product.discountPrice ? (
                        <>
                          <span className="font-bold text-red-600">${product.discountPrice}</span>
                          <span className="text-sm text-gray-400 line-through">${product.price}</span>
                        </>
                      ) : (
                        <span className="font-bold text-gray-900">${product.price}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernProductTemplate;