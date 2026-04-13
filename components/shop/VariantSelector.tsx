import { cn } from "#root/lib/utils";

export interface VariantOption {
  name: string;
  values: string[];
}

interface VariantSelectorProps {
  variants: VariantOption[];
  selectedVariants: Record<string, string>;
  onVariantChange: (variantName: string, value: string) => void;
  className?: string;
}

export function VariantSelector({
  variants,
  selectedVariants,
  onVariantChange,
  className,
}: VariantSelectorProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {variants.map((variant) => (
        <div key={variant.name}>
          <p className='text-sm font-medium text-gray-700 mb-2'>
            {variant.name}
            {selectedVariants[variant.name] && (
              <span className='ml-1.5 font-normal text-gray-500'>
                — {selectedVariants[variant.name]}
              </span>
            )}
          </p>
          <div className='flex flex-wrap gap-2'>
            {variant.values.map((value) => {
              const isSelected = selectedVariants[variant.name] === value;
              return (
                <button
                  key={value}
                  type='button'
                  onClick={() => onVariantChange(variant.name, value)}
                  className={cn(
                    "px-4 py-2 text-sm rounded-full border transition-all duration-150",
                    isSelected
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-700 border-gray-300 hover:border-gray-900 hover:text-gray-900",
                  )}>
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
