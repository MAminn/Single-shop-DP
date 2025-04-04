import { useState, useEffect } from "react";
import { trpc } from "#root/shared/trpc/client";
import {
  Loader2,
  ArrowLeft,
  ShoppingCart,
  Store,
  Star,
  StarHalf,
  ChevronRight,
  ChevronLeft,
  ZoomIn,
} from "lucide-react";
import { Button } from "#root/components/ui/button";
import { Badge } from "#root/components/ui/badge";
import { Link } from "#root/components/Link";
import { useToast } from "#root/components/ui/use-toast";
import { useCart } from "#root/lib/context/CartContext";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "#root/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "#root/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "#root/components/ui/form";
import { Input } from "#root/components/ui/input";
import { Textarea } from "#root/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getVendorUrl } from "#root/lib/utils/route-helpers";

interface Variant {
  name: string;
  values: string[];
}

interface Product {
  id: string;
  name: string;
  price: number | string;
  stock: number;
  imageUrl: string | null;
  description?: string;
  available: boolean;
  categoryId: string;
  categoryName: string | null;
  vendorId: string;
  vendorName: string | null;
  variants?: Variant[];
  images?: { url: string }[];
  rating?: number;
  reviewCount?: number;
}

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
}

interface ProductDetailProps {
  productId: string;
}

