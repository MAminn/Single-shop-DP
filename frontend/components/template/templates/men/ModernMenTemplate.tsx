import type React from 'react';
import HeroImg from "#root/assets/Men_s_Page_banner_1.webp";
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

interface MenTemplateData {
  subcategories: Category[];
  isLoading: boolean;
  error?: string | null;
}

interface ModernMenTemplateProps {
  data?: MenTemplateData;
}

// Modern alternative men's template with a different layout
const ModernMenTemplate: React.FC<ModernMenTemplateProps> = ({ data }) => {
  // Use provided data or fallback to empty state
  const subcategories = data?.subcategories || [];
  const isLoading = data?.isLoading || false;
  const error = data?.error || null;

  if (error) {
    return <ErrorSection error={error} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700">
      <div className="relative h-96 overflow-hidden">
        <img 
          src={HeroImg} 
          alt="Men's Collection" 
          className="w-full h-full object-cover opacity-80" 
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-4 tracking-wide">
              MEN'S COLLECTION
            </h1>
            <p className="text-xl opacity-90">
              Discover premium fashion for the modern man
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Shop by Category
            </h2>
            <div className="w-20 h-1 bg-blue-600 rounded"></div>
          </div>
          <Sorting categoryType="men" categories={subcategories} />
        </div>
      </div>
    </div>
  );
};

export default ModernMenTemplate;