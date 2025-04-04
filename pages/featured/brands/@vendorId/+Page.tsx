import { useState, useEffect, useCallback } from "react";
import { trpc } from "#root/shared/trpc/client";
import {
  Store,
  Loader2,
  MapPin,
  Calendar,
  Mail,
  Phone,
  ExternalLink,
} from "lucide-react";
import AnimatedContent from "#root/components/AnimatedContent";
import { Button } from "#root/components/ui/button";
import { usePageContext } from "vike-react/usePageContext";
import { ErrorSection } from "#root/components/error-section";
import Sorting from "#root/components/sorting";
import { Badge } from "#root/components/ui/badge";

interface VendorData {
  id: string;
  name: string;
  description: string | null;
  logoImagePath: string | null;
  createdAt?: Date;
  ownerEmail?: string | null;
  location?: string | null;
  contactPhone?: string | null;
  websiteUrl?: string | null;
}

export default function BrandDetailPage() {
  const ctx = usePageContext();
  const vendorId = ctx.urlPathname.split("/").pop()?.replace(/^@/, "");

  const [vendor, setVendor] = useState<VendorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVendor = useCallback(async () => {
    if (!vendorId) {
      console.error("No vendorId available from URL");
      setError("No vendor ID provided");
      setIsLoading(false);
      return;
    }

    try {
      const result = await trpc.vendor.viewById.query({ vendorId });

      if (result.success) {
        setVendor(result.result);
      } else {
        setError(result.error || "Failed to fetch brand information");
      }
    } catch (err) {
      console.error("Exception while fetching vendor:", err);
      setError("An error occurred while fetching brand data");
    } finally {
      setIsLoading(false);
    }
  }, [vendorId]);

  useEffect(() => {
    fetchVendor();
  }, [fetchVendor]);

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-accent-lb mx-auto mb-4" />
          <span className="block text-gray-600">
            Loading brand information...
          </span>
        </div>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="container flex flex-col items-center justify-center min-h-[60vh] py-8">
        <h2 className="text-2xl font-bold text-red-500 mb-2">Error</h2>
        <p className="text-gray-600">{error || "Brand not found"}</p>
        <Button
          onClick={() => {
            window.location.href = "/featured/brands";
          }}
          className="mt-4"
        >
          Back to Brands
        </Button>
      </div>
    );
  }

  if (!vendorId) {
    return <ErrorSection error="Invalid vendor ID" />;
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
      <div className="container mx-auto py-8 px-4">
        {/* Brand Header */}
        <div className="bg-white flex flex-col gap-6 rounded-xl shadow-sm mb-10 overflow-hidden">
          <div className="bg-gradient-to-r from-accent-lb/10 to-transparent h-32 md:h-40 relative">
            {/* Brand Logo */}
            <div className="absolute -bottom-12 left-6 md:left-10 w-24 h-24 md:w-32 md:h-32 bg-white rounded-xl shadow-md flex items-center justify-center p-3 border-2 border-white">
              {vendor.logoImagePath ? (
                <img
                  src={
                    vendor.logoImagePath.startsWith("http")
                      ? vendor.logoImagePath
                      : `/uploads/${vendor.logoImagePath}`
                  }
                  alt={vendor.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <Store className="h-12 w-12 md:h-16 md:w-16 text-accent-lb" />
              )}
            </div>
          </div>

          <div className="pt-16 md:pt-10 pb-6 px-6 md:px-10 md:flex md:justify-between md:items-end">
            <div className="md:max-w-2xl">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold">
                  {vendor.name}
                </h1>
                <Badge
                  variant="outline"
                  className="bg-accent-lb/10 text-accent-lb border-accent-lb/30"
                >
                  Verified Seller
                </Badge>
              </div>

              {vendor.description && (
                <p className="text-gray-600 mb-4 md:mb-0 max-w-2xl">
                  {vendor.description}
                </p>
              )}
            </div>

            <div className="flex gap-3 mt-4 md:mt-0">
              {vendor.websiteUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="text-gray-600 border-gray-300"
                >
                  <a
                    href={vendor.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Visit Website
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Vendor Details & Products */}
        <div className="grid grid-cols-1 lg:grid-cols-[300px,1fr] gap-8">
          {/* Sidebar */}
          <div className="order-2 lg:order-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-semibold border-b pb-3 mb-4">
                Brand Details
              </h2>

              <div className="space-y-4">
                {vendor.location && (
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <span className="block text-sm font-medium text-gray-900">
                        Location
                      </span>
                      <span className="block text-sm text-gray-600">
                        {vendor.location}
                      </span>
                    </div>
                  </div>
                )}

                {vendor.createdAt && (
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <span className="block text-sm font-medium text-gray-900">
                        Member Since
                      </span>
                      <span className="block text-sm text-gray-600">
                        {new Date(vendor.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}

                {vendor.contactPhone && (
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <span className="block text-sm font-medium text-gray-900">
                        Phone
                      </span>
                      <span className="block text-sm text-gray-600">
                        {vendor.contactPhone}
                      </span>
                    </div>
                  </div>
                )}

                {vendor.ownerEmail && (
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <span className="block text-sm font-medium text-gray-900">
                        Email
                      </span>
                      <span className="block text-sm text-gray-600">
                        {vendor.ownerEmail}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content - Products */}
          <div className="order-1 lg:order-2">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-6 pb-2 border-b">
                Products by {vendor.name}
              </h2>
              <Sorting vendorId={vendorId} />
            </div>
          </div>
        </div>
      </div>
    </AnimatedContent>
  );
}
