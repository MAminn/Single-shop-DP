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
import { PlusCircle, Trash2, ExternalLink } from "lucide-react";

const socialLinkSchema = z.object({
  platform: z.string().min(1, "Platform name is required"),
  url: z.string().url("Please enter a valid URL"),
});

const formSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  logoId: z.string().uuid().optional(),
  socialLinks: z.array(socialLinkSchema).default([]),
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
      socialLinks: defaultValues?.socialLinks || [],
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

  // Handle adding a new social media link field
  const addSocialLink = () => {
    const currentLinks = form.getValues("socialLinks") || [];
    form.setValue("socialLinks", [...currentLinks, { platform: "", url: "" }]);
  };

  // Handle removing a social media link field
  const removeSocialLink = (index: number) => {
    const currentLinks = form.getValues("socialLinks") || [];
    const updatedLinks = currentLinks.filter((_, i) => i !== index);
    form.setValue("socialLinks", updatedLinks);
  };

  // Get the social links from the form
  const socialLinks = form.watch("socialLinks") || [];

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

        {/* Social Media Links Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel className="text-base">Social Media Links</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSocialLink}
              className="flex items-center gap-1"
            >
              <PlusCircle className="h-4 w-4" />
              Add Social Media
            </Button>
          </div>

          <FormDescription>
            Add links to the vendor's social media profiles
          </FormDescription>

          {socialLinks.length === 0 && (
            <p className="text-sm text-muted-foreground italic">
              No social media links added yet. Click the button above to add
              one.
            </p>
          )}

          {socialLinks.map((link, index) => (
            <div
              key={`social-link-${index}-${link.platform || "new"}`}
              className="flex gap-3 items-start"
            >
              <FormField
                control={form.control}
                name={`socialLinks.${index}.platform`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        placeholder="Platform (e.g., Instagram)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`socialLinks.${index}.url`}
                render={({ field }) => (
                  <FormItem className="flex-[2]">
                    <FormControl>
                      <Input placeholder="URL (https://...)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeSocialLink(index)}
                className="mt-1"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
                <span className="sr-only">Remove</span>
              </Button>
            </div>
          ))}
        </div>

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
