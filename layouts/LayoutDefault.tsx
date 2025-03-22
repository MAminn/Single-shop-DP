import Navbar from "#root/components/globals/Navbar.jsx";
import { useEffect, useState } from "react";
import "./style.css";
import { trpc } from "#root/shared/trpc/client.js";
import { toast, Toaster } from "sonner";
import type { ClientSession } from "#root/backend/auth/shared/entities.js";
import { usePageContext } from "vike-react/usePageContext";

export default function LayoutDefault({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Content>{children}</Content>;
}
function Content({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<ClientSession | null>(null);
  const pageContext = usePageContext();

  useEffect(() => {
    if (pageContext.clientSession) {
      setSession(pageContext.clientSession);
    }
  }, [pageContext]);

  const logout = async () => {
    if (!session) return;
    try {
      await trpc.auth.logout.mutate({
        token: session.token,
      });
      await fetch("/api/auth/remove-token", {
        method: "DELETE",
      });
    } catch (err) {
      toast.error(err);
    }

    setSession(null);
  };

  const isDashboardRoute = pageContext.urlPathname.startsWith("/dashboard");

  return (
    <main
      id="page-content"
      className=" bg-background h-full text-foreground w-full font-poppins"
    >
      {!isDashboardRoute && (
        <Navbar lang="en" session={session} onLogOut={logout} />
      )}
      {children}
      <Toaster />
    </main>
  );
}
