import Navbar from "#root/components/globals/Navbar.jsx";
import { useEffect, useState } from "react";
import "./style.css";
import { Effect } from "effect";
import { validateSessionToken } from "#root/backend/auth/session.js";
import { trpc } from "#root/shared/trpc/client.js";

export default function LayoutDefault({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Content>{children}</Content>;
}
function Content({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<{
    user: {
      email: string;
      id: string;
      passwordDigest: string;
    } | null;
    session: {
      id: string;
      token: string;
      userId: string;
      expiresAt: string;
    } | null;
  } | null>(null);
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) return;

    trpc.auth.me.mutate({ token }).then((data) => {
      setSession(data ?? null);
    });
  }, []);

  return (
    <main
      id="page-content"
      className=" bg-background h-full text-foreground w-full font-poppins"
    >
      <Navbar session={session?.session} onLogOut={() => setSession(null)} />
      {children}
    </main>
  );
}
