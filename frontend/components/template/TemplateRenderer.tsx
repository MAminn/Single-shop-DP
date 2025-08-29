import type React from 'react';
import { Suspense } from 'react';
import { getTemplateComponent, type TemplateCategory } from './templateRegistry';

// Template data interfaces
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

interface Vendor {
  id: string;
  name: string;
  description: string | null;
  logoImagePath: string | null;
}

interface Product {
  id: string;
  name: string;
  price: string | number;
  discountPrice?: number | string | null;
  imageUrl: string | null;
  images?: Array<{
    url: string;
    isPrimary?: boolean;
  }>;
  available: boolean;
  categoryId: string;
  categoryName: string | null;
  vendorId: string;
  vendorName: string | null;
  stock: number;
}

interface HomeTemplateData {
  featuredProducts: FeaturedProduct[];
  isLoading: boolean;
  error?: string | null;
}

interface MenTemplateData {
  subcategories: Category[];
  isLoading: boolean;
  error?: string | null;
}

interface WomenTemplateData {
  subcategories: Category[];
  isLoading: boolean;
  error?: string | null;
}

interface BrandsTemplateData {
  vendors: Vendor[];
  isLoading: boolean;
  error: string | null;
}

interface ProductsTemplateData {
  products: Product[];
  isLoading: boolean;
  error?: string | null;
}

// Union type for all possible template data
type TemplateData = HomeTemplateData | MenTemplateData | WomenTemplateData | BrandsTemplateData | ProductsTemplateData;

interface TemplateRendererProps {
  category: TemplateCategory;
  templateId: string;
  data?: TemplateData;
  fallback?: React.ComponentType;
}

// Simple fallback component
const DefaultFallback: React.FC = () => (
  <div className="p-8 text-center">
    <h2 className="text-xl font-semibold mb-2">Template Not Found</h2>
    <p className="text-gray-600">The requested template could not be loaded.</p>
  </div>
);

// Simple loading component
const TemplateLoader: React.FC = () => (
  <div className="p-8 text-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
    <p className="mt-2 text-gray-600">Loading template...</p>
  </div>
);

const TemplateRenderer: React.FC<TemplateRendererProps> = ({ 
  category,
  templateId, 
  data,
  fallback: FallbackComponent = DefaultFallback 
}) => {
  // Get the template component for the specified category and template ID
  const TemplateComponent = getTemplateComponent(category, templateId);
  
  if (!TemplateComponent) {
    return <FallbackComponent />;
  }
  
  return (
    <Suspense fallback={<TemplateLoader />}>
      <TemplateComponent data={data} />
    </Suspense>
  );
};

export default TemplateRenderer;