import { useState, useEffect } from "react";
import { FeaturedSection } from "#root/components/FeaturedSection";
import { Button } from "#root/components/ui/button";
import { Link } from "#root/components/Link";
import { ShoppingBag, Users, Store, ChevronRight } from "lucide-react";
import AnimatedContent from "#root/components/AnimatedContent";
import { trpc } from "#root/shared/trpc/client";
import { FAQ } from "#root/components/globals/FAQ";
import { Footer } from "#root/components/globals/Footer";

interface FeaturedProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  imageUrl?: string;
  vendor: string;
  vendorId: string;
  vendorName: string;
  categoryName: string;
  available: boolean;
}

// FAQ data structure for easy editing
const faqData = [
  {
    id: "how-lebsey-works",
    question: "How does Lebsey work?",
    answer:
      "Lebsey brings together fashion vendors and brands into one marketplace, making it easy for you to shop from multiple sellers without having to visit different websites. Browse collections, add items to your cart, and checkout seamlessly.",
  },
  {
    id: "payment-methods",
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards, debit cards, PayPal, and Apple Pay. All transactions are secure and encrypted to ensure your financial information is protected.",
  },
  {
    id: "shipping-time",
    question: "How long does shipping take?",
    answer:
      "Shipping times depend on your location and the seller. Typically, domestic orders are delivered within 3-5 business days, while international shipping can take 7-14 business days. You can view the estimated shipping time for each product on its page.",
  },
  {
    id: "return-policy",
    question: "What is your return policy?",
    answer:
      "We offer a 30-day return policy for most items. Products must be unworn, unwashed, and in their original packaging with tags attached. Some sellers may have specific return policies, which will be noted on their product pages.",
  },
  {
    id: "order-tracking",
    question: "How do I track my order?",
    answer:
      "Once your order ships, you'll receive a tracking number via email. You can also track your order in your account dashboard under 'Order History'.",
  },
  {
    id: "international-shipping",
    question: "Do you ship internationally?",
    answer:
      "Yes, we ship to many countries worldwide. International shipping rates and delivery times vary by location. You can view available shipping options during checkout.",
  },
];

