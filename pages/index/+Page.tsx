import Hero from "#root/components/Hero.jsx";
import { trpc } from "#root/shared/trpc/client.js";

export default function Page() {
  // const onSubmit = async (email: string, password: string) => {
  //   const token = await trpc.auth.login.mutate({ email, password });
  // };
  return (
    <main className="">
      <Hero lang="en" />
    </main>
  );
}
