import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "#root/components/ui/input";
import { Link } from "#root/components/utils/Link";
import { authClient } from "#root/lib/auth-client.js";
import { toast } from "sonner";
import { useMinimalI18n } from "#root/lib/i18n/MinimalI18nContext";
import {
  minimalAuthT,
  type MinimalAuthKey,
} from "#root/lib/i18n/minimal-auth-translations";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password cannot be empty"),
});

type FormValues = z.infer<typeof formSchema>;

export function MinimalLoginPage() {
  const { locale } = useMinimalI18n();
  const t = useCallback(
    (key: MinimalAuthKey) => {
      const lang = locale === "ar" ? "ar" : "en";
      return minimalAuthT[lang][key] ?? key;
    },
    [locale],
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const result = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      });

      if (result.error) {
        const raw = result.error.message || "";
        const friendly =
          raw.toLowerCase().includes("invalid") || raw.toLowerCase().includes("password") || raw.toLowerCase().includes("credentials")
            ? "Incorrect email or password."
            : raw.toLowerCase().includes("not found") || raw.toLowerCase().includes("user")
            ? "No account found with that email."
            : "Login failed. Please try again.";
        toast.error(friendly);
        setIsSubmitting(false);
        return;
      }

      toast.success("Login successful");
      const role = (result.data?.user as { role?: string } | null)?.role;
      if (role === "admin") {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/";
      }
    } catch {
      toast.error("Something went wrong. Please refresh the page and try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <section className='min-h-screen flex items-center justify-center bg-white px-4 py-12'>
      <div className='w-full max-w-[420px]'>
        {/* Card */}
        <div className='border border-stone-200 bg-white p-8 sm:p-10'>
          {/* Header */}
          <div className='text-center mb-8'>
            <h1 className='text-2xl sm:text-[28px] font-light text-stone-900 tracking-tight mb-2'>
              {t("login.title")}
            </h1>
            <p className='text-sm text-stone-500'>{t("login.subtitle")}</p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} autoComplete='on' className='flex flex-col gap-6'>
            {/* Email */}
            <div>
              <label
                htmlFor='login-email'
                className='block text-xs uppercase tracking-widest text-stone-500 mb-2 font-medium'>
                {t("login.email")}
              </label>
              <Input
                {...form.register("email")}
                id='login-email'
                type='email'
                autoComplete='email'
                placeholder={t("login.email_placeholder")}
                className='border-0 border-b border-stone-300 bg-transparent rounded-none px-0 py-3 text-sm focus:outline-none focus:ring-0 focus:border-stone-900 transition-colors placeholder:text-stone-400 text-stone-900'
                disabled={isSubmitting}
              />
              {form.formState.errors.email && (
                <p className='text-red-500 text-xs mt-2'>
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor='login-password'
                className='block text-xs uppercase tracking-widest text-stone-500 mb-2 font-medium'>
                {t("login.password")}
              </label>
              <div className='relative'>
                <Input
                  {...form.register("password")}
                  id='login-password'
                  type={showPassword ? "text" : "password"}
                  autoComplete='current-password'
                  placeholder={t("login.password_placeholder")}
                  className='border-0 border-b border-stone-300 bg-transparent rounded-none px-0 py-3 pe-10 text-sm focus:outline-none focus:ring-0 focus:border-stone-900 transition-colors placeholder:text-stone-400 text-stone-900'
                  disabled={isSubmitting}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute end-0 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors'
                  disabled={isSubmitting}>
                  {showPassword ? (
                    <EyeOff className='w-4 h-4' />
                  ) : (
                    <Eye className='w-4 h-4' />
                  )}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className='text-red-500 text-xs mt-2'>
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type='submit'
              disabled={isSubmitting}
              className='w-full py-3 mt-2 bg-stone-900 text-white text-sm font-medium tracking-wide uppercase hover:bg-stone-800 transition-colors disabled:opacity-40'>
              {isSubmitting ? t("login.submitting") : t("login.submit")}
            </button>

            {/* Forgot password */}
            <Link
              href='/forgot-password'
              className='text-center text-xs text-stone-500 hover:text-stone-900 transition-colors'>
              {t("login.forgot_password")}
            </Link>

            {/* Divider */}
            <div className='flex items-center gap-3 mt-2'>
              <div className='h-px flex-1 bg-stone-200' />
              <span className='text-xs text-stone-400'>{t("login.no_account")}</span>
              <div className='h-px flex-1 bg-stone-200' />
            </div>

            <Link
              href='/register'
              className='text-center text-sm text-stone-900 hover:text-stone-600 transition-colors font-light -mt-2'>
              {t("login.create_account")}
            </Link>
          </form>
        </div>
      </div>
    </section>
  );
}
