import type React from 'react';
import HeroImg from "#root/assets/Women_s_banner.webp";
import { ErrorSection } from "#root/components/error-section";
import Sorting from "#root/components/sorting";

interface Category {
  id: string;
  name: string;
  type?: "men" | "women";
  displayName?: string;
  slug?: string;
  imageId?: string | null;
  filename?: string | null;
  productCount?: number;
}

interface WomenTemplateData {
  subcategories: Category[];
  isLoading: boolean;
  error?: string | null;
}

interface ModernWomenTemplateProps {
  data?: WomenTemplateData;
}

// Modern alternative women's template with elegant styling
const ModernWomenTemplate: React.FC<ModernWomenTemplateProps> = ({ data }) => {
  // Use provided data or fallback to empty state
  const subcategories = data?.subcategories || [];
  const isLoading = data?.isLoading || false;
  const error = data?.error || null;

  if (error) {
    return <ErrorSection error={error} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100">
      <div className="relative h-96 overflow-hidden">
        <img 
          src={HeroImg} 
          alt="Women's Collection" 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end justify-center pb-12">
          <div className="text-center text-white">
            <h1 className="text-5xl font-light mb-4 tracking-wider">
              WOMEN'S COLLECTION
            </h1>
            <p className="text-lg opacity-90 font-light">
              Elegance redefined for the contemporary woman
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light text-gray-800 mb-4">
              Explore Our Collections
            </h2>
            <div className="w-24 h-0.5 bg-rose-400 mx-auto rounded"></div>
          </div>
          <Sorting categoryType="women" categories={subcategories} />
        </div>
      </div>
    </div>
  );
};

export default ModernWomenTemplate;