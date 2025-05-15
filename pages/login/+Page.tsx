import AnimatedContent from "#root/components/AnimatedContent";
import { Button } from "#root/components/ui/button";
import { trpc } from "#root/shared/trpc/client";
import { toast } from "sonner";
import { reload } from "vike/client/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Input } from "#root/components/ui/input";
import { Link } from "#root/components/Link";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password cannot be empty"),
});

type FormValues = z.infer<typeof formSchema>;

export default function Page() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const loginResult = await trpc.auth.login.mutate(values);

      if (!loginResult.success) {
        toast.error(loginResult.error);
        setIsSubmitting(false);
        return;
      }

      const token = loginResult.result;

      await fetch("/api/auth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      }).catch((err) => {
        console.error("Error setting auth token cookie:", err);
      });

      toast.success("Login successful");
      await reload();
    } catch (error) {
      toast.error(
        "Something went wrong, please refresh the page and try again."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <section className="w-full min-h-[92vh] flex justify-center items-center bg-[url('/assets/Women_s_banner.webp')] bg-cover bg-center py-12 md:py-24 px-3 md:px-8">
      <div className="w-full lg:max-w-lg gap-8 h-auto min-h-[400px] bg-white rounded-3xl flex flex-col justify-around items-start p-8 md:p-10 shadow-lg">
        <h1 className="text-2xl md:text-4xl text-center font-semibold mb-6 w-full">
          Login For Vendors!
        </h1>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6 w-full"
        >
          <div className="relative">
            <span className="absolute left-3 top-0 bottom-0 flex items-center text-gray-400">
              <Mail className="h-5 w-5" />
            </span>
            <Input
              {...form.register("email")}
              type="email"
              placeholder="Email"
              className="border border-gray-300 rounded-lg pl-10 pr-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-accent-lb"
              disabled={isSubmitting}
            />
            {form.formState.errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="relative">
            <span className="absolute left-3 top-0 bottom-0 flex items-center text-gray-400">
              <Lock className="h-5 w-5" />
            </span>
            <Input
              {...form.register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="border border-gray-300 rounded-lg pl-10 pr-12 py-3 w-full focus:outline-none focus:ring-2 focus:ring-accent-lb"
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              disabled={isSubmitting}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
            {form.formState.errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <Button
            className="w-full bg-accent-lb hover:bg-accent-lb/90 mt-4"
            size={"lg"}
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </Button>

          <p className="text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link href="/register" className="text-accent-lb">
              Register
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}
