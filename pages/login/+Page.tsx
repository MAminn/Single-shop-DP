import { Button } from "#root/components/ui/button.jsx";
import { trpc } from "#root/shared/trpc/client.js";
import { navigate, reload } from "vike/client/router";

export default function Page() {
  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const token = await trpc.auth.login.mutate({ email, password });
      localStorage.setItem("token", token);
      console.log("Login successful, token stored in localStorage");
    } catch (error) {
      console.error("Login failed:", error);
    }

    await reload();
  };

  return (
    <section className="w-full h-full flex justify-center items-center">
      <div className="w-[900px] gap-8 h-[700px] mt-12 bg-white rounded-3xl flex justify-around items-start">
        <div className="w-full h-full py-12 pl-8 flex flex-col gap-16">
          <h1 className="text-2xl md:text-4xl text-center font-semibold mb-6 mt-10">
            Account Login
          </h1>
          {/* OAuth divs */}
          <div className="flex gap-4 justify-around items-center">
            <h1 className="font-semibold">Login With:</h1>
            <div className="flex justify-center items-center gap-4">
              <div className="header bg-background px-6 py-3 rounded-3xl hover:bg-gray-200 transition-all duration-300 cursor-pointer">
                Google
              </div>
              <div className="header bg-background px-6 py-3 rounded-3xl hover:bg-gray-200 transition-all duration-300 cursor-pointer">
                Github
              </div>
            </div>
          </div>
          {/* Login form */}
          <div className="flex flex-col gap-4">
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent-lb"
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent-lb"
              />
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="accent-accent-lb" />
                  <p className="text-sm">Remember me</p>
                </div>
                <p className="text-sm text-accent-lb cursor-pointer">
                  Forgot Password?
                </p>
              </div>
              <Button
                type="submit"
                className="bg-accent-lb text-white py-2 rounded-lg hover:bg-[#021E43] transition-all duration-300"
              >
                Login
              </Button>
            </form>
          </div>
        </div>
        <div className="w-full h-full">
          <img
            src="/assets/Women_s_banner.png"
            className="w-full h-full object-cover object-center bg-top rounded-tr-3xl rounded-br-3xl"
            alt=""
          />
        </div>
      </div>
    </section>
  );
}
