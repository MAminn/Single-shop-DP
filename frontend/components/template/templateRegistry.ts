import DefaultHomeTemplate from './templates/home/DefaultHomeTemplate';
import ModernHomeTemplate from './templates/home/ModernHomeTemplate';
import DefaultMenTemplate from './templates/men/DefaultMenTemplate';
import DefaultWomenTemplate from './templates/women/DefaultWomenTemplate';
import DefaultBrandsTemplate from './templates/brands/DefaultBrandsTemplate';
import DefaultProductsTemplate from './templates/products/DefaultProductsTemplate';
import ModernMenTemplate from './templates/men/ModernMenTemplate';
import ModernWomenTemplate from './templates/women/ModernWomenTemplate';
import ModernBrandsTemplate from './templates/brands/ModernBrandsTemplate';
import ModernProductsTemplate from './templates/products/ModernProductsTemplate';

export type TemplateCategory = 'home' | 'men' | 'women' | 'brands' | 'products';

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

type TemplateData = HomeTemplateData | MenTemplateData | WomenTemplateData | BrandsTemplateData | ProductsTemplateData;

export interface TemplateInfo {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  component: React.ComponentType<{ data?: TemplateData }>;
}

// Template definitions for each category
const templates: Record<TemplateCategory, TemplateInfo[]> = {
  home: [
    {
      id: 'default-home',
      name: 'Default Home',
      description: 'The original home page design',
      category: 'home',
      component: DefaultHomeTemplate as React.ComponentType<{ data?: TemplateData }>,
    },
    {
      id: 'modern-home',
      name: 'Modern Home',
      description: 'A modern and sleek home page design',
      category: 'home',
      component: ModernHomeTemplate as React.ComponentType<{ data?: TemplateData }>,
    },
  ],
  men: [
    {
      id: 'default-men',
      name: 'Default Men',
      description: 'The original men\'s page design',
      category: 'men',
      component: DefaultMenTemplate as React.ComponentType<{ data?: TemplateData }>,
    },
    {
      id: 'modern-men',
      name: 'Modern Men',
      description: 'A modern men\'s page with dark theme',
      category: 'men',
      component: ModernMenTemplate as React.ComponentType<{ data?: TemplateData }>,
    },
  ],
  women: [
    {
      id: 'default-women',
      name: 'Default Women',
      description: 'The original women\'s page design',
      category: 'women',
      component: DefaultWomenTemplate as React.ComponentType<{ data?: TemplateData }>,
    },
    {
      id: 'modern-women',
      name: 'Modern Women',
      description: 'An elegant women\'s page with rose theme',
      category: 'women',
      component: ModernWomenTemplate as React.ComponentType<{ data?: TemplateData }>, 
    },
  ],
  brands: [
    {
      id: 'default-brands',
      name: 'Default Brands',
      description: 'The original brands page design',
      category: 'brands',
      component: DefaultBrandsTemplate as React.ComponentType<{ data?: TemplateData }>,
    },
    {
      id: 'modern-brands',
      name: 'Modern Brands',
      description: 'A sleek brands page with gradient design',
      category: 'brands',
      component: ModernBrandsTemplate as React.ComponentType<{ data?: TemplateData }>,
    },
  ],
  products: [
    {
      id: 'default-products',
      name: 'Default Products',
      description: 'The original products page design',
      category: 'products',
      component: DefaultProductsTemplate as React.ComponentType<{ data?: TemplateData }>,
    },
    {
      id: 'modern-products',
      name: 'Modern Products',
      description: 'An enhanced products page with advanced features',
      category: 'products',
      component: ModernProductsTemplate as React.ComponentType<{ data?: TemplateData }>,
    },
  ],
};

// Helper function to get template component
export function getTemplateComponent(
  category: TemplateCategory,
  templateId: string
) {
  const categoryTemplates = templates[category];
  if (!categoryTemplates) {
    console.warn(`No templates found for category: ${category}`);
    return null;
  }

  const template = categoryTemplates.find(t => t.id === templateId);
  if (!template) {
    console.warn(`Template "${templateId}" not found in category "${category}"`);
    return categoryTemplates[0]?.component || null;
  }

  return template.component;
}

// Helper function to get available templates for a category
export function getAvailableTemplates(category: TemplateCategory): TemplateInfo[] {
  return templates[category] || [];
}

// Helper function to get template metadata
export function getTemplateMetadata(category: TemplateCategory, templateId: string): TemplateInfo | null {
  const categoryTemplates = templates[category];
  if (!categoryTemplates) {
    return null;
  }

  return categoryTemplates.find(t => t.id === templateId) || null;
}

// Export templates for external use
export { templates };