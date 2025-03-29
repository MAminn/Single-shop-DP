import { useState, useEffect, useCallback } from "react";
import { trpc } from "#root/shared/trpc/client";
import { Link } from "#root/components/Link";
import { Loader2, Store } from "lucide-react";
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
      distance={100}
      direction="vertical"
      reverse={false}
      config={{ tension: 60, friction: 30 }}
      initialOpacity={0}
      animateOpacity
      scale={1}
      threshold={0.1}
    >
      <div className=" py-8 flex flex-col items-center justify-center w-full">
        <div className="mb-8 w-full justify-center items-center  flex flex-col">
          <h1 className="text-3xl font-bold mb-4">Our Brands</h1>
          <p className="text-gray-600 max-w-3xl text-center">
            Discover our curated selection of quality brands. Each brand offers
            unique products with exceptional quality and value.
          </p>
        </div>

        {vendors.length === 0 ? (
          <div className="text-center py-12">
            <Store className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No brands found</h3>
            <p className="text-gray-500">
              We'll be adding brands to our collection soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendors.map((vendor) => (
              <Card
                key={vendor.id}
                className="h-full overflow-hidden transition-all duration-300 hover:shadow-md"
              >
                <div className="p-6">
                  <Link
                    href={`/featured/brands/@${vendor.id}`}
                    className="group"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-accent-lb/10 rounded-lg flex items-center justify-center">
                        {vendor.logoImagePath ? (
                          <img
                            src={
                              vendor.logoImagePath.startsWith("http")
                                ? vendor.logoImagePath
                                : `/uploads/${vendor.logoImagePath}`
                            }
                            alt={vendor.name}
                            className="w-12 h-12 object-contain"
                          />
                        ) : (
                          <Store className="h-8 w-8 text-accent-lb" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg group-hover:text-accent-lb transition-colors">
                          {vendor.name}
                        </h3>
                        <Badge variant="outline" className="mt-1">
                          View Products
                        </Badge>
                      </div>
                    </div>
                  </Link>

                  {vendor.description && (
                    <p className="text-gray-600 line-clamp-3 mb-4">
                      {vendor.description}
                    </p>
                  )}

                  <Link
                    href={`/featured/brands/@${vendor.id}`}
                    className="inline-block"
                  >
                    <Button
                      variant="ghost"
                      className="p-0 h-auto text-accent-lb hover:underline"
                    >
                      Browse all products
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
