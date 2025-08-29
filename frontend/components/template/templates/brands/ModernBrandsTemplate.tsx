import type React from 'react';
import { Card } from "#root/components/ui/card";
import { Button } from "#root/components/ui/button";
import { Badge } from "#root/components/ui/badge";
import { Store, Loader2, ArrowRight } from "lucide-react";
import AnimatedContent from '#root/components/AnimatedContent';
import { Link } from '#root/components/Link';

interface Vendor {
  id: string;
  name: string;
  description: string | null;
  logoImagePath: string | null;
}

interface BrandsTemplateData {
  vendors: Vendor[];
  isLoading: boolean;
  error: string | null;
}

interface ModernBrandsTemplateProps {
  data?: BrandsTemplateData;
}

// Modern alternative brands template with sleek design
const ModernBrandsTemplate: React.FC<ModernBrandsTemplateProps> = ({ data }) => {
  // Use provided data or fallback to empty state
  const templateData = data || {
    vendors: [],
    isLoading: false,
    error: null
  };

  if (templateData.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (templateData.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex flex-col items-center justify-center py-8">
        <h2 className="text-2xl font-bold text-red-500 mb-2">Error</h2>
        <p className="text-gray-600">{templateData.error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <AnimatedContent
        className="flex flex-col justify-center items-center"
        distance={25}
        direction="vertical"
        reverse={false}
      >
        {/* Hero Section */}
        <div className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-6">Discover Amazing Brands</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Explore our curated collection of premium brands, each offering unique products with exceptional quality.
            </p>
          </div>
        </div>

        <div className="container mx-auto py-16 px-4">
          {templateData.vendors.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
              <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Store className="h-12 w-12 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">No brands found</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                We're working hard to bring you amazing brands. Check back soon!
              </p>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Link href="/products" className="text-white flex items-center">
                  Browse Products
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {templateData.vendors.map((vendor, index) => (
                <Card
                  key={vendor.id}
                  className="group relative overflow-hidden bg-white hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 shadow-lg"
                >
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="p-8 relative z-10">
                    <div className="flex items-center gap-6 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center overflow-hidden p-3 group-hover:scale-110 transition-transform duration-300">
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
                          <Store className="h-8 w-8 text-indigo-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-xl text-gray-900 group-hover:text-indigo-600 transition-colors duration-300">
                          {vendor.name}
                        </h3>
                        <Badge 
                          variant="outline" 
                          className="mt-2 border-indigo-200 text-indigo-600 bg-indigo-50"
                        >
                          Premium Brand
                        </Badge>
                      </div>
                    </div>

                    {vendor.description && (
                      <p className="text-gray-600 line-clamp-3 mb-6 leading-relaxed">
                        {vendor.description}
                      </p>
                    )}

                    <Link
                      href={`/featured/brands/@${vendor.id}`}
                      className="block w-full"
                    >
                      <Button
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 group-hover:shadow-lg transition-all duration-300"
                      >
                        Explore Products
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </Button>
                    </Link>
                  </div>
                  
                  {/* Decorative element */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-bl-full" />
                </Card>
              ))}
            </div>
          )}
        </div>
      </AnimatedContent>
    </div>
  );
};

export default ModernBrandsTemplate;