export default function Page() {
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const result = await trpc.product.search.query({
          limit: 8,
          includeOutOfStock: false,
        });

        if (result.success && result.result) {
          setFeaturedProducts(
            result.result.items.map((item) => ({
              id: item.id,
              name: item.name,
              price: Number(item.price),
              stock: item.stock,
              imageUrl: item.imageUrl
                ? item.imageUrl.startsWith("http")
                  ? item.imageUrl
                  : `/uploads/${item.imageUrl}`
                : undefined,
              vendor: item.vendorName || "",
              vendorId: item.vendorId || "",
              vendorName: item.vendorName || "",
              categoryName: item.categoryName || "",
              available: item.stock > 0,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching featured products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <main>
      {/* Hero Section */}
      <section className="relative h-[90vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent z-[9]"></div>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/assets/men-section.webp)" }}
          role="img"
          aria-label="Fashion collection banner image"
        ></div>

        <div className="relative z-[9] container mx-auto h-full flex flex-col justify-center px-4">
          <AnimatedContent
            distance={50}
            direction="vertical"
            reverse={false}
            className="max-w-xl"
          >
            <div className="bg-white/10 backdrop-blur-sm p-1 px-3 rounded-full inline-block mb-4">
              <span className="text-white text-sm font-medium">
                New Season Collection
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Discover Your Perfect Style
            </h1>
            <p className="text-gray-200 text-lg mb-8 max-w-lg">
              Shop the latest trends from top brands and independent designers
              all in one place.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                asChild
                size="lg"
                className="bg-accent-lb hover:bg-white hover:text-accent-lb duration-300 transition-all"
              >
                <Link href="/featured/products">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Shop Now
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white text-foreground hover:bg-white hover:text-accent-lb duration-300 transition-all"
              >
                <Link href="/featured/brands">
                  <Store className="mr-2 h-5 w-5" />
                  Browse Brands
                </Link>
              </Button>
            </div>
          </AnimatedContent>
        </div>

        {/* Wave shape divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 100"
            className="w-full"
            role="img"
            aria-label="Wave shape divider"
          >
            <path
              fill="#ffffff"
              fillOpacity="1"
              d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
            ></path>
          </svg>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <AnimatedContent threshold={0.2}>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Shop by Category</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Browse our carefully curated collections across various
                categories
              </p>
            </div>
          </AnimatedContent>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Men's Category */}
            <AnimatedContent
              threshold={0.2}
              delay={100}
              className="relative rounded-xl overflow-hidden group h-80 cursor-pointer"
            >
              <Link href="/featured/men" className="block h-full">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-[9]"></div>
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: "url(/assets/men-section.webp)" }}
                  role="img"
                  aria-label="Men's fashion category"
                ></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 z-[9]">
                  <h3 className="text-2xl font-bold text-white mb-2">Men</h3>
                  <div className="flex items-center text-white">
                    <span className="text-sm">Shop Collection</span>
                    <ChevronRight className="h-4 w-4 ml-1 transform transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            </AnimatedContent>

            {/* Women's Category */}
            <AnimatedContent
              threshold={0.2}
              delay={200}
              className="relative rounded-xl overflow-hidden group h-80 cursor-pointer"
            >
              <Link href="/featured/women" className="block h-full">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-[9]"></div>
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: "url(/assets/women-section.webp)" }}
                  role="img"
                  aria-label="Women's fashion category"
                ></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 z-[9]">
                  <h3 className="text-2xl font-bold text-white mb-2">Women</h3>
                  <div className="flex items-center text-white">
                    <span className="text-sm">Shop Collection</span>
                    <ChevronRight className="h-4 w-4 ml-1 transform transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            </AnimatedContent>

            {/* Brands Category */}
            <AnimatedContent
              threshold={0.2}
              delay={300}
              className="relative rounded-xl overflow-hidden group h-80 cursor-pointer"
            >
              <Link href="/featured/brands" className="block h-full">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-[9]"></div>
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{
                    backgroundImage: "url(/assets/men-section.webp)",
                  }}
                  role="img"
                  aria-label="Fashion brands category"
                ></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 z-[9]">
                  <h3 className="text-2xl font-bold text-white mb-2">Brands</h3>
                  <div className="flex items-center text-white">
                    <span className="text-sm">Discover Brands</span>
                    <ChevronRight className="h-4 w-4 ml-1 transform transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            </AnimatedContent>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      {!isLoading && featuredProducts.length > 0 && (
        <FeaturedSection
          title="Featured Products"
          description="Our latest and most popular items carefully selected for you"
          products={featuredProducts}
          viewAllLink="/featured/products"
          backgroundColor="white"
          limit={4}
        />
      )}

      {/* About Section */}
      <section className="py-20 bg-accent-lb/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <AnimatedContent
              direction="horizontal"
              reverse={true}
              threshold={0.2}
            >
              <div className="relative rounded-xl overflow-hidden">
                <img
                  src="/assets/men-section.webp"
                  alt="About Lebsy - Our fashion story"
                  className="w-full h-auto rounded-xl"
                />
              </div>
            </AnimatedContent>

            <AnimatedContent threshold={0.2}>
              <div className="max-w-xl">
                <h2 className="text-3xl font-bold mb-6">Our Story</h2>
                <p className="text-gray-600 mb-6">
                  We started Lebsy because shopping for clothes online was
                  frustrating, with too many websites and too much hassle. So,
                  we built one place where all clothing sellers come together,
                  making fashion shopping easier for everyone.
                </p>
                <p className="text-gray-600 mb-8">
                  Our platform offers a diverse selection of clothing and
                  accessories from various brands and independent designers, all
                  in one convenient place. We prioritize quality, style, and
                  customer satisfaction.
                </p>
                <Button
                  asChild
                  variant="outline"
                  className="border-accent-lb text-accent-lb hover:bg-accent-lb hover:text-white"
                >
                  <Link href="/featured/brands">
                    <Users className="mr-2 h-5 w-5" />
                    Meet Our Brands
                  </Link>
                </Button>
              </div>
            </AnimatedContent>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white">
        <FAQ
          title="Frequently Asked Questions"
          description="Find answers to common questions about shopping with Lebsey"
          faqs={faqData}
        />
      </section>

      {/* Call To Action */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-accent-lb/90"></div>
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: "url(/assets/men-section.webp)" }}
          aria-hidden="true"
        ></div>

        <div className="relative z-[9] container mx-auto px-4 text-center">
          <AnimatedContent threshold={0.2}>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to elevate your style?
            </h2>
            <p className="text-white/90 text-lg mb-8 max-w-3xl mx-auto">
              Join thousands of satisfied customers who have discovered their
              perfect style with Lebsy. Browse our collections today and find
              pieces that speak to you.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-white text-accent-lb hover:bg-gray-100 transition-colors"
            >
              <Link href="/featured/products">
                Shop Now
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </AnimatedContent>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
