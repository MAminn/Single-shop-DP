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

const vendorRegistrationFormSchema = z.object({
  vendor: z.object({
    name: z.string().nonempty().max(255),
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

  const form = useForm<z.infer<typeof vendorRegistrationFormSchema>>({
    resolver: zodResolver(vendorRegistrationFormSchema),
    disabled: submitting,
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (values) => {
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
