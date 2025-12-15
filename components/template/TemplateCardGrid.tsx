import type React from "react";
import { TemplateCard } from "./TemplateCard";
import {
  templateConfig,
  getTemplatesByCategory,
  type TemplateCategory,
} from "#root/components/template-system";
import { useTemplate } from "#root/frontend/contexts/TemplateContext";

export interface TemplateCardGridProps {
  category: TemplateCategory;
}

/**
 * TemplateCardGrid Component
 *
 * Renders a responsive grid of template cards for a specific category
 */
export function TemplateCardGrid({ category }: TemplateCardGridProps) {
  const { getTemplateId, setTemplate } = useTemplate();

  // Get all templates for this category
  const templates = getTemplatesByCategory(category);

  // Get currently active template ID for this category
  const activeTemplateId = getTemplateId(category);

  // Handle template selection
  const handleSelectTemplate = (templateId: string) => {
    setTemplate(category, templateId);
  };

  // Handle template preview (optional - can be implemented later)
  const handlePreviewTemplate = (templateId: string) => {
    // TODO: Implement preview functionality
    // Could open in a new window or modal
    console.log(`Preview template: ${category}/${templateId}`);
  };

  // If no templates available for this category
  if (!templates || templates.length === 0) {
    return (
      <div className='text-center py-8 text-muted-foreground'>
        <p>No templates available for this category yet.</p>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          id={template.id}
          label={template.label}
          description={`Template ID: ${template.id}`}
          category={category}
          isActive={template.id === activeTemplateId}
          onSelect={handleSelectTemplate}
          onPreview={handlePreviewTemplate}
        />
      ))}
    </div>
  );
}
