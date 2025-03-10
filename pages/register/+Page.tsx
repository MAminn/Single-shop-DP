import AnimatedContent from "#root/components/AnimatedContent.jsx";
import { Button } from "#root/components/ui/button.jsx";

export default function Page() {
  return (
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
      <section className="w-full h-full flex justify-center items-center">
        <div className="w-full lg:w-[900px] gap-8 h-[700px] mt-12 bg-white rounded-3xl flex flex-col lg:flex-row justify-around items-start">
          <div className="w-full h-full px-4 pb-12 lg:py-12 lg:pl-8 flex flex-col gap-16 order-2 lg:order-1">
            <h1 className="text-2xl md:text-4xl text-center font-semibold mb-6 mt-10">
              Register An Account
            </h1>
            {/* OAuth divs */}
            <div className="flex gap-4 justify-around items-center flex-wrap">
              <h1 className="font-semibold">Register With:</h1>
              <div className="flex justify-center items-center gap-4 flex-wrap">
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
              <form className="flex flex-col gap-4">
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
                <input
                  type="password"
                  name="password"
                  placeholder="Repeat Password"
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent-lb"
                />
                
                <Button
                  type="submit"
                  className="bg-accent-lb text-white py-2 rounded-lg hover:bg-[#021E43] transition-all duration-300"
                >
                  Register
                </Button>
              </form>
            </div>
          </div>
          <div className="w-full h-full order-1 lg:order-2">
            <img
              src="/assets/Women_s_banner.png"
              className="w-full h-full object-cover object-center bg-top lg:rounded-tr-3xl lg:rounded-br-3xl"
              alt=""
            />
          </div>
        </div>
      </section>
    </AnimatedContent>
  );
}
