import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "#root/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "#root/components/ui/form";
import { Input } from "#root/components/ui/input";
import { useState } from "react";
import { Textarea } from "#root/components/ui/textarea";
import { FileUploader } from "#root/components/file-uploads/FileUploader";

const formSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  logoId: z.string().uuid().optional(),
  featured: z.boolean().optional(),
});

export default function VendorForm({
  onSubmit,
  defaultValues,
}: {
  defaultValues?: z.infer<typeof formSchema>;
  onSubmit: (values: z.infer<typeof formSchema>) => PromiseLike<void>;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [uploadedLogoId, setUploadedLogoId] = useState<string | undefined>(
    defaultValues?.logoId
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...defaultValues,
      featured: defaultValues?.featured || false,
    },
    disabled: submitting,
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setSubmitting(true);
    // Ensure logoId is either a string or undefined (not null)
    const cleanedValues = {
      ...values,
      logoId: values.logoId || uploadedLogoId || undefined,
    };
    await onSubmit(cleanedValues);
    setSubmitting(false);
  };

  const handleLogoUpload = async (file: File) => {
    try {
      // Create FormData object
      const formData = new FormData();
      formData.append("file", file);

      // Use fetch directly to upload the file
      const response = await fetch("/file", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success && result.result) {
        // Set the logo ID in state and form
        setUploadedLogoId(result.result.id);
        form.setValue("logoId", result.result.id);
        toast.success("Logo uploaded successfully");
      } else {
        toast.error(result.error || "Failed to upload logo");
      }
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("Error uploading logo");
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-8 max-w-3xl mx-auto py-10"
      >
        <input type="hidden" {...form.register("id")} />
        <input type="hidden" {...form.register("logoId")} />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Store name" type="text" {...field} />
              </FormControl>
              <FormDescription>Store name.</FormDescription>
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
                  placeholder="Store description"
                  className="resize-none"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>Describe the store (optional).</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="featured"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="h-4 w-4 mt-1"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Featured Vendor</FormLabel>
                <FormDescription>
                  Display this vendor on the featured brands page
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <FormLabel>Vendor Logo</FormLabel>
          <FileUploader
            onUpload={handleLogoUpload}
            fileId={uploadedLogoId}
            accept="image/*"
            maxSize={2} // 2MB
          />
          <FormDescription>
            Upload a logo for the store (optional). Recommended size: 400x400
            pixels.
          </FormDescription>
        </div>

        <Button
          className="w-full"
          size="lg"
          type="submit"
          disabled={submitting}
        >
          Save
        </Button>
      </form>
    </Form>
  );
}
