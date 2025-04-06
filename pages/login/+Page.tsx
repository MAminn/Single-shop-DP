import AnimatedContent from "#root/components/AnimatedContent.jsx";
import { Button } from "#root/components/ui/button.jsx";
import { trpc } from "#root/shared/trpc/client.js";
import { toast } from "sonner";
import { reload } from "vike/client/router";
import LoginForm, { type LoginOnSubmit } from "./components";

export default function Page() {
  const onSubmit: LoginOnSubmit = async (data) => {
    try {
      const loginResult = await trpc.auth.login.mutate(data);

      if (!loginResult.success) {
        toast.error(loginResult.error);
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
        console.error(err);
      });

      toast.success("Login successful");
    } catch (error) {
      toast.error(
        "Something went wrong, please refresh the page and try again."
      );
    }

    await reload();
  };

  return (
    <section className="w-full min-h-[90vh] flex justify-center items-center bg-[url(/assets/Women_s_banner.webp)]">
      <AnimatedContent
        distance={200}
        direction="vertical"
        reverse={false}
        config={{ tension: 60, friction: 30 }}
        initialOpacity={0}
        animateOpacity
        scale={1.5}
        threshold={0.2}
      >
        <div className="w-full sm:max-w-md">
          <div className="w-full h-full flex flex-col p-8 md:p-10 bg-white">
            <h1 className="text-2xl md:text-3xl text-center font-semibold mb-6">
              Log in for vendors!
            </h1>
              
              {/* Login form */}
            <div className="flex flex-col gap-4">
              <LoginForm onSubmit={onSubmit} />
            </div>
          </div>
          
        </div>
      </AnimatedContent>
    </section>
  );
}
