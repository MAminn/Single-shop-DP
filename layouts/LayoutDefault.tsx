import Navbar from "#root/components/globals/Navbar.jsx";
import { EditorialNavbar } from "#root/components/template-system/editorial/EditorialNavbar";
import { Footer } from "#root/components/globals/Footer";
import { useEffect, useState, memo } from "react";
import "./style.css";
import { trpc } from "#root/shared/trpc/client.js";
import { toast, Toaster } from "sonner";
import type { ClientSession } from "#root/backend/auth/shared/entities.js";
import { usePageContext } from "vike-react/usePageContext";
import { TRPCClientError } from "@trpc/client";
import { AuthContext } from "#root/context/AuthContext.js";
import { CartProvider } from "#root/lib/context/CartContext";
import { TemplateProvider } from "#root/frontend/contexts/TemplateContext";
import { TrackingProvider } from "#root/frontend/contexts/TrackingContext";
import { Toaster as ShadcnToaster } from "#root/components/ui/toaster";
import {
  NavbarModeContext,
  getNavbarMode,
} from "#root/components/globals/NavbarContext";
import { LayoutSettingsContext } from "#root/frontend/contexts/LayoutSettingsContext";
import type { LayoutSettings } from "#root/shared/types/layout-settings";
import { DEFAULT_LAYOUT_SETTINGS } from "#root/shared/types/layout-settings";
import { getStoreOwnerId } from "#root/shared/config/store";

// Memoized Content component to prevent unnecessary re-renders
const Content = memo(({ children }: { children: React.ReactNode }) => {
  const pageContext = usePageContext();
  const [session, setSession] = useState<ClientSession | null>(
    pageContext.clientSession ?? null,
  );
  const [layoutSettings, setLayoutSettings] = useState<LayoutSettings>(
    DEFAULT_LAYOUT_SETTINGS,
  );

  // Fetch CMS layout settings once on mount
  useEffect(() => {
    trpc.layout.getSettings
      .query({ merchantId: getStoreOwnerId() })
      .then((res) => {
        if (res.success && res.result) {
          setLayoutSettings(res.result);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch layout settings:", err);
      });
  }, []);

  // PRIMARY: Sync session from SSR page context on navigation
  useEffect(() => {
    if (pageContext.clientSession) {
      setSession(pageContext.clientSession);
    }
  }, [pageContext]);

  // FALLBACK: If SSR didn't provide a session (proxy hiccup, CDN cache, etc.),
  // ask the server directly — the httpOnly cookie is still sent with fetch.
  useEffect(() => {
    if (session) return; // already have a session, skip
    let cancelled = false;

    fetch("/api/auth/me", { credentials: "same-origin" })
      .then((r) => {
        if (!r.ok) return null;
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        if (data?.success && data.result) {
          // Ensure expiresAt is a Date object on the client
          const restored: ClientSession = {
            ...data.result,
            expiresAt:
              data.result.expiresAt instanceof Date
                ? data.result.expiresAt
                : new Date(data.result.expiresAt),
          };
          setSession(restored);
        }
      })
      .catch(() => {
        /* silent — user is simply not logged in */
      });

    return () => {
      cancelled = true;
    };
  }, []); // runs once on mount

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
          "Something went wrong, please refresh the page and try again.",
        );
      }
    }

    setSession(null);
  };

  const isDashboardRoute = pageContext.urlPathname.startsWith("/dashboard");
  const navbarMode = getNavbarMode(pageContext.urlPathname);

  return (
    <AuthContext.Provider value={{ session, logout }}>
      <CartProvider>
        <TemplateProvider>
          <LayoutSettingsContext.Provider value={layoutSettings}>
            <NavbarModeContext.Provider value={navbarMode}>
              <TrackingProvider>
                <main
                  id='page-content'
                  className='bg-background h-full text-foreground w-full font-poppins'>
                  {!isDashboardRoute && (
                    <div id='global-navbar'>
                      {layoutSettings.header.navbarStyle === "editorial" ? (
                        <EditorialNavbar />
                      ) : (
                        <Navbar lang='en' />
                      )}
                    </div>
                  )}
                  {children}
                  {!isDashboardRoute && (
                    <div id='global-footer'>
                      <Footer />
                    </div>
                  )}
                  <Toaster />
                  <ShadcnToaster />
                  {/* Phase 3 — page-transition overlay (CSS-only, SSR-inert) */}
                  <div
                    id='page-transition-overlay'
                    aria-hidden='true'
                    className='page-transition-overlay'
                  />
                </main>
              </TrackingProvider>
            </NavbarModeContext.Provider>
          </LayoutSettingsContext.Provider>
        </TemplateProvider>
      </CartProvider>
    </AuthContext.Provider>
  );
});

// Display name for the memoized component
Content.displayName = "Content";

export default function LayoutDefault({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Content>{children}</Content>;
}
