import { useState, useEffect } from "react";

// ─── Link Data (edit here) ────────────────────────────────────────────────────
// Each entry renders as a styled button. Add, remove, or reorder freely.

interface BrandLink {
  label: string;
  href: string;
  icon: (props: React.SVGAttributes<SVGSVGElement>) => React.ReactNode;
}

const BRAND_LINKS: BrandLink[] = [
  {
    label: "Shop",
    href: "https://perce-eg.com/",
    icon: (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" x2="21" y1="6" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/piercingsperce/",
    icon: (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/1HoGwkYpSK/?mibextid=wwXIfr",
    icon: (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@piercingsperce",
    icon: (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78 2.92 2.92 0 0 1 .88.13v-3.5a6.37 6.37 0 0 0-.88-.07 6.37 6.37 0 0 0 0 12.74 6.37 6.37 0 0 0 6.38-6.38V9.4a8.27 8.27 0 0 0 3.72.88V6.84a4.84 4.84 0 0 1-.01-.15z" />
      </svg>
    ),
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/201033036883",
    icon: (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
      </svg>
    ),
  },
];

const BRAND_NAME = "Percé";
const SUBTITLE = "Shop, follow, and connect";
const FOOTER_TEXT = `© ${new Date().getFullYear()} ${BRAND_NAME}`;

// ─── Component ────────────────────────────────────────────────────────────────

export default function Page() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Trigger entrance animation after mount
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 py-16 font-poppins selection:bg-white/20">
      {/* Content wrapper */}
      <div
        className={`w-full max-w-md flex flex-col items-center gap-10 transition-all duration-700 ease-out ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {/* Brand header */}
        <header className="flex flex-col items-center gap-3 text-center">
          <h1 className="text-white text-3xl sm:text-4xl font-light tracking-[0.25em] uppercase">
            {BRAND_NAME}
          </h1>
          <div className="w-8 h-px bg-white/30" aria-hidden="true" />
          <p className="text-white/50 text-sm tracking-[0.12em] font-light">
            {SUBTITLE}
          </p>
        </header>

        {/* Link stack */}
        <nav className="w-full flex flex-col gap-3" aria-label="Brand links">
          {BRAND_LINKS.map((link, i) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center gap-4 w-full px-6 py-4 rounded-sm border border-white/8 bg-white/3 text-white/80 transition-all duration-300 ease-out hover:bg-white/7 hover:border-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              style={{
                transitionDelay: mounted ? `${i * 60}ms` : "0ms",
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(12px)",
              }}
              aria-label={`${link.label} — opens in new tab`}
            >
              <span className="shrink-0 w-5 h-5 text-white/40 transition-colors duration-300 group-hover:text-white/70">
                {link.icon({ width: 20, height: 20 })}
              </span>
              <span className="text-sm tracking-[0.08em] font-light">
                {link.label}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ml-auto w-4 h-4 text-white/20 transition-all duration-300 group-hover:text-white/50 group-hover:translate-x-0.5"
                aria-hidden="true"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </a>
          ))}
        </nav>

        {/* Footer */}
        <footer className="pt-4 text-center">
          <p className="text-white/20 text-xs tracking-widest font-light">
            {FOOTER_TEXT}
          </p>
        </footer>
      </div>
    </div>
  );
}
