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
    <section className="w-full min-h-[90vh] flex justify-center items-center bg-[url(/assets/Women_s_banner.png)]">
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
              Log in to your account
            </h1>
            {/* OAuth divs */}
            {/* <div className="flex gap-4 justify-around items-center flex-wrap">
              <h1 className="font-semibold">Login With:</h1>
              <div className="flex justify-center items-center gap-4 flex-wrap">
                <div className="header bg-background px-6 py-3 rounded-3xl hover:bg-gray-200 transition-all duration-300 cursor-pointer">
                  Google
                </div>
              </div>
            </div> */}
            {/* Login form */}
            <div className="flex flex-col gap-4">
              <LoginForm onSubmit={onSubmit} />
            </div>
          </div>
          {/* <div className="w-full h-full order-1 lg:order-2">
            <img
              src="/assets/Women_s_banner.png"
              className="w-full h-full object-cover object-center bg-top lg:rounded-tr-3xl lg:rounded-br-3xl"
              alt=""
            />
          </div> */}
        </div>
      </AnimatedContent>
    </section>
  );
}
