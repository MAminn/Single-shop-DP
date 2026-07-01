import defaultFaviconUrl from "../assets/favicon.svg";
import { useEffect } from "react";
import { usePageContext } from "vike-react/usePageContext";
import type { LayoutSettings } from "#root/shared/types/layout-settings";

export default function HeadDefault() {
  const pageContext = usePageContext();
  const layoutSettings = pageContext.layoutSettingsData as LayoutSettings | undefined;

  // Dynamic favicon from layout settings
  const faviconUrl = layoutSettings?.faviconUrl || defaultFaviconUrl;
  const faviconType = layoutSettings?.faviconUrl
    ? (layoutSettings.faviconUrl.endsWith(".svg") ? "image/svg+xml"
      : layoutSettings.faviconUrl.endsWith(".png") ? "image/png"
      : layoutSettings.faviconUrl.endsWith(".ico") ? "image/x-icon"
      : "image/png")
    : "image/svg+xml";

  // Dynamic document title from layout settings (client-side only)
  useEffect(() => {
    if (layoutSettings?.siteTitle) {
      document.title = layoutSettings.siteTitle;
    }
  }, [layoutSettings?.siteTitle]);

  // Font loading script to replace the onLoad attribute
  useEffect(() => {
    const fontLink = document.querySelector("link[data-font-preload]");
    if (fontLink) {
      fontLink.setAttribute("rel", "stylesheet");
    }
  }, []);

  return (
    <>
      {/* Basic favicon */}
      <link rel='icon' href={faviconUrl} type={faviconType} />

      {/* Blocking locale/dir sync — runs before first paint to prevent LTR→RTL flicker */}
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){try{var l=localStorage.getItem("minimal-template-locale");if(l==="ar"){document.documentElement.setAttribute("dir","rtl");document.documentElement.setAttribute("lang","ar")}if(l&&document.cookie.indexOf("minimal-locale=")===-1){document.cookie="minimal-locale="+l+";path=/;max-age=31536000;SameSite=Lax"}}catch(e){}})();`,
        }}
      />

      {/* Preconnect to critical domains */}
      <link rel='preconnect' href='https://fonts.googleapis.com' />
      <link
        rel='preconnect'
        href='https://fonts.gstatic.com'
        crossOrigin='anonymous'
      />

      {/* Preload critical assets - only preload landing.webp */}
      <link
        rel='preload'
        href='/assets/landing.webp'
        as='image'
        type='image/webp'
        fetchPriority='high'
      />

      {/* Font display optimization with React-friendly approach */}
      <link
        data-font-preload
        rel='preload'
        href='https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap'
        as='style'
      />

      {/* Meta tags for performance */}
      <meta
        name='viewport'
        content='width=device-width, initial-scale=1.0, viewport-fit=cover'
      />
      <meta httpEquiv='Content-Type' content='text/html; charset=utf-8' />

      {/* Core Web Vitals hints */}
      <meta name='theme-color' content='#ffffff' />
      <meta name='color-scheme' content='light' />

      {/* Critical CSS as separate style tags */}
      <style>{`
        /* Critical CSS for Largest Contentful Paint */
        body { margin: 0; font-family: 'Poppins', sans-serif; }
        .hero-section { position: relative; height: 90vh; overflow: hidden; }
        .hero-content { position: relative; z-index: 9; }
        .hero-bg { 
          position: absolute; 
          inset: 0; 
          background-position: center;
          background-size: cover; 
        }
      `}</style>

      <style>{`
        /* Prevent layout shifts */
        img { display: block; max-width: 100%; }
        
        /* Responsive containers for mobile first approach */
        .container { 
          width: 100%; 
          padding-right: 1rem; 
          padding-left: 1rem; 
          margin-right: auto; 
          margin-left: auto; 
        }
        @media (min-width: 640px) { 
          .container { max-width: 640px; } 
        }
        @media (min-width: 768px) { 
          .container { max-width: 768px; } 
        }
        @media (min-width: 1024px) { 
          .container { max-width: 1024px; }
        }
        @media (min-width: 1280px) { 
          .container { max-width: 1280px; }
        }
      `}</style>

      <style>{`
        /* Use @font-display:swap for better performance */
        @font-face {
          font-family: 'Poppins';
          font-style: normal;
          font-weight: 400;
          font-display: swap;
          src: url(https://fonts.gstatic.com/s/poppins/v20/pxiEyp8kv8JHgFVrJJfecg.woff2) format('woff2');
        }
      `}</style>
    </>
  );
}
