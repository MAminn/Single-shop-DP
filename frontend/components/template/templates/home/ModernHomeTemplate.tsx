import { lazy, Suspense } from "react";
import { Button } from "#root/components/ui/button";
import { Link } from "#root/components/Link";
import { ShoppingBag, Users, Store, ChevronRight, Star, TrendingUp } from "lucide-react";
import { Footer } from "#root/components/globals/Footer";

// Lazy load components for better performance
const FAQ = lazy(() =>
  import("#root/components/globals/FAQ").then((mod) => ({ default: mod.FAQ }))
);
const FeaturedSection = lazy(() =>
  import("#root/components/FeaturedSection").then((mod) => ({
    default: mod.FeaturedSection,
  }))
);

interface FeaturedProduct {
  id: string;
  name: string;
  price: number;
  discountPrice?: number | string | null;
  stock: number;
  imageUrl?: string;
  images?: { url: string; isPrimary?: boolean }[];
  vendor: string;
  vendorId: string;
  vendorName: string;
  categoryName: string;
  available: boolean;
  categories?: { id: string; name: string }[];
}

interface HomeTemplateData {
  featuredProducts: FeaturedProduct[];
  isLoading: boolean;
  error?: string | null;
}

interface ModernHomeTemplateProps {
  data?: HomeTemplateData;
}

// FAQ data
const faqData = [
  {
    id: "how-lebsey-works",
    question: "How does Lebsey work?",
    answer:
      "Lebsey brings together fashion vendors and brands into one marketplace, making it easy for you to shop from multiple sellers without having to visit different websites. Browse collections, add items to your cart, and checkout seamlessly.",
  },
  {
    id: "shipping-time",
    question: "How long does shipping take?",
    answer:
      "We ship across Egypt, delivering orders within a week (Not including holidays). Shipping costs vary based on order details and location, with support available at cs@Lebsey.com for any issues.",
  },
  {
    id: "return-policy",
    question: "What is your return policy?",
    answer:
      "You can return items within 14 days if they are unused and in their original packaging. To start a return, contact us at CS@Lebsey.com or WhatsApp +201507135600. Return fees match the original delivery cost, and refunds are processed within 14 days. Damaged items must be reported within 1 day for a free replacement or refund.",
  },
];

// Preload critical images
const preloadImages = () => {
  const criticalImages = ["/assets/landing.webp", "/assets/story.webp"];
  for (const src of criticalImages) {
    const img = new Image();
    img.src = src;
  }
};

const LoadingPlaceholder = () => (
  <div className="w-full py-8 flex justify-center">
    <div className="w-12 h-12 rounded-full border-4 border-accent-lb animate-spin"></div>
  </div>
);

