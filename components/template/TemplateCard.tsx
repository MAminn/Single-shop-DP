import type React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#root/components/ui/card";
import { Button } from "#root/components/ui/button";
import { Badge } from "#root/components/ui/badge";
import { CheckCircle, Eye } from "lucide-react";
import type { TemplateCategory } from "#root/components/template-system";

export interface TemplateCardProps {
  id: string;
  label: string;
  description?: string;
  thumbnail?: string;
  category: TemplateCategory;
  isActive: boolean;
  onSelect: (templateId: string) => void;
  onPreview?: (templateId: string) => void;
}

/**
 * TemplateCard Component
 *
 * Visual card-based selector for individual templates
 */
export function TemplateCard({
  id,
  label,
  description,
  thumbnail,
  category,
  isActive,
  onSelect,
  onPreview,
}: TemplateCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
        isActive
          ? "ring-2 ring-primary border-primary"
          : "hover:border-primary/50"
      }`}>
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between'>
          <div className='flex-1'>
            <CardTitle className='text-lg flex items-center gap-2'>
              {label}
              {isActive && (
                <Badge
                  variant='default'
                  className='bg-green-500 hover:bg-green-600'>
                  <CheckCircle className='w-3 h-3 mr-1' />
                  Active
                </Badge>
              )}
            </CardTitle>
            {description && (
              <CardDescription className='mt-2'>{description}</CardDescription>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className='space-y-4'>
        {/* Thumbnail Preview */}
        <div className='relative w-full aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden border border-gray-200'>
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={`${label} preview`}
              className='w-full h-full object-cover'
            />
          ) : (
            <div className='w-full h-full flex items-center justify-center text-gray-400'>
              <div className='text-center'>
                <Eye className='w-8 h-8 mx-auto mb-2 opacity-50' />
                <p className='text-sm'>Preview not available</p>
              </div>
            </div>
          )}
          {isActive && (
            <div className='absolute inset-0 bg-green-500/10 border-2 border-green-500 rounded-lg' />
          )}
        </div>

        {/* Action Buttons */}
        <div className='flex gap-2'>
          {onPreview && (
            <Button
              variant='outline'
              size='sm'
              className='flex-1'
              onClick={(e) => {
                e.stopPropagation();
                onPreview(id);
              }}>
              <Eye className='w-4 h-4 mr-2' />
              Preview
            </Button>
          )}
          <Button
            variant={isActive ? "secondary" : "default"}
            size='sm'
            className='flex-1'
            onClick={(e) => {
              e.stopPropagation();
              if (!isActive) {
                onSelect(id);
              }
            }}
            disabled={isActive}>
            {isActive ? (
              <>
                <CheckCircle className='w-4 h-4 mr-2' />
                Active
              </>
            ) : (
              "Activate"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
