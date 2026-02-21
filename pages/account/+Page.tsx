import { useContext, useState, useEffect } from "react";
import { AuthContext } from "#root/context/AuthContext";
import { trpc } from "#root/shared/trpc/client";
import { toast } from "sonner";
import { navigate } from "vike/client/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Button } from "#root/components/ui/button";
import { Input } from "#root/components/ui/input";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  Shield,
  Pencil,
  X,
  Check,
} from "lucide-react";
import { Link } from "#root/components/utils/Link";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  phone: z
    .string()
    .regex(/^(\+201|01|00201)[0-2,5]{1}[0-9]{8}/, "Invalid phone number"),
});

type ProfileValues = z.infer<typeof profileSchema>;

export default function Page() {
  const { session, logout } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!session) {
      navigate("/login");
    }
  }, [session]);

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: session?.name || "",
      phone: session?.phone || "",
    },
  });

  // Sync form when session loads
  useEffect(() => {
    if (session) {
      form.reset({
        name: session.name || "",
        phone: session.phone || "",
      });
    }
  }, [session, form]);

  const onSubmit = async (values: ProfileValues) => {
    setIsSubmitting(true);
    try {
      const result = await trpc.auth.updateProfile.mutate(values);
      if (!result.success) {
        toast.error(result.error || "Failed to update profile");
        setIsSubmitting(false);
        return;
      }

      toast.success("Profile updated successfully");
      setIsEditing(false);
      // Reload to pick up the new session data
      window.location.reload();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.reset({
      name: session?.name || "",
      phone: session?.phone || "",
    });
    setIsEditing(false);
  };

  if (!session) {
    return null;
  }

  return (
    <div className='min-h-screen bg-[#F8F6F3]'>
      <div className='max-w-3xl mx-auto px-4 py-12 md:py-20'>
        {/* Header */}
        <div className='mb-10'>
          <h1 className='text-[28px] md:text-[36px] font-light tracking-[-0.02em] text-[#2B231D]'>
            My Account
          </h1>
          <p className='text-[14px] text-[#8B7E74] mt-2'>
            Manage your profile information and preferences
          </p>
        </div>

        {/* Profile Card */}
        <div className='bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] overflow-hidden mb-8'>
          <div className='flex items-center justify-between px-6 py-5 border-b border-[#F0EDE8]'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-full bg-[#2B231D] flex items-center justify-center'>
                <User className='w-5 h-5 text-[#F8F6F3]' />
              </div>
              <div>
                <h2 className='text-[16px] font-medium text-[#2B231D]'>
                  Profile Information
                </h2>
                <p className='text-[12px] text-[#8B7E74]'>
                  {session.role === "admin" ? "Administrator" : "Customer"}
                </p>
              </div>
            </div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className='flex items-center gap-1.5 text-[13px] text-[#8B7E74] hover:text-[#C4A574] transition-colors'>
                <Pencil className='w-3.5 h-3.5' />
                Edit
              </button>
            ) : (
              <button
                onClick={handleCancel}
                className='flex items-center gap-1.5 text-[13px] text-[#9D6B6B] hover:text-[#C4574A] transition-colors'>
                <X className='w-3.5 h-3.5' />
                Cancel
              </button>
            )}
          </div>

          {isEditing ? (
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='px-6 py-6 space-y-6'>
              <div>
                <label className='block text-[11px] uppercase tracking-[0.1em] text-[#8B7E74] mb-2 font-medium'>
                  Name
                </label>
                <Input
                  {...form.register("name")}
                  className='border border-[#D9D3CC] bg-white rounded-lg px-4 py-3 text-[15px] text-[#2B231D] focus:border-[#C4A574] focus:ring-1 focus:ring-[#C4A574] transition-all'
                  disabled={isSubmitting}
                />
                {form.formState.errors.name && (
                  <p className='text-[#9D6B6B] text-[11px] mt-1.5'>
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className='block text-[11px] uppercase tracking-[0.1em] text-[#8B7E74] mb-2 font-medium'>
                  Email
                </label>
                <div className='flex items-center gap-3 px-4 py-3 bg-[#F8F6F3] rounded-lg border border-[#F0EDE8]'>
                  <Mail className='w-4 h-4 text-[#8B7E74]' />
                  <span className='text-[15px] text-[#8B7E74]'>
                    {session.email}
                  </span>
                  <span className='text-[11px] text-[#BFB5AA] ml-auto'>
                    Read-only
                  </span>
                </div>
              </div>

              <div>
                <label className='block text-[11px] uppercase tracking-[0.1em] text-[#8B7E74] mb-2 font-medium'>
                  Phone
                </label>
                <Input
                  {...form.register("phone")}
                  className='border border-[#D9D3CC] bg-white rounded-lg px-4 py-3 text-[15px] text-[#2B231D] focus:border-[#C4A574] focus:ring-1 focus:ring-[#C4A574] transition-all'
                  disabled={isSubmitting}
                />
                {form.formState.errors.phone && (
                  <p className='text-[#9D6B6B] text-[11px] mt-1.5'>
                    {form.formState.errors.phone.message}
                  </p>
                )}
              </div>

              <Button
                type='submit'
                disabled={isSubmitting}
                className='bg-[#2B231D] hover:bg-[#3A3028] text-[#F8F6F3] font-normal text-[14px] py-6 px-8 rounded-xl transition-all'>
                <Check className='w-4 h-4 mr-2' />
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          ) : (
            <div className='px-6 py-6 space-y-5'>
              <div className='flex items-center gap-4'>
                <User className='w-4 h-4 text-[#8B7E74] shrink-0' />
                <div>
                  <p className='text-[11px] uppercase tracking-[0.1em] text-[#8B7E74] font-medium'>
                    Name
                  </p>
                  <p className='text-[15px] text-[#2B231D] mt-0.5'>
                    {session.name || "—"}
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-4'>
                <Mail className='w-4 h-4 text-[#8B7E74] shrink-0' />
                <div>
                  <p className='text-[11px] uppercase tracking-[0.1em] text-[#8B7E74] font-medium'>
                    Email
                  </p>
                  <p className='text-[15px] text-[#2B231D] mt-0.5'>
                    {session.email}
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-4'>
                <Phone className='w-4 h-4 text-[#8B7E74] shrink-0' />
                <div>
                  <p className='text-[11px] uppercase tracking-[0.1em] text-[#8B7E74] font-medium'>
                    Phone
                  </p>
                  <p className='text-[15px] text-[#2B231D] mt-0.5'>
                    {session.phone || "—"}
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-4'>
                <Shield className='w-4 h-4 text-[#8B7E74] shrink-0' />
                <div>
                  <p className='text-[11px] uppercase tracking-[0.1em] text-[#8B7E74] font-medium'>
                    Role
                  </p>
                  <p className='text-[15px] text-[#2B231D] mt-0.5 capitalize'>
                    {session.role}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className='bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] overflow-hidden'>
          <div className='px-6 py-5 border-b border-[#F0EDE8]'>
            <h2 className='text-[16px] font-medium text-[#2B231D]'>
              Quick Links
            </h2>
          </div>
          <div className='divide-y divide-[#F0EDE8]'>
            <Link
              href='/orders'
              className='flex items-center gap-4 px-6 py-4 hover:bg-[#F8F6F3] transition-colors'>
              <Package className='w-5 h-5 text-[#8B7E74]' />
              <div>
                <p className='text-[14px] text-[#2B231D]'>Order History</p>
                <p className='text-[12px] text-[#8B7E74]'>
                  View your past orders and track shipments
                </p>
              </div>
            </Link>
            <Link
              href='/forgot-password'
              className='flex items-center gap-4 px-6 py-4 hover:bg-[#F8F6F3] transition-colors'>
              <Shield className='w-5 h-5 text-[#8B7E74]' />
              <div>
                <p className='text-[14px] text-[#2B231D]'>Change Password</p>
                <p className='text-[12px] text-[#8B7E74]'>
                  Reset your password via email
                </p>
              </div>
            </Link>
            {session.role === "admin" && (
              <Link
                href='/dashboard'
                className='flex items-center gap-4 px-6 py-4 hover:bg-[#F8F6F3] transition-colors'>
                <MapPin className='w-5 h-5 text-[#8B7E74]' />
                <div>
                  <p className='text-[14px] text-[#2B231D]'>Dashboard</p>
                  <p className='text-[12px] text-[#8B7E74]'>
                    Access admin dashboard
                  </p>
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Logout button */}
        <div className='mt-8 text-center'>
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className='text-[13px] text-[#9D6B6B] hover:text-[#C4574A] transition-colors tracking-[0.04em]'>
            Sign out of your account
          </button>
        </div>
      </div>
    </div>
  );
}
