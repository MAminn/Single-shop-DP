import { useState, useEffect, useCallback } from "react";
import { trpc } from "#root/shared/trpc/client";
import { Link } from "#root/components/Link";
import { Loader2, Store, Tag } from "lucide-react";
import AnimatedContent from "#root/components/AnimatedContent";
import { Badge } from "#root/components/ui/badge";
import { Button } from "#root/components/ui/button";
import { Card } from "#root/components/ui/card";

interface Vendor {
  id: string;
  name: string;
  description: string | null;
  logoImagePath: string | null;
}

export default function BrandsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVendors = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch all active vendors with products, not just those marked as featured
      const result = await trpc.vendor.featured.query({ featured: false });
      if (result.success) {
        setVendors(result.result || []);
      } else {
        console.error("Failed to fetch vendors:", result.error);
      }
    } catch (err) {
      console.error("Error fetching vendors:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-accent-lb" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container flex flex-col items-center justify-center min-h-[60vh] py-8">
        <h2 className="text-2xl font-bold text-red-500 mb-2">Error</h2>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <AnimatedContent
      className=" flex flex-col justify-center items-center"
      distance={100}
      direction="vertical"
      reverse={false}
      config={{ tension: 60, friction: 30 }}
      initialOpacity={0}
      animateOpacity
      scale={1}
      threshold={0.1}
    >
      {/* Hero Section */}
      <div className="w-full flex flex-col justify-center items-center bg-gradient-to-r from-accent-lb/10 to-blue-50">
        <div className="container py-16 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="outline" className="mb-4 px-3 py-1">
              <Tag className="h-3.5 w-3.5 mr-1" />
              <span>Quality Partners</span>
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-accent-db">
              Our Trusted Brands
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Discover our curated selection of quality brands. Each partner is
              chosen for their commitment to excellence, innovation, and
              exceptional value.
            </p>
            <div className="flex justify-center gap-3">
              <Button className="bg-accent-lb hover:bg-accent-db">
                <Link href="#brands" className="text-white">
                  Browse Brands
                </Link>
              </Button>
              <Button variant="outline">
                <Link href="/products">All Products</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Brands Section */}
      <div id="brands" className="container py-16 px">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center">Partner Brands</h2>
          <div className="w-20 h-1 bg-accent-lb mx-auto mt-4 mb-6"></div>
          <p className="text-gray-600 max-w-3xl mx-auto text-center">
            Browse our collection of carefully selected partner brands, each
            offering unique products with exceptional quality.
          </p>
        </div>

        {vendors.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <Store className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No brands found</h3>
            <p className="text-gray-500 mb-6">
              We'll be adding brands to our collection soon.
            </p>
            <Button>
              <Link href="/products" className="text-white">
                Browse Products
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vendors.map((vendor) => (
              <Card
                key={vendor.id}
                className="h-full flex flex-col justify-between items-start overflow-hidden transition-all duration-300 hover:shadow-lg border-gray-100 group"
              >
                <div className="p-6 h-full flex flex-col justify-between items-start">
                  <Link
                    href={`/featured/brands/@${vendor.id}`}
                    className="group flex flex-col h-fit"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-20 h-20 bg-accent-lb/10 rounded-lg flex items-center justify-center overflow-hidden p-2">
                        {vendor.logoImagePath ? (
                          <img
                            src={
                              vendor.logoImagePath.startsWith("http")
                                ? vendor.logoImagePath
                                : `/uploads/${vendor.logoImagePath}`
                            }
                            alt={vendor.name}
                            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <Store className="h-10 w-10 text-accent-lb" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-xl group-hover:text-accent-lb transition-colors">
                          {vendor.name}
                        </h3>
                        <Badge variant="outline" className="mt-1">
                          View Products
                        </Badge>
                      </div>
                    </div>
                  </Link>

                  {vendor.description && (
                    <p className="text-gray-600 line-clamp-3 mb-5">
                      {vendor.description}
                    </p>
                  )}

                  <Link
                    href={`/featured/brands/@${vendor.id}`}
                    className="inline-block w-full"
                  >
                    <Button
                      variant="outline"
                      className="w-full hover:bg-accent-lb hover:text-white transition-colors border-accent-lb/40"
                    >
                      Browse Products
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AnimatedContent>
  );
}
