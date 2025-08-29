import type React from 'react';
import { useState, Suspense } from 'react';
import { Button } from '#root/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#root/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#root/components/ui/select';
import { Badge } from '#root/components/ui/badge';
import { Monitor, Palette, CheckCircle, ExternalLink, Layers } from 'lucide-react';
import { useTemplate } from '#root/frontend/contexts/TemplateContext';
import { getAvailableTemplates, getTemplateMetadata, getTemplateComponent, type TemplateCategory } from '#root/frontend/components/template/templateRegistry';

// Template preview component
const TemplatePreview: React.FC<{ templateId: string; isActive: boolean; category: TemplateCategory }> = ({ templateId, isActive, category }) => {
  const TemplateComponent = getTemplateComponent(category, templateId);
  
  if (!TemplateComponent) {
    return (
      <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
        Preview not available
      </div>
    );
  }

  return (
    <div className="relative w-full h-48 bg-white rounded-lg border overflow-hidden">
      <div className="transform scale-[0.2] origin-top-left w-[500%] h-[500%]">
        <Suspense fallback={
          <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center">
            Loading preview...
          </div>
        }>
          <TemplateComponent />
        </Suspense>
      </div>
      {isActive && (
        <div className="absolute top-2 right-2">
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        </div>
      )}
    </div>
  );
};

export default function AdminTemplatesPage() {
  const { getActiveTemplate, switchTemplate } = useTemplate();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>('home');
  
  // Get available templates for selected category
  const availableTemplates = getAvailableTemplates(selectedCategory);

  const handleSwitchTemplate = (templateId: string) => {
    switchTemplate(selectedCategory, templateId);
    setSelectedTemplate(null);
  };

  // Get current active template for the selected category
  const currentActiveTemplate = getActiveTemplate(selectedCategory);

  const categories: { value: TemplateCategory; label: string; description: string }[] = [
    { value: 'home', label: 'Home Page', description: 'Main landing page templates' },
    { value: 'men', label: 'Men\'s Collection', description: 'Men\'s product page templates' },
    { value: 'women', label: 'Women\'s Collection', description: 'Women\'s product page templates' },
    { value: 'brands', label: 'Brands', description: 'Brand showcase page templates' },
    { value: 'products', label: 'Products', description: 'Product listing page templates' },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Template Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage and customize your website templates
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            <Select value={selectedCategory} onValueChange={(value: TemplateCategory) => setSelectedCategory(value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    <div className="flex flex-col">
                      <span>{category.label}</span>
                      <span className="text-xs text-muted-foreground">{category.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Monitor className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
               Active: {getTemplateMetadata(selectedCategory, currentActiveTemplate)?.name || 'Unknown'}
             </span>
          </div>
        </div>
      </div>

      {/* Current Active Template */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="w-5 h-5" />
            <span>Currently Active Template</span>
          </CardTitle>
          <CardDescription>
            This template is currently being used on your home page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">
                   {getTemplateMetadata(selectedCategory, currentActiveTemplate)?.name || 'Unknown Template'}
                 </h3>
                 <p className="text-muted-foreground">
                   {getTemplateMetadata(selectedCategory, currentActiveTemplate)?.description || 'No description available'}
                 </p>
              </div>
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="w-3 h-3 mr-1" />
                Active
              </Badge>
            </div>
            <div>
              <TemplatePreview templateId={currentActiveTemplate} isActive={true} category={selectedCategory} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Available Templates</CardTitle>
          <CardDescription>
            Choose from the available home page templates below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableTemplates.map((template) => {
              const isActive = template.id === currentActiveTemplate;
              
              return (
                <Card key={template.id} className={`cursor-pointer transition-all hover:shadow-md ${
                  isActive ? 'ring-2 ring-primary' : ''
                }`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {template.name}
                      </CardTitle>
                      {isActive && (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <TemplatePreview templateId={template.id} isActive={isActive} category={selectedCategory} />
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          const previewUrl = `/template-preview?category=${selectedCategory}&templateId=${template.id}`;
                          window.open(previewUrl, '_blank');
                        }}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                      <Button
                        variant={isActive ? "secondary" : "default"}
                        size="sm"
                        className="flex-1"
                        onClick={() => handleSwitchTemplate(template.id)}
                        disabled={isActive}
                      >
                        {isActive ? 'Currently Active' : 'Switch to This Template'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Add New Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              To add a new home page template:
            </p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Create a new React component in <code className="bg-muted px-1 py-0.5 rounded">/frontend/components/template/templates/home/</code></li>
              <li>Name it following the pattern <code className="bg-muted px-1 py-0.5 rounded">YourTemplateNameTemplate.tsx</code></li>
              <li>Add the import and metadata to the template registry</li>
              <li>The template will automatically appear in this dashboard</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}