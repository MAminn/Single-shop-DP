import { trpc } from "#root/shared/trpc/client";
import { useState } from "react";
import RegisterFormSchema, {
  type VendorRegistrationFormSchema,
} from "./components";
import { TRPCClientError } from "@trpc/client";
import { CheckIcon } from "lucide-react";

export default function VendorRegistrationPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);
  const onSubmit = async (values: VendorRegistrationFormSchema) => {
    try {
      const result = await trpc.vendor.register.mutate(values);

      if (!result.success) {
        setError(result.error);
        return;
      }

      setSuccess(true);
    } catch (err) {
      if (err instanceof TRPCClientError) {
        setError(err.message);
        return;
      }
      setError("Something went wrong, please try again.");
    }
  };

  if (success) {
    return (
      <section className="max-w-3xl mx-auto py-10">
        <CheckIcon className="w-20 h-20 bg-primary text-primary-foreground rounded-full p-4 mx-auto" />
        <h1 className="text-2xl font-bold mb-2">Vendor Registration</h1>
        <p>Thank you for registering with us. We will get back to you soon.</p>
      </section>
    );
  }

  return (
    <section className="max-w-3xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-2">Vendor Registration</h1>
      <p>Fill the form below and we will get back to you.</p>
      <RegisterFormSchema onSubmit={onSubmit} />
      {error && <p className="text-red-500">{error}</p>}
    </section>
  );
}
