import React, { createContext, useContext, type ReactNode, useEffect, useState } from 'react';
import type { TemplateCategory } from '../components/template/templateRegistry';

// Template context type
interface TemplateContextType {
  activeTemplates: Record<string, string>;
  switchTemplate: (category: string, templateId: string) => void;
  getActiveTemplate: (category: string) => string;
}

// Create context
const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

// Local storage key for template selection
const TEMPLATE_STORAGE_KEY = 'selected-templates';

// Template provider component
export function TemplateProvider({ children }: { children: ReactNode }) {
  const [activeTemplates, setActiveTemplates] = useState<Record<TemplateCategory, string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('activeTemplates');
      if (saved) {
        return JSON.parse(saved);
      }
    }
    return {
      home: 'default',
      men: 'default',
      women: 'default',
      brands: 'default',
      products: 'default',
      product: 'default-product',
      cart: 'default',
      checkout: 'default',
    };
  });

  // Load templates from localStorage on mount
  useEffect(() => {
    const savedTemplates = localStorage.getItem(TEMPLATE_STORAGE_KEY);
    if (savedTemplates) {
      try {
        const parsed = JSON.parse(savedTemplates);
        setActiveTemplates(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to parse saved templates:', error);
      }
    }
  }, []);

  const switchTemplate = (category: string, templateId: string) => {
    const newTemplates = { ...activeTemplates, [category]: templateId };
    setActiveTemplates(newTemplates);
    localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(newTemplates));
  };

  const getActiveTemplate = (category: string) => {
    return activeTemplates[category as TemplateCategory] || 'default';
  };

  return (
    <TemplateContext.Provider value={{ activeTemplates, switchTemplate, getActiveTemplate }}>
      {children}
    </TemplateContext.Provider>
  );
}

// Hook to use template context
export function useTemplate() {
  const context = useContext(TemplateContext);
  if (context === undefined) {
    throw new Error('useTemplate must be used within a TemplateProvider');
  }
  return context;
}

export default TemplateProvider;