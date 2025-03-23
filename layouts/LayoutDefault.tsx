import Navbar from "#root/components/globals/Navbar.jsx";
import { useEffect, useState } from "react";
import "./style.css";
import { trpc } from "#root/shared/trpc/client.js";
import { toast, Toaster } from "sonner";
import type { ClientSession } from "#root/backend/auth/shared/entities.js";
import { usePageContext } from "vike-react/usePageContext";
import { TRPCClientError } from "@trpc/client";
import { AuthContext } from "#root/context/AuthContext.js";
import { CartProvider } from "#root/lib/context/CartContext";
import { Toaster as ShadcnToaster } from "#root/components/ui/toaster";

export default function LayoutDefault({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Content>{children}</Content>;
}

function Content({ children }: { children: React.ReactNode }) {
  const pageContext = usePageContext();
  const [session, setSession] = useState<ClientSession | null>(
    pageContext.clientSession ?? null
  );

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
      await fetch("/api/auth/token", {
        method: "DELETE",
      });
    } catch (err) {
      if (err instanceof TRPCClientError) {
        toast.error(err.message);
      } else {
        toast.error(
          "Something went wrong, please refresh the page and try again."
        );
      }
    }

    setSession(null);
  };

  const isDashboardRoute = pageContext.urlPathname.startsWith("/dashboard");

  return (
    <AuthContext.Provider value={{ session, logout }}>
      <CartProvider>
        <main
          id="page-content"
          className="bg-background h-full text-foreground w-full font-poppins"
        >
          {!isDashboardRoute && <Navbar lang="en" />}
          {children}
          <Toaster />
          <ShadcnToaster />
        </main>
      </CartProvider>
    </AuthContext.Provider>
  );
}
