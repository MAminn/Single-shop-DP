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
import { Loader2 } from "lucide-react";
import { trpc } from "#root/shared/trpc/client";

const vendorRegistrationFormSchema = z.object({
  vendor: z.object({
    name: z.string().nonempty().max(255),
    description: z.string().max(1000).optional(),
    logoId: z.string().uuid().optional(),
    featured: z.boolean().optional().default(false),
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

export function CreateVendorForm({ onSuccess }: { onSuccess: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [uploadedLogoId, setUploadedLogoId] = useState<string | undefined>();

  const form = useForm<z.infer<typeof vendorRegistrationFormSchema>>({
    resolver: zodResolver(vendorRegistrationFormSchema),
    disabled: submitting,
    defaultValues: {
      vendor: {
        name: "",
        description: "",
        featured: false,
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

  const handleSubmit = async (values: VendorRegistrationFormSchema) => {
    setSubmitting(true);

    try {
      // Add the logoId if it was uploaded
      if (uploadedLogoId) {
        values.vendor.logoId = uploadedLogoId;
      }


      // First register the vendor
      const result = await trpc.vendor.register.mutate(values);

      if (!result.success) {
        toast.error(result.error || "Failed to create vendor");
        setSubmitting(false);
        return;
      }

      // Since this is created by an admin, automatically approve the vendor
      const approveResult = await trpc.vendor.approve.mutate({
        id: result.result.id,
      });

      // If the vendor should be featured, update that too
      if (values.vendor.featured) {
        await trpc.vendor.updateFeaturedStatus.mutate({
          vendorId: result.result.id,
        });
      }

      if (!approveResult.success) {
        toast.error("Vendor created but could not be automatically approved");
      } else {
        toast.success("Vendor created and approved successfully");
      }

      onSuccess();
    } catch (error) {
      toast.error("An error occurred while creating the vendor");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {submitting && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-card">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Creating vendor...</p>
          </div>
        </div>
      )}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-8 mx-auto py-6"
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
                <FormDescription>This is the store's name.</FormDescription>
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
                    placeholder="Tell us about the store"
                    className="resize-none"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormDescription>
                  Describe the store (optional).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

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
              <label
                htmlFor="logo-upload"
                className="cursor-pointer text-center"
              >
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
                  Upload store logo
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
              Upload a logo for the store (optional).
            </FormDescription>
          </div>

          <FormField
            control={form.control}
            name="vendor.featured"
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

          <FormField
            control={form.control}
            name="user.name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Owner Name</FormLabel>
                <FormControl>
                  <Input placeholder="" type="text" {...field} />
                </FormControl>
                <FormDescription>Name of the store owner.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="user.email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Owner Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="email@example.com"
                    type="email"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Email for the vendor account.</FormDescription>
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
                  <PasswordInput
                    placeholder="Minimum 8 characters"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Password for the vendor account.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="user.phone"
            render={({ field }) => (
              <FormItem className="flex flex-col items-start">
                <FormLabel>Phone number</FormLabel>
                <FormControl className="w-full">
                  <PhoneInput
                    placeholder="+20XXX XXX XXXX"
                    {...field}
                    defaultCountry="EG"
                    countries={["EG"]}
                  />
                </FormControl>
                <FormDescription>
                  Contact number for the vendor.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={submitting}
          >
            Create Vendor
          </Button>
        </form>
      </Form>
    </>
  );
}