export default function ModernHomeTemplate({ data }: ModernHomeTemplateProps) {
  // Use provided data or fallback to empty state
  const featuredProducts = data?.featuredProducts || [];
  const isLoading = data?.isLoading || false;
  const error = data?.error || null;

  // Preload critical images on component mount
  preloadImages();

  return (
    <main>
      {/* Modern Hero Section with Split Layout */}
      <section className="relative min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Star className="w-4 h-4 text-yellow-400 mr-2" />
                <span className="text-white text-sm font-medium">
                  Premium Fashion Marketplace
                </span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                Fashion
                <span className="block bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
                  Reimagined
                </span>
              </h1>
              
              <p className="text-gray-200 text-xl mb-8 max-w-lg mx-auto lg:mx-0">
                Experience the future of fashion shopping with our curated collection 
                from the world's most innovative designers and brands.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 px-8 py-3 text-lg"
                >
                  <Link href="/featured/products">
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    Explore Collection
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-3 text-lg"
                >
                  <Link href="/featured/brands">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Trending Now
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right Content - Image Grid */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 h-40">
                    <div className="text-white">
                      <h3 className="font-semibold mb-2">Premium Brands</h3>
                      <p className="text-sm text-gray-300">Curated selection from top designers</p>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden h-60">
                    <img
                      src="/assets/women-section.webp"
                      alt="Women's fashion"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
                <div className="space-y-4 mt-8">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden h-60">
                    <img
                      src="/assets/men-section.webp"
                      alt="Men's fashion"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 h-40">
                    <div className="text-white">
                      <h3 className="font-semibold mb-2">Fast Delivery</h3>
                      <p className="text-sm text-gray-300">Express shipping across Egypt</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 120"
            className="w-full"
            aria-label="Wave divider"
            role="img"
          >
            <path
              fill="#ffffff"
              fillOpacity="1"
              d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
            ></path>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="p-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">500+</div>
              <div className="text-gray-600">Premium Brands</div>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">50K+</div>
              <div className="text-gray-600">Happy Customers</div>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
              <div className="text-gray-600">Customer Support</div>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">99%</div>
              <div className="text-gray-600">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern About Section */}
      <section className="py-20 bg-gradient-to-r from-gray-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-3xl transform rotate-3"></div>
              <img
                src="/assets/story.webp"
                alt="About Lebsy - Our fashion story"
                className="relative w-full h-auto rounded-3xl shadow-2xl"
                width="500"
                height="333"
                loading="lazy"
                decoding="async"
              />
            </div>

            <div className="max-w-xl">
              <div className="inline-flex items-center bg-purple-100 text-purple-800 px-4 py-2 rounded-full mb-6">
                <span className="text-sm font-medium">Our Mission</span>
              </div>
              <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Revolutionizing Fashion Commerce
              </h2>
              <p className="text-gray-600 mb-6 text-lg">
                We're not just another marketplace. We're building the future of fashion 
                retail, where technology meets style to create extraordinary shopping experiences.
              </p>
              <p className="text-gray-600 mb-8 text-lg">
                Our AI-powered platform connects you with the perfect pieces from 
                emerging designers and established brands, all while ensuring 
                sustainability and ethical practices.
              </p>
              <Button
                asChild
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3"
              >
                <Link href="/featured/brands">
                  <Users className="mr-2 h-5 w-5" />
                  Discover Our Partners
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Categories Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Explore Collections
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Discover curated collections that define modern fashion
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Men's Category */}
            <div className="group relative rounded-3xl overflow-hidden h-96 cursor-pointer transform transition-all duration-300 hover:scale-105">
              <Link href="/featured/men" className="block h-full">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
                <img
                  src="/assets/men-section.webp"
                  alt="Men's fashion category"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  width="400"
                  height="533"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                  <h3 className="text-3xl font-bold text-white mb-3">Men's Collection</h3>
                  <div className="flex items-center text-white/90">
                    <span className="text-lg">Explore Styles</span>
                    <ChevronRight className="h-5 w-5 ml-2 transform transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            </div>

            {/* Women's Category */}
            <div className="group relative rounded-3xl overflow-hidden h-96 cursor-pointer transform transition-all duration-300 hover:scale-105">
              <Link href="/featured/women" className="block h-full">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
                <img
                  src="/assets/women-section.webp"
                  alt="Women's fashion category"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  width="400"
                  height="533"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                  <h3 className="text-3xl font-bold text-white mb-3">Women's Collection</h3>
                  <div className="flex items-center text-white/90">
                    <span className="text-lg">Discover Trends</span>
                    <ChevronRight className="h-5 w-5 ml-2 transform transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            </div>

            {/* Brands Category */}
            <div className="group relative rounded-3xl overflow-hidden h-96 cursor-pointer transform transition-all duration-300 hover:scale-105">
              <Link href="/featured/brands" className="block h-full">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
                <img
                  src="/assets/brands.webp"
                  alt="Fashion brands category"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  width="400"
                  height="533"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                  <h3 className="text-3xl font-bold text-white mb-3">Premium Brands</h3>
                  <div className="flex items-center text-white/90">
                    <span className="text-lg">Browse Partners</span>
                    <ChevronRight className="h-5 w-5 ml-2 transform transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Lazy load non-critical components */}
      <Suspense fallback={<LoadingPlaceholder />}>
        {/* Featured Products Section */}
        {!isLoading && featuredProducts.length > 0 && (
          <FeaturedSection
            title="Trending Products"
            description="Handpicked items that are making waves in fashion"
            products={featuredProducts}
            viewAllLink="/featured/products"
            backgroundColor="gray"
            limit={4}
          />
        )}
      </Suspense>

      {/* FAQ Section - lazy loaded */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <section id="faq" className="py-20 bg-white">
          <FAQ
            title="Frequently Asked Questions"
            description="Everything you need to know about shopping with Lebsey"
            faqs={faqData}
          />
        </section>
      </Suspense>

      {/* Modern Call To Action */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900"></div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Ready to Transform Your
              <span className="block bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
                Wardrobe?
              </span>
            </h2>
            <p className="text-white/90 text-xl mb-10 max-w-3xl mx-auto">
              Join the fashion revolution. Discover unique pieces, connect with innovative 
              designers, and express your authentic style like never before.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-yellow-400 to-pink-400 hover:from-yellow-500 hover:to-pink-500 text-black font-semibold px-12 py-4 text-lg"
            >
              <Link href="/featured/products">Start Your Journey</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}