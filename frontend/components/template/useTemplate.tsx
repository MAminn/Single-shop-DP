import { useTemplate as useTemplateContext } from '../../contexts/TemplateContext';
import type { TemplateCategory } from './templateRegistry';

/**
 * Hook to get the active template for a specific category
 * @param category - The template category (home, men, women, brands, products)
 * @returns The active template ID for the specified category
 */
export function useTemplate(category: TemplateCategory) {
  const { getActiveTemplate } = useTemplateContext();
  
  const activeTemplate = getActiveTemplate(category);
  
  return {
    activeTemplate
  };
}

export default useTemplate;