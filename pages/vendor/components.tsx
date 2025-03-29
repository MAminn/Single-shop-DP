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

const vendorRegistrationFormSchema = z.object({
  vendor: z.object({
    name: z.string().nonempty().max(255),
    description: z.string().max(1000).optional(),
    logoId: z.string().uuid().optional(),
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
                <PasswordInput placeholder="Placeholder" {...field} />
              </FormControl>
              <FormDescription>Enter your password.</FormDescription>
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
              <FormDescription>Enter your phone number.</FormDescription>
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
          Submit
        </Button>
      </form>
    </Form>
  );
}
