import React, {
  createContext,
  useContext,
  type ReactNode,
  useEffect,
  useState,
} from "react";
import {
  templateConfig,
  type TemplateCategory,
} from "#root/components/template-system/templateConfig";

// Re-export TemplateCategory for convenience
export type { TemplateCategory } from "#root/components/template-system/templateConfig";

// Template selection type
export type TemplateSelection = {
  [K in TemplateCategory]?: string | null;
};

// Template context type
interface TemplateContextType {
  activeTemplates: Record<string, string>;
  switchTemplate: (category: string, templateId: string) => void;
  getActiveTemplate: (category: string) => string;
  selection: TemplateSelection;
  getTemplateId: (category: TemplateCategory) => string | null;
  setTemplate: (category: TemplateCategory, templateId: string) => void;
}

// Create context
const TemplateContext = createContext<TemplateContextType | undefined>(
  undefined
);

// Local storage key for template selection
const TEMPLATE_STORAGE_KEY = "selected-templates";
const TEMPLATE_SELECTION_KEY = "template-selection";

// Build default selection from templateConfig
function getDefaultSelection(): TemplateSelection {
  const defaultSelection: TemplateSelection = {};

  (Object.keys(templateConfig) as TemplateCategory[]).forEach((category) => {
    const templates = templateConfig[category];
    if (templates && templates.length > 0) {
      defaultSelection[category] = templates[0]?.id;
    }
  });

  return defaultSelection;
}

// Validate that saved template IDs still exist in templateConfig
function validateSelection(saved: TemplateSelection): TemplateSelection {
  const defaults = getDefaultSelection();
  const validated: TemplateSelection = { ...defaults };

  (Object.keys(saved) as TemplateCategory[]).forEach((category) => {
    const id = saved[category];
    if (id && templateConfig[category]) {
      const exists = templateConfig[category].some((t) => t.id === id);
      if (exists) {
        validated[category] = id;
      }
      // If the saved ID doesn't exist, keep the default (already set above)
    }
  });

  return validated;
}

// Template provider component
export function TemplateProvider({ children }: { children: ReactNode }) {
  // Initialize selection state from localStorage or defaults
  const [selection, setSelection] = useState<TemplateSelection>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(TEMPLATE_SELECTION_KEY);
      if (saved) {
        try {
          return validateSelection(JSON.parse(saved));
        } catch (error) {
          console.error("Failed to parse saved template selection:", error);
        }
      }
    }
    return getDefaultSelection();
  });

  const [activeTemplates, setActiveTemplates] = useState<
    Record<TemplateCategory, string>
  >(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("activeTemplates");
      if (saved) {
        return JSON.parse(saved);
      }
    }
    return {
      home: "default",
      men: "default",
      women: "default",
      brands: "default",
      products: "default",
      product: "default-product",
      cart: "default",
      checkout: "default",
    };
  });

  // Persist selection to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(TEMPLATE_SELECTION_KEY, JSON.stringify(selection));
    }
  }, [selection]);

  // Load templates from localStorage on mount
  useEffect(() => {
    const savedTemplates = localStorage.getItem(TEMPLATE_STORAGE_KEY);
    if (savedTemplates) {
      try {
        const parsed = JSON.parse(savedTemplates);
        setActiveTemplates((prev) => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error("Failed to parse saved templates:", error);
      }
    }
  }, []);

  const switchTemplate = (category: string, templateId: string) => {
    const newTemplates = { ...activeTemplates, [category]: templateId };
    setActiveTemplates(newTemplates);
    localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(newTemplates));
  };

  const getActiveTemplate = (category: string) => {
    return activeTemplates[category as TemplateCategory] || "default";
  };

  const getTemplateId = (category: TemplateCategory): string | null => {
    // Check for preview override via query param
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const previewTemplate = urlParams.get("templatePreview");

      if (previewTemplate) {
        // Verify the preview template exists in the config for this category
        const templates = templateConfig[category];
        if (templates && templates.some((t) => t.id === previewTemplate)) {
          return previewTemplate;
        }
      }
    }

    return selection[category] || null;
  };

  const setTemplate = (category: TemplateCategory, templateId: string) => {
    setSelection((prev) => ({
      ...prev,
      [category]: templateId,
    }));
  };

  return (
    <TemplateContext.Provider
      value={{
        activeTemplates,
        switchTemplate,
        getActiveTemplate,
        selection,
        getTemplateId,
        setTemplate,
      }}>
      {children}
    </TemplateContext.Provider>
  );
}

// Hook to use template context
export function useTemplate() {
  const context = useContext(TemplateContext);
  if (context === undefined) {
    throw new Error("useTemplate must be used within a TemplateProvider");
  }
  return context;
}

export default TemplateProvider;
