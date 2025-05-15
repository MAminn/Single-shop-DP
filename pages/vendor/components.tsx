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
  user: z
    .object({
      email: z.string().email(),
      password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .max(255),
      confirmPassword: z.string(),
      name: z.string().nonempty().max(255),
      phone: z
        .string()
        .regex(/^(\+201|01|00201)[0-2,5]{1}[0-9]{8}/, "Invalid phone number"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
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
  const [socialLinks, setSocialLinks] = useState<
    Array<{ platform: string; url: string; id: string }>
  >([]);

  const form = useForm<VendorRegistrationFormSchema>({
    resolver: zodResolver(vendorRegistrationFormSchema),
    defaultValues: {
      vendor: {
        name: "",
        description: "",
        socialLinks: [],
      },
      user: {
        email: "",
        password: "",
        confirmPassword: "",
        name: "",
        phone: "",
      },
    },
  });

  const handleSubmit = async (data: VendorRegistrationFormSchema) => {
    setSubmitting(true);
    try {
      await onSubmit(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit form");
    } finally {
      setSubmitting(false);
    }
  };

  const [logoFile, setLogoFile] = useState<File | null>(null);

  const handleLogoUpload = async (file: File) => {
    setLogoFile(file);
    // In a real application, you would upload the file to your server
    // and get back an ID to use
    console.log("File selected:", file.name);
    // For now we'll mock this
    const mockLogoId = "00000000-0000-0000-0000-000000000000";
    form.setValue("vendor.logoId", mockLogoId);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6 mt-8"
      >
        <FormField
          control={form.control}
          name="vendor.name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vendor Name</FormLabel>
              <FormControl>
                <Input placeholder="Your shop or business name" {...field} />
              </FormControl>
              <FormDescription>The name of your business.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="vendor.description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your business..."
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>
                Tell us about your business and what you sell.
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
              className="cursor-pointer flex flex-col items-center"
            >
              {logoFile ? (
                <div className="mb-2">
                  <img
                    src={URL.createObjectURL(logoFile)}
                    alt="Logo preview"
                    className="w-32 h-32 object-contain"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 mb-2 bg-gray-200 rounded-full flex items-center justify-center">
                  <PlusCircle className="h-6 w-6 text-gray-500" />
                </div>
              )}
              <span className="text-sm text-gray-500">
                {logoFile ? "Change logo" : "Upload your logo"}
              </span>
              <span className="text-xs text-gray-400 mt-1">
                Max 2MB, recommended size: 200x200px
              </span>
            </label>
          </div>
        </div>

        <div className="space-y-3">
          <FormLabel>Social Media Links</FormLabel>
          <div className="space-y-2">
            {socialLinks.map((link, index) => (
              <div key={link.id} className="flex gap-2">
                <Input
                  placeholder="Platform (e.g. Facebook)"
                  value={link.platform}
                  onChange={(e) => {
                    const newLinks = [...socialLinks];
                    if (newLinks[index]) {
                      newLinks[index].platform = e.target.value;
                      setSocialLinks(newLinks);
                      form.setValue("vendor.socialLinks", newLinks);
                    }
                  }}
                  className="flex-1"
                />
                <Input
                  placeholder="URL"
                  value={link.url}
                  onChange={(e) => {
                    const newLinks = [...socialLinks];
                    if (newLinks[index]) {
                      newLinks[index].url = e.target.value;
                      setSocialLinks(newLinks);
                      form.setValue("vendor.socialLinks", newLinks);
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const newLinks = socialLinks.filter((_, i) => i !== index);
                    setSocialLinks(newLinks);
                    form.setValue("vendor.socialLinks", newLinks);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const newLink = {
                  platform: "",
                  url: "",
                  id: Math.random().toString(36).substring(2, 9),
                };
                setSocialLinks([...socialLinks, newLink]);
                form.setValue("vendor.socialLinks", [...socialLinks, newLink]);
              }}
              className="w-full"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Social Media Link
            </Button>
          </div>
        </div>

        <div className="border-t border-gray-200 my-6 pt-6">
          <h3 className="text-lg font-medium mb-4">Owner Information</h3>
        </div>

        <FormField
          control={form.control}
          name="user.name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Your full name" {...field} />
              </FormControl>
              <FormDescription>Your legal name.</FormDescription>
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
          name="user.confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder="********" {...field} />
              </FormControl>
              <FormDescription>
                Re-enter your password to confirm.
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
          {submitting ? "Submitting..." : "Register"}
        </Button>
      </form>
    </Form>
  );
}