const reviewFormSchema = z.object({
  userName: z.string().min(2, "Name must be at least 2 characters").max(50),
  rating: z.number().min(1).max(5),
  comment: z.string().min(3, "Review must be at least 3 characters").max(500),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

export const ProductDetail = ({ productId }: ProductDetailProps) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats>({
    averageRating: 0,
    totalReviews: 0,
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const { toast } = useToast();
  const { addItem } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      userName: "",
      rating: 5,
      comment: "",
    },
  });

  useEffect(() => {
    async function fetchProductDetails() {
      if (!productId) return;

      try {
        setLoading(true);
        console.log("Fetching product details for ID:", productId);

        // Get product details by searching with productId
        const productsResult = await trpc.product.search.query({
          limit: 100,
          includeOutOfStock: true,
        });

        if (!productsResult.success) {
          setError("Failed to load product information");
          return;
        }

        const productItem = productsResult.result?.items?.find(
          (item) => item.id === productId
        );

        if (!productItem) {
          setError("Product not found");
          return;
        }

        console.log("Found product in search results:", productItem);

        // Get product variants
        const variantsResult = await trpc.product.view.query({
          categoryId: productItem.categoryId,
        });

        let variants: Variant[] = [];
        if (variantsResult.success) {
          const productWithVariants = variantsResult.result.find(
            (p) => p.product.id === productId
          );
          if (productWithVariants) {
            variants = productWithVariants.variants.map((v) => ({
              name: v.name,
              values: v.values,
            }));
          }
        }

        // Process images to ensure correct format
        const images = [];
        if (productItem.imageUrl) {
          images.push({ url: productItem.imageUrl });
        }

        setProduct({
          ...productItem,
          available: productItem.stock > 0,
          variants,
          images,
        });
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("An error occurred while loading the product");
      } finally {
        setLoading(false);
      }
    }

    async function fetchReviews() {
      if (!productId) return;

      try {
        const result = await trpc.product.getReviews.query({ productId });
        if (result.success) {
          setReviews(
            result.result.reviews.map((review) => ({
              ...review,
              createdAt: review.createdAt.toISOString(),
            }))
          );
          setReviewStats({
            averageRating: result.result.averageRating,
            totalReviews: result.result.totalReviews,
          });
        }
      } catch (err) {
        console.error("Error fetching reviews:", err);
      }
    }

    fetchProductDetails();
    fetchReviews();
  }, [productId]);

  const handleAddToCart = () => {
    if (!product || !product.available) return;

    // Check if all required variants are selected
    if (product.variants && product.variants.length > 0) {
      for (const variant of product.variants) {
        if (!selectedOptions[variant.name]) {
          toast({
            title: "Missing selection",
            description: `Please select a ${variant.name} option`,
            variant: "destructive",
          });
          return;
        }
      }
    }

    setIsAddingToCart(true);
    try {
      addItem(
        {
          id: product.id,
          name: product.name,
          price:
            typeof product.price === "number"
              ? product.price
              : Number(product.price),
          imageUrl: product.imageUrl || undefined,
          vendorId: Number(product.vendorId),
          stock: product.stock,
        },
        quantity,
        selectedOptions
      );

      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const onSubmitReview = async (values: ReviewFormValues) => {
    if (!productId) return;

    setIsSubmittingReview(true);
    try {
      const result = await trpc.product.createReview.mutate({
        productId,
        userName: values.userName,
        rating: values.rating,
        comment: values.comment,
      });

      if (result.success) {
        toast({
          title: "Review submitted",
          description: "Thank you for your feedback!",
        });
        form.reset();

        // Refresh reviews
        const reviewsResult = await trpc.product.getReviews.query({
          productId,
        });
        if (reviewsResult.success) {
          setReviews(
            reviewsResult.result.reviews.map((review) => ({
              ...review,
              createdAt: review.createdAt.toISOString(),
            }))
          );
          setReviewStats({
            averageRating: reviewsResult.result.averageRating,
            totalReviews: reviewsResult.result.totalReviews,
          });
        }
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to submit review",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({
        title: "Error",
        description: "Failed to submit your review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleOptionChange = (variantName: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [variantName]: value,
    }));
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value, 10);
    if (!Number.isNaN(value) && value > 0 && value <= 99) {
      setQuantity(value);
    }
  };

  const nextImage = () => {
    if (!product?.images) return;
    setCurrentImageIndex((prev) =>
      prev === (product.images?.length ?? 1) - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    if (!product?.images) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? (product.images?.length ?? 1) - 1 : prev - 1
    );
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-accent-lb" />
        <span className="ml-3">Loading product...</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container flex flex-col items-center justify-center min-h-[60vh] py-8">
        <h2 className="text-2xl font-bold text-red-500 mb-2">Error</h2>
        <p className="text-gray-600">{error || "Product not found"}</p>
        <Button
          onClick={() => window.history.back()}
          className="mt-4"
          variant="outline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  const renderRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`full-${i}`}
          className="fill-yellow-400 text-yellow-400 h-4 w-4"
        />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <StarHalf
          key="half"
          className="fill-yellow-400 text-yellow-400 h-4 w-4"
        />
      );
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="text-gray-300 h-4 w-4" />);
    }

    return stars;
  };

  const images =
    product.images && product.images.length > 0
      ? product.images
      : [{ url: product.imageUrl || "/placeholder.jpg" }];

  const currentImage =
    images[currentImageIndex]?.url || product.imageUrl || "/placeholder.jpg";

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Product Images Section */}
        <div className="md:w-1/2 space-y-4">
          <div className="mb-6">
            <button
              type="button"
              tabIndex={0}
              aria-label="View product image gallery"
              className="relative rounded-lg overflow-hidden bg-gray-100 border border-gray-200"
              onClick={() => setIsZoomed(!isZoomed)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setIsZoomed(!isZoomed);
                }
              }}
            >
              <img
                src={
                  images[currentImageIndex]?.url.startsWith("http")
                    ? images[currentImageIndex]?.url
                    : images[currentImageIndex]?.url.startsWith("/uploads/")
                      ? images[currentImageIndex]?.url
                      : `/uploads/${images[currentImageIndex]?.url}`
                }
                alt={product.name}
                className={`w-full h-auto object-cover transition-transform duration-300 ${
                  isZoomed ? "scale-110" : "scale-100"
                }`}
              />

              {images.length > 1 && (
                <div className="flex items-center justify-center mt-4 space-x-2">
                  <button
                    type="button"
                    onClick={prevImage}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                    aria-label="Previous image"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      role="img"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <div className="flex space-x-1">
                    {images.map((img, i) => (
                      <button
                        key={`thumb-${img.url || i}`}
                        type="button"
                        onClick={() => setCurrentImageIndex(i)}
                        className={`w-3 h-3 rounded-full ${
                          i === currentImageIndex
                            ? "bg-accent-lb"
                            : "bg-gray-300"
                        }`}
                        aria-label={`View image ${i + 1}`}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={nextImage}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                    aria-label="Next image"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      role="img"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="md:w-1/2 space-y-6">
          <div>
            {product.categoryName && (
              <Badge className="mb-2 bg-accent-lb/20 text-accent-lb hover:bg-accent-lb/30">
                {product.categoryName}
              </Badge>
            )}
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>

            {product.vendorName && (
              <Link
                href={getVendorUrl(product.vendorId)}
                className="text-sm text-gray-500 flex items-center hover:text-accent-lb transition-colors"
              >
                <Store className="inline-block h-4 w-4 mr-1" />
                {product.vendorName}
              </Link>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-gray-900">
              $
              {typeof product.price === "number"
                ? product.price.toFixed(2)
                : Number.parseFloat(product.price as string).toFixed(2)}
            </span>
            {product.stock <= 10 && product.stock > 0 && (
              <span className="text-orange-500 text-sm">
                Only {product.stock} left
              </span>
            )}
            {product.stock <= 0 && (
              <Badge
                variant="outline"
                className="text-gray-500 border-gray-300"
              >
                Out of Stock
              </Badge>
            )}
          </div>

          {product.rating && (
            <div className="flex items-center">
              <div className="flex items-center mr-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <Star
                    key={`star-${num}`}
                    className={`h-5 w-5 ${
                      num <= Math.floor(product.rating || 0)
                        ? "text-yellow-400 fill-yellow-400"
                        : num <= (product.rating || 0)
                          ? "text-yellow-400 fill-yellow-400 opacity-50"
                          : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {product.rating.toFixed(1)} ({product.reviewCount || 0} reviews)
              </span>
            </div>
          )}

          <div className="prose prose-sm max-w-none text-gray-600">
            <p>{product.description || "No description available."}</p>
          </div>

          {/* Product Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-4">
              {product.variants.map((variant: Variant) => (
                <div key={variant.name}>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    {variant.name}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {variant.values.map((value: string) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleOptionChange(variant.name, value)}
                        className={`px-3 py-1 border rounded-md text-sm font-medium transition-all
                          ${
                            selectedOptions[variant.name] === value
                              ? "bg-accent-lb text-white border-accent-lb"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                          }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quantity and Add to Cart */}
          <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full sm:w-auto">
              <label htmlFor="quantity" className="sr-only">
                Quantity
              </label>
              <div className="flex border border-gray-300 rounded-md w-full sm:w-32">
                <button
                  type="button"
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100 focus:outline-none"
                  onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                >
                  -
                </button>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  min="1"
                  max="99"
                  className="flex-1 text-center border-x border-gray-300 focus:outline-none"
                  value={quantity}
                  onChange={handleQuantityChange}
                />
                <button
                  type="button"
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100 focus:outline-none"
                  onClick={() => quantity < 99 && setQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>

            <Button
              onClick={handleAddToCart}
              disabled={isAddingToCart || product.stock <= 0}
              className="w-full sm:w-auto bg-accent-lb hover:bg-[#021E43] transition-colors min-w-[180px]"
              size="lg"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {isAddingToCart ? "Adding..." : "Add to Cart"}
            </Button>
          </div>

          {/* Additional Product Info */}
          <div className="border-t border-gray-200 pt-6 mt-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              <div className="border-b border-gray-200 pb-3">
                <dt className="text-sm font-medium text-gray-500">SKU</dt>
                <dd className="mt-1 text-sm text-gray-900">{product.id}</dd>
              </div>
              {product.stock !== undefined && (
                <div className="border-b border-gray-200 pb-3">
                  <dt className="text-sm font-medium text-gray-500">
                    Availability
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {product.stock > 0
                      ? `In stock (${product.stock})`
                      : "Out of stock"}
                  </dd>
                </div>
              )}
              {product.categoryName && (
                <div className="border-b border-gray-200 pb-3">
                  <dt className="text-sm font-medium text-gray-500">
                    Category
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {product.categoryName}
                  </dd>
                </div>
              )}
              {product.vendorName && (
                <div className="border-b border-gray-200 pb-3">
                  <dt className="text-sm font-medium text-gray-500">Brand</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <Link
                      href={getVendorUrl(product.vendorId)}
                      className="hover:text-accent-lb"
                    >
                      {product.vendorName}
                    </Link>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <Tabs defaultValue="reviews" className="w-full">
          <TabsList className="w-full justify-start mb-6 bg-transparent border-b">
            <TabsTrigger value="reviews" className="text-lg">
              Reviews ({reviewStats.totalReviews})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="reviews" className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <Card className="border-accent-lb/20">
                  <CardHeader>
                    <CardTitle>Write a Review</CardTitle>
                    <CardDescription>
                      Share your thoughts about this product
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(onSubmitReview)}
                        className="space-y-4"
                      >
                        <FormField
                          control={form.control}
                          name="userName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Your Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter your name"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="rating"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Rating</FormLabel>
                              <FormControl>
                                <div className="flex gap-2">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Button
                                      key={star}
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => field.onChange(star)}
                                      className={
                                        field.value >= star
                                          ? "bg-yellow-400 border-yellow-400 hover:bg-yellow-500 hover:border-yellow-500"
                                          : ""
                                      }
                                    >
                                      <Star
                                        className={
                                          field.value >= star
                                            ? "fill-white text-white"
                                            : "text-gray-300"
                                        }
                                      />
                                    </Button>
                                  ))}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="comment"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Your Review</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Share your experience with this product"
                                  className="min-h-[100px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="submit"
                          className="w-full bg-accent-lb hover:bg-accent-db"
                          disabled={isSubmittingReview}
                        >
                          {isSubmittingReview
                            ? "Submitting..."
                            : "Submit Review"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>

              <div className="md:col-span-2">
                {reviews.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <h3 className="text-xl font-semibold mb-2">
                      No Reviews Yet
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Be the first to review this product
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <Card key={review.id} className="border-gray-200">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-lg font-semibold">
                              {review.userName}
                            </CardTitle>
                            <div className="flex">
                              {renderRatingStars(review.rating)}
                            </div>
                          </div>
                          <CardDescription className="text-xs">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700">{review.comment}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
