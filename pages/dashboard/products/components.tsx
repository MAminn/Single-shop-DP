"use client";
import { Fragment, useEffect, useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "#root/lib/utils";
import { Button } from "#root/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "#root/components/ui/form";
import { Input } from "#root/components/ui/input";
import { Textarea } from "#root/components/ui/textarea";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "#root/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "#root/components/ui/popover";
import { Check, ChevronsUpDown, XIcon } from "lucide-react";
import { FileUploadInput } from "#root/components/file-uploads/FileUpload";
import { MultiFileUploadInput } from "#root/components/file-uploads/MultiFileUpload";
import { TagsInput } from "#root/components/ui/tags-input";
import { Label } from "#root/components/ui/label";
import { Badge } from "#root/components/ui/badge";

// Define the interface to match our component
export interface FileMetadata {
  id: string;
  url?: string;
  diskname?: string;
  isPrimary?: boolean;
}

export function ProductForm({
  initialValues,
  categories,
  vendors = [],
  vendorId,
  onSuccess,
  isLoading = false,
}: {
  initialValues?: Partial<{
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    imageId: string;
    productImages: FileMetadata[];
    categoryId: string;
    categoryIds: string[];
    vendorId: string;
    variants: { name: string; values: string[] }[];
  }>;
  categories: { id: string; name: string }[];
  vendors?: { id: string; name: string }[];
  vendorId?: string;
  onSuccess?: () => void;
  isLoading?: boolean;
}) {
  const formSchema = z.object({
    name: z.string().min(1, "Product name is required"),
    description: z.string(),
    price: z.coerce.number().min(0, "Price must be greater than 0"),
    stock: z.coerce.number().int().min(0, "Stock must be greater than 0"),
    imageId: z.string().default(""),
    productImages: z
      .array(
        z.object({
          id: z.string(),
          url: z.string().optional(),
          diskname: z.string().optional(),
          isPrimary: z.boolean().optional(),
        })
      )
      .min(1, "At least one product image is required")
      .default([]),
    categoryId: z.string().min(1, "Primary category is required"),
    categoryIds: z
      .array(z.string())
      .min(1, "At least one category is required"),
    vendorId: z.string(),
    variants: z
      .array(
        z.object({
          name: z.string(),
          values: z.array(z.string()),
        })
      )
      .optional(),
  });

  // Convert initialValues to ensure compatibility
  const defaultValues = {
    ...initialValues,
    // If we have an imageId but no productImages, create a productImages array
    productImages:
      initialValues?.productImages ||
      (initialValues?.imageId
        ? [
            {
              id: initialValues.imageId,
              url: `/uploads/${initialValues.imageId}`,
              isPrimary: true,
            },
          ]
        : []),
    // Ensure variants are properly initialized
    variants: initialValues?.variants || [],
    // Initialize categoryIds with the initial categoryId if available
    categoryIds:
      initialValues?.categoryIds ||
      (initialValues?.categoryId ? [initialValues.categoryId] : []),
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Watch categoryIds to update categoryId (primary category)
  const categoryIds = form.watch("categoryIds");

  // Update the primary categoryId whenever categoryIds changes
  useEffect(() => {
    if (categoryIds && categoryIds.length > 0 && categoryIds[0]) {
      form.setValue("categoryId", categoryIds[0], { shouldValidate: true });
    }
  }, [categoryIds, form]);

  const [submitting, setSubmitting] = useState(false);

  const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
    setSubmitting(true);

    // Ensure we have at least one image that is primary
    if (values.productImages && values.productImages.length > 0) {
      // If no primary image is set, make the first one primary
      if (!values.productImages.some((img) => img?.isPrimary)) {
        if (values.productImages[0]) {
          values.productImages[0].isPrimary = true;
        }
      }

      // Set the primary image's ID as the main imageId for backward compatibility
      const primaryImage = values.productImages.find((img) => img?.isPrimary);
      if (primaryImage?.id) {
        values.imageId = primaryImage.id;
      } else if (values.productImages[0]?.id) {
        values.imageId = values.productImages[0].id;
      }
    }

    // Ensure imageId is a string (required by the mutations)
    if (!values.imageId) {
      toast.error("At least one product image is required");
      setSubmitting(false);
      return;
    }

    try {
      const { trpc } = await import("#root/shared/trpc/client");

      let result: { success: boolean; error?: string };
      if (initialValues?.id) {
        // Update existing product - only include variants and images if they've been modified
        // This prevents clearing them out when editing other fields
        const payload = {
          id: initialValues.id,
          ...values,
        };
        result = await trpc.product.edit.mutate(payload);
      } else {
        // Create new product
        result = await trpc.product.create.mutate({
          ...values,
          imageId: values.imageId,
        });
      }

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(
        initialValues?.id ? "Product updated!" : "Product created!"
      );
      onSuccess?.();
      if (!initialValues?.id) {
        form.reset();
      }
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="ml-3">Loading product data...</p>
        </div>
      ) : (
        <form
          onSubmit={form.handleSubmit(handleFormSubmit)}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Awesome Product" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="This product is awesome because..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="99.99"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e.target.valueAsNumber);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="100"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e.target.valueAsNumber);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="productImages"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Images</FormLabel>
                <FormControl>
                  <MultiFileUploadInput
                    name="productImages"
                    id="productImages"
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryIds"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Categories (select multiple)</FormLabel>
                <div className="flex flex-wrap gap-2 mb-2">
                  {field.value.map((categoryId) => {
                    const category = categories.find(
                      (c) => c.id === categoryId
                    );
                    return category ? (
                      <Badge key={categoryId} className="p-2">
                        {category.name}
                        <button
                          type="button"
                          className="ml-1"
                          onClick={() => {
                            const newCategoryIds = field.value.filter(
                              (id) => id !== categoryId
                            );
                            field.onChange(newCategoryIds);
                          }}
                        >
                          ×
                        </button>
                      </Badge>
                    ) : null;
                  })}
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "w-full justify-between",
                          field.value.length === 0 && "text-muted-foreground"
                        )}
                      >
                        {field.value.length === 0
                          ? "Select categories"
                          : `${field.value.length} ${
                              field.value.length === 1
                                ? "category"
                                : "categories"
                            } selected`}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search categories..." />
                      <CommandList>
                        <CommandEmpty>No categories found.</CommandEmpty>
                        <CommandGroup>
                          {categories.map((c) => (
                            <CommandItem
                              key={c.id}
                              onSelect={() => {
                                const isSelected = field.value.includes(c.id);
                                let newCategoryIds = [...field.value];

                                if (isSelected) {
                                  // Remove if already selected
                                  newCategoryIds = newCategoryIds.filter(
                                    (id) => id !== c.id
                                  );
                                } else {
                                  // Add if not selected
                                  newCategoryIds.push(c.id);
                                }

                                field.onChange(newCategoryIds);
                              }}
                            >
                              <div className="flex items-center">
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value.includes(c.id)
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {c.name}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Hidden field for storing the primary categoryId */}
          <input type="hidden" {...form.register("categoryId")} />

          <FormField
            name="variants"
            control={form.control}
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel className="text-lg">Variants</FormLabel>
                  <FormControl>
                    <VariantsInput
                      value={field.value}
                      onChange={(v) => field.onChange(v)}
                    />
                  </FormControl>
                </FormItem>
              );
            }}
          />

          {vendorId && (
            <input
              type="hidden"
              {...form.register("vendorId")}
              value={vendorId}
            />
          )}
          {!vendorId && (
            <FormField
              control={form.control}
              name="vendorId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Vendor</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          // biome-ignore lint/a11y/useSemanticElements: <explanation>
                          role="combobox"
                          className={cn(
                            "w-[200px] justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? vendors.find((v) => v.id === field.value)?.name
                            : "Select vendor"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Search language..." />
                        <CommandList>
                          <CommandEmpty>No language found.</CommandEmpty>
                          <CommandGroup>
                            {vendors.map((v) => (
                              <CommandItem
                                value={v.name}
                                key={v.id}
                                onSelect={() => {
                                  form.setValue("vendorId", v.id);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    v.id === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {v.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <Button type="submit" size="lg" className="w-full">
            Submit
          </Button>
        </form>
      )}
    </Form>
  );
}

export function VariantsInput({
  value,
  onChange,
}: {
  value: { name: string; values: string[] }[] | undefined;
  onChange: (value: { name: string; values: string[] }[]) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {value?.map((v, i) => (
        <Fragment
          key={`variant.${
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            i
          }`}
        >
          <VariantInput
            value={v}
            onChange={(v) => {
              const newValue = [...value];
              newValue[i] = v;
              onChange(newValue);
            }}
          />
          <Button
            size="sm"
            className="self-end opacity-90"
            variant={"destructive"}
            type="button"
            onClick={() => {
              const newValue = [...value];
              newValue.splice(i, 1);
              onChange(newValue);
            }}
          >
            <XIcon />
            Remove Variant
          </Button>
        </Fragment>
      ))}

      <Button
        type="button"
        onClick={() =>
          onChange([
            ...(value ?? []),
            { name: `Variant ${(value?.length ?? 0) + 1}`, values: [] },
          ])
        }
      >
        Add Variant
      </Button>
    </div>
  );
}

export function VariantInput({
  value,
  onChange,
}: {
  value: {
    name: string;
    values: string[];
  };
  onChange: (value: { name: string; values: string[] }) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <Label>Name</Label>
        <Input
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label>Values</Label>
        <TagsInput
          className="outline-1 border-none"
          value={value.values}
          onValueChange={(v) => onChange({ ...value, values: v })}
        />
        <p className="text-sm text-muted-foreground">
          Press Enter to add a value
        </p>
      </div>
    </div>
  );
}
