import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, CheckCircle } from "lucide-react";
import { Input } from "#root/components/ui/input";
import { Button } from "#root/components/ui/button";
import { trpc } from "#root/shared/trpc/client";
import { toast } from "sonner";
import { useMinimalI18n } from "#root/lib/i18n/MinimalI18nContext";
import { useLayoutSettings } from "#root/frontend/contexts/LayoutSettingsContext";

const formSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    phone: z
      .string()
      .regex(/^(\+201|01|00201)[0-2,5]{1}[0-9]{8}/, "Invalid Egyptian phone (+201XXXXXXXXX)"),
    password: z.string().min(8, "Min 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof formSchema>;

export function MinimalComingSoonPage() {
  const { t } = useMinimalI18n();
  const layoutSettings = useLayoutSettings();
  const storeName = layoutSettings.siteTitle || "Our Store";

  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", phone: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      await trpc.auth.register.mutate({ ...values, role: "user" });
      setDone(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="max-w-md w-full text-center space-y-6 py-16">
          <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-stone-700" />
          </div>
          <h1 className="text-2xl font-light tracking-tight text-stone-900">You're on the list!</h1>
          <p className="text-sm text-stone-500 leading-relaxed max-w-xs mx-auto">
            We've received your registration. We'll send you an email as soon as {storeName} is fully launched.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Hero text */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        <p className="text-xs tracking-[0.25em] uppercase text-stone-400 mb-4">Coming Soon</p>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight text-stone-900 mb-4">
          {storeName}
        </h1>
        <p className="text-base text-stone-500 max-w-sm leading-relaxed mb-12">
          We're putting the finishing touches on something special. Register below to be the first to know when we launch.
        </p>

        {/* Register form */}
        <div className="w-full max-w-[460px] border border-stone-200 bg-white p-8 sm:p-10 text-left">
          <h2 className="text-lg font-light tracking-wide text-stone-900 mb-1">Get early access</h2>
          <p className="text-xs text-stone-400 mb-7">Create your account now — be the first in line.</p>

          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-[11px] uppercase tracking-widest text-stone-400 mb-2">Full Name</label>
                <Input
                  {...form.register("name")}
                  placeholder="Jane Doe"
                  disabled={submitting}
                  className="border-0 border-b border-stone-300 rounded-none px-0 py-2.5 text-sm bg-transparent focus-visible:ring-0 focus-visible:border-stone-900 placeholder:text-stone-300"
                />
                {form.formState.errors.name && (
                  <p className="text-red-500 text-xs mt-1">{form.formState.errors.name.message}</p>
                )}
              </div>
              {/* Email */}
              <div>
                <label className="block text-[11px] uppercase tracking-widest text-stone-400 mb-2">Email</label>
                <Input
                  {...form.register("email")}
                  type="email"
                  placeholder="you@email.com"
                  disabled={submitting}
                  className="border-0 border-b border-stone-300 rounded-none px-0 py-2.5 text-sm bg-transparent focus-visible:ring-0 focus-visible:border-stone-900 placeholder:text-stone-300"
                />
                {form.formState.errors.email && (
                  <p className="text-red-500 text-xs mt-1">{form.formState.errors.email.message}</p>
                )}
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[11px] uppercase tracking-widest text-stone-400 mb-2">Phone</label>
              <Input
                {...form.register("phone")}
                type="tel"
                placeholder="+201XXXXXXXXX"
                disabled={submitting}
                className="border-0 border-b border-stone-300 rounded-none px-0 py-2.5 text-sm bg-transparent focus-visible:ring-0 focus-visible:border-stone-900 placeholder:text-stone-300"
              />
              {form.formState.errors.phone && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.phone.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Password */}
              <div>
                <label className="block text-[11px] uppercase tracking-widest text-stone-400 mb-2">Password</label>
                <div className="relative">
                  <Input
                    {...form.register("password")}
                    type={showPw ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    disabled={submitting}
                    className="border-0 border-b border-stone-300 rounded-none px-0 py-2.5 text-sm bg-transparent focus-visible:ring-0 focus-visible:border-stone-900 placeholder:text-stone-300 pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-red-500 text-xs mt-1">{form.formState.errors.password.message}</p>
                )}
              </div>
              {/* Confirm */}
              <div>
                <label className="block text-[11px] uppercase tracking-widest text-stone-400 mb-2">Confirm Password</label>
                <div className="relative">
                  <Input
                    {...form.register("confirmPassword")}
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repeat password"
                    disabled={submitting}
                    className="border-0 border-b border-stone-300 rounded-none px-0 py-2.5 text-sm bg-transparent focus-visible:ring-0 focus-visible:border-stone-900 placeholder:text-stone-300 pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {form.formState.errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{form.formState.errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-stone-900 hover:bg-stone-800 text-white text-xs tracking-widest uppercase py-3 rounded-none h-auto mt-1">
              {submitting ? "Registering…" : "Notify Me at Launch"}
            </Button>
          </form>
        </div>
      </div>

      {/* Footer strip */}
      <div className="border-t border-stone-100 py-4 text-center">
        <p className="text-xs text-stone-400">© {new Date().getFullYear()} {storeName}</p>
      </div>
    </div>
  );
}
