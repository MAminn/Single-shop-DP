import AnimatedContent from "#root/components/utils/AnimatedContent";
import { Button } from "#root/components/ui/button.jsx";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "#root/shared/trpc/client";
import { toast } from "sonner";
import { navigate } from "vike/client/router";
import {
  CheckCircle,
  Eye,
  EyeOff,
  Mail,
  Phone,
  User,
  UserPlus,
} from "lucide-react";
import { Link } from "#root/components/utils/Link";

const formSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    phone: z
      .string()
      .regex(/^(\+201|01|00201)[0-2,5]{1}[0-9]{8}/, "Invalid phone number"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof formSchema>;

export default function Page() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);

    try {
      await trpc.auth.register.mutate({
        name: values.name,
        email: values.email,
        phone: values.phone,
        password: values.password,
        confirmPassword: values.confirmPassword,
        role: "user",
      });

      setIsRegistered(true);
      toast.success(
        "Registration successful! Please check your email to verify your account."
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred during registration";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isRegistered) {
    return (
      <AnimatedContent
        distance={100}
        direction='vertical'
        reverse={false}
        config={{ tension: 60, friction: 30 }}
        initialOpacity={0}
        animateOpacity
        scale={1}
        threshold={0.1}>
        <div className='max-w-md mx-auto my-20 px-6 py-10 bg-white rounded-lg shadow-md text-center'>
          <CheckCircle className='h-16 w-16 text-green-500 mx-auto mb-6' />
          <h1 className='text-2xl font-bold text-center text-[#1B4571] mb-4'>
            Registration Successful!
          </h1>
          <p className='text-gray-600 mb-6'>
            Please check your email to verify your account. Once verified, you
            can log in to access all features of Lebsy.
          </p>
          <Link
            href='/login'
            className='bg-[#1B4571] hover:bg-[#1B4571]/90 py-2 px-6'>
            Go to Login
          </Link>
        </div>
      </AnimatedContent>
    );
  }

  return (
    <AnimatedContent
      distance={200}
      direction='vertical'
      reverse={false}
      config={{ tension: 60, friction: 30 }}
      initialOpacity={0}
      animateOpacity
      scale={1.5}
      threshold={0.2}>
      <section className='w-full h-full flex justify-center items-center'>
        <div className='w-full lg:max-w-xl gap-8 h-auto min-h-[700px] mt-12 bg-white rounded-3xl flex flex-col lg:flex-row justify-around items-start'>
          <div className='w-full h-full px-4 pb-12 lg:py-12 lg:pl-8 flex flex-col gap-8 order-2 lg:order-1'>
            <h1 className='text-2xl md:text-4xl text-center font-semibold mb-6 mt-10'>
              Register An Account
            </h1>

            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='flex flex-col gap-4'>
              <div className='relative'>
                <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'>
                  <User className='h-5 w-5' />
                </span>
                <input
                  {...form.register("name")}
                  type='text'
                  placeholder='Full Name'
                  className='border border-gray-300 rounded-lg pl-10 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#1B4571]'
                />
                {form.formState.errors.name && (
                  <p className='text-red-500 text-sm mt-1'>
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className='relative'>
                <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'>
                  <Mail className='h-5 w-5' />
                </span>
                <input
                  {...form.register("email")}
                  type='email'
                  placeholder='Email'
                  className='border border-gray-300 rounded-lg pl-10 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#1B4571]'
                />
                {form.formState.errors.email && (
                  <p className='text-red-500 text-sm mt-1'>
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className='relative'>
                <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'>
                  <Phone className='h-5 w-5' />
                </span>
                <input
                  {...form.register("phone")}
                  type='tel'
                  placeholder='Phone (+201xxxxxxxxx or 01xxxxxxxxx)'
                  className='border border-gray-300 rounded-lg pl-10 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#1B4571]'
                />
                {form.formState.errors.phone && (
                  <p className='text-red-500 text-sm mt-1'>
                    {form.formState.errors.phone.message}
                  </p>
                )}
              </div>

              <div className='relative'>
                <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'>
                  <User className='h-5 w-5' />
                </span>
                <input
                  {...form.register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder='Password'
                  className='border border-gray-300 rounded-lg pl-10 pr-12 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#1B4571]'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400'>
                  {showPassword ? (
                    <EyeOff className='h-5 w-5' />
                  ) : (
                    <Eye className='h-5 w-5' />
                  )}
                </button>
                {form.formState.errors.password && (
                  <p className='text-red-500 text-sm mt-1'>
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className='relative'>
                <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'>
                  <User className='h-5 w-5' />
                </span>
                <input
                  {...form.register("confirmPassword")}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder='Confirm Password'
                  className='border border-gray-300 rounded-lg pl-10 pr-12 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#1B4571]'
                />
                <button
                  type='button'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400'>
                  {showConfirmPassword ? (
                    <EyeOff className='h-5 w-5' />
                  ) : (
                    <Eye className='h-5 w-5' />
                  )}
                </button>
                {form.formState.errors.confirmPassword && (
                  <p className='text-red-500 text-sm mt-1'>
                    {form.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type='submit'
                disabled={isSubmitting}
                className='w-full bg-[#1B4571] hover:bg-[#1B4571]/90 text-white py-2 rounded-lg flex items-center justify-center gap-2 mt-4'>
                {isSubmitting ? (
                  "Registering..."
                ) : (
                  <>
                    <UserPlus className='h-5 w-5' />
                    <span>Register</span>
                  </>
                )}
              </Button>

              <p className='text-sm text-center mt-4'>
                Already have an account?{" "}
                <a href='/login' className='text-[#1B4571] hover:underline'>
                  Login here
                </a>
              </p>
            </form>
          </div>
        </div>
      </section>
    </AnimatedContent>
  );
}
