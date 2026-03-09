/**
 * Layout Settings Types
 * CMS-driven header and footer configuration
 */

// ─── Navigation Link ────────────────────────────────────────────────────────

export interface NavigationLink {
  id: string;
  label: string;
  url: string;
  openInNewTab?: boolean;
}

// ─── Social Link ─────────────────────────────────────────────────────────────

export type SocialPlatform =
  | "facebook"
  | "instagram"
  | "tiktok"
  | "twitter"
  | "youtube"
  | "pinterest"
  | "linkedin";

export interface SocialLink {
  id: string;
  platform: SocialPlatform;
  url: string;
}

// ─── Footer Link Group ──────────────────────────────────────────────────────

export interface FooterLinkGroup {
  id: string;
  title: string;
  links: Array<{
    id: string;
    label: string;
    url: string;
  }>;
}

// ─── Navbar Style ────────────────────────────────────────────────────────────

export type NavbarStyle = "default" | "editorial";

// ─── Footer Style ────────────────────────────────────────────────────────────

export type FooterStyle = "default" | "editorial";

// ─── Header Settings ────────────────────────────────────────────────────────

// ─── Logo Size Settings ─────────────────────────────────────────────────────

export interface LogoSizeSettings {
  desktopWidth: number;
  desktopMaxHeight: number;
  mobileWidth: number;
  mobileMaxHeight: number;
}

export const DEFAULT_LOGO_SIZE: LogoSizeSettings = {
  desktopWidth: 140,
  desktopMaxHeight: 48,
  mobileWidth: 100,
  mobileMaxHeight: 36,
};

export const DEFAULT_FOOTER_LOGO_SIZE: LogoSizeSettings = {
  desktopWidth: 120,
  desktopMaxHeight: 40,
  mobileWidth: 100,
  mobileMaxHeight: 36,
};

// ─── Header Settings ────────────────────────────────────────────────────────

export interface HeaderSettings {
  logoUrl: string;
  logoSize: LogoSizeSettings;
  logoText: string;
  tagline: string;
  announcementBarEnabled: boolean;
  announcementBarText: string;
  navigationLinks: NavigationLink[];
  navbarStyle: NavbarStyle;
}

// ─── Footer Settings ────────────────────────────────────────────────────────

export interface FooterSettings {
  logoUrl: string;
  logoText: string;
  logoSize: LogoSizeSettings;
  description: string;
  copyright: string;
  showNewsletter: boolean;
  footerStyle: FooterStyle;
  footerLinkGroups: FooterLinkGroup[];
  socialLinks: SocialLink[];
}

// ─── Combined Layout Settings ───────────────────────────────────────────────

export interface LayoutSettings {
  header: HeaderSettings;
  footer: FooterSettings;
}

// ─── Defaults ───────────────────────────────────────────────────────────────

export const DEFAULT_LAYOUT_SETTINGS: LayoutSettings = {
  header: {
    logoUrl: "",
    logoSize: { ...DEFAULT_LOGO_SIZE },
    logoText: "",
    tagline: "",
    announcementBarEnabled: false,
    announcementBarText: "",
    navigationLinks: [
      { id: "nav-collection", label: "Collection", url: "/shop" },
    ],
    navbarStyle: "default",
  },
  footer: {
    logoUrl: "",
    logoText: "",
    logoSize: { ...DEFAULT_FOOTER_LOGO_SIZE },
    description:
      "Sculptural piercings & curated jewelry — crafted with intention.",
    copyright: "",
    showNewsletter: true,
    footerStyle: "default",
    footerLinkGroups: [
      {
        id: "shop",
        title: "Shop",
        links: [
          { id: "all-products", label: "All Products", url: "/shop" },
          { id: "new-arrivals", label: "New Arrivals", url: "/shop" },
        ],
      },
      {
        id: "help",
        title: "Help",
        links: [
          { id: "contact", label: "Contact Us", url: "#" },
          { id: "faq", label: "FAQ", url: "#faq" },
          { id: "shipping", label: "Shipping & Returns", url: "#" },
          { id: "privacy", label: "Privacy Policy", url: "#" },
        ],
      },
    ],
    socialLinks: [
      { id: "facebook", platform: "facebook", url: "#" },
      { id: "instagram", platform: "instagram", url: "#" },
      { id: "tiktok", platform: "tiktok", url: "#" },
    ],
  },
};
