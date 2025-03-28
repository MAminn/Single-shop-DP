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
import { TagsInput } from "#root/components/ui/tags-input";
import { Label } from "#root/components/ui/label";

const formSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  name: z.string().min(1).max(255),
  description: z.string().max(255),
  price: z.coerce.number(),
  stock: z.coerce.number(),
  imageId: z.string(),
  categoryId: z.string(),
  vendorId: z.string(),
  variants: z
    .array(
      z.object({
        name: z.string().min(1).max(255),
        values: z.array(z.string().min(1).max(255)),
      })
    )
    .optional(),
});

export type ProductFormSchema = z.infer<typeof formSchema>;

export default function ProductForm({
  categories,
  vendors,
  vendorId,
  defaultValues,
  onSubmit,
}: {
  defaultValues?: z.infer<typeof formSchema>;
  categories: { id: string; name: string }[];
  vendors: { id: string; name: string }[];
  vendorId?: string;
  onSubmit: (values: z.infer<typeof formSchema>) => PromiseLike<void>;
}) {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
    disabled: submitting,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 py-10">
        {/* <input type="hidden" {...form.register("id")} /> */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="" type="text" {...field} />
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
                  placeholder="Product description"
                  className="resize-none"
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input placeholder="" type="number" {...field} />
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
                <Input placeholder="" type="number" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="imageId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image</FormLabel>
              <FormControl>
                <FileUploadInput id="image" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Category</FormLabel>
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
                        ? categories.find((c) => c.id === field.value)?.name
                        : "Select category"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Search language..." />
                    <CommandList>
                      <CommandEmpty>No categories found.</CommandEmpty>
                      <CommandGroup>
                        {categories.map((c) => (
                          <CommandItem
                            value={c.id}
                            key={c.id}
                            onSelect={() => {
                              form.setValue("categoryId", c.id);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                c.id === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {c.name}
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
