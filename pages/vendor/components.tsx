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
import { PasswordInput } from "#root/components/ui/password-input";
import { PhoneInput } from "#root/components/ui/phone-input";
import { useState } from "react";
import { Textarea } from "#root/components/ui/textarea";
import { toast } from "sonner";
import { PlusCircle, Trash2 } from "lucide-react";

const socialLinkSchema = z.object({
  platform: z.string().min(1, "Platform name is required"),
  url: z.string().url("Please enter a valid URL"),
  id: z.string().optional(),
});

const vendorRegistrationFormSchema = z.object({
  vendor: z.object({
    name: z.string().nonempty().max(255),
    description: z.string().max(1000).optional(),
    logoId: z.string().uuid().optional(),
    socialLinks: z.array(socialLinkSchema).default([]),
  }),
  user: z.object({
    email: z.string().email(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .max(255),
    name: z.string().nonempty().max(255),
    phone: z
      .string()
      .regex(/^(\+201|01|00201)[0-2,5]{1}[0-9]{8}/, "Invalid phone number"),
  }),
});

export type VendorRegistrationFormSchema = z.infer<
  typeof vendorRegistrationFormSchema
>;

export default function RegisterFormSchema({
  onSubmit,
}: {
  onSubmit: (
    values: z.infer<typeof vendorRegistrationFormSchema>
  ) => PromiseLike<void>;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [uploadedLogoId, setUploadedLogoId] = useState<string | undefined>();

  const form = useForm<z.infer<typeof vendorRegistrationFormSchema>>({
    resolver: zodResolver(vendorRegistrationFormSchema),
    disabled: submitting,
    defaultValues: {
      vendor: {
        name: "",
        description: "",
        socialLinks: [],
      },
      user: {
        email: "",
        password: "",
        name: "",
        phone: "",
      },
    },
  });

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
        form.setValue("vendor.logoId", result.result.id);
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
    const currentLinks = form.getValues("vendor.socialLinks") || [];
    form.setValue("vendor.socialLinks", [
      ...currentLinks,
      { platform: "", url: "", id: `${Date.now()}` },
    ]);
  };

  // Handle removing a social media link field
  const removeSocialLink = (index: number) => {
    const currentLinks = form.getValues("vendor.socialLinks") || [];
    const updatedLinks = currentLinks.filter((_, i) => i !== index);
    form.setValue("vendor.socialLinks", updatedLinks);
  };

  // Get the social links from the form
  const socialLinks = form.watch("vendor.socialLinks") || [];

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (values) => {
          // Add the logoId if it was uploaded
          if (uploadedLogoId) {
            values.vendor.logoId = uploadedLogoId;
          }

          setSubmitting(true);
          await onSubmit(values);
          setSubmitting(false);
        })}
        className="space-y-8 mx-auto py-10"
      >
        <FormField
          control={form.control}
          name="vendor.name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vendor Name</FormLabel>
              <FormControl>
                <Input placeholder="X Store" type="text" {...field} />
              </FormControl>
              <FormDescription>This is your store's name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="vendor.description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us about your store"
                  className="resize-none"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>Describe your store (optional).</FormDescription>
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
            Add links to your social media profiles
          </FormDescription>

          {socialLinks.length === 0 && (
            <p className="text-sm text-muted-foreground italic">
              No social media links added yet. Click the button above to add
              one.
            </p>
          )}

          {socialLinks.map((link, index) => (
            <div
              key={link.id || `social-link-${index}`}
              className="flex gap-3 items-start"
            >
              <FormField
                control={form.control}
                name={`vendor.socialLinks.${index}.platform`}
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
                name={`vendor.socialLinks.${index}.url`}
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

        <div className="space-y-3">
          <FormLabel>Vendor Logo</FormLabel>
          <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50">
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  const file = e.target.files[0];
                  if (!file) return;

                  // Validate file
                  if (file.size > 2 * 1024 * 1024) {
                    toast.error("File size should be less than 2MB");
                    return;
                  }

                  handleLogoUpload(file);
                }
              }}
              className="hidden"
              id="logo-upload"
            />
            <label htmlFor="logo-upload" className="cursor-pointer text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                  role="img"
                  aria-labelledby="uploadIconTitle"
                >
                  <title id="uploadIconTitle">Upload Icon</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-600">
                Upload your store logo
                <br />
                <span className="text-xs text-gray-500">
                  PNG, JPG up to 2MB
                </span>
              </p>
            </label>
            {uploadedLogoId && (
              <p className="text-sm text-green-600 mt-2">
                Logo uploaded successfully
              </p>
            )}
          </div>
          <FormDescription>
            Upload a logo for your store (optional).
          </FormDescription>
        </div>

        <FormField
          control={form.control}
          name="user.name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Name</FormLabel>
              <FormControl>
                <Input placeholder="" type="text" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="user.email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="email@example.com"
                  type="email"
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="user.password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder="********" {...field} />
              </FormControl>
              <FormDescription>
                Must be at least 8 characters long.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="user.phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <PhoneInput placeholder="+20 11 1234 5678" {...field} />
              </FormControl>
              <FormDescription>Your contact phone number.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="bg-accent-lb text-white py-2 rounded-lg hover:bg-[#021E43] transition-all duration-300 w-full"
          disabled={submitting}
        >
          Register
        </Button>
      </form>
    </Form>
  );
}
