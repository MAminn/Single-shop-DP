/**
 * Homepage Content Management Schema
 *
 * This file defines the content structure for the homepage that merchants can edit.
 * Layout and styling are NOT part of this schema - only editable content.
 */

/**
 * Meta information for SEO and page head
 */
export interface HomepageMetaContent {
  enabled: boolean;
  pageTitle: string;
  pageDescription: string;
}

/**
 * Hero section content
 */
export interface HomepageHeroContent {
  enabled: boolean;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage?: string;
}

/**
 * Promotional banner content
 */
export interface HomepagePromoBannerContent {
  enabled: boolean;
  text: string;
  linkText?: string;
  linkUrl?: string;
}

/**
 * Icon types for value propositions
 */
export enum ValuePropIconType {
  SHOPPING = "shopping",
  SHIPPING = "shipping",
  SECURITY = "security",
  SUPPORT = "support",
  QUALITY = "quality",
  RETURNS = "returns",
}

/**
 * Single value proposition item
 */
export interface ValuePropItem {
  icon: ValuePropIconType;
  title: string;
  description: string;
}

/**
 * Value propositions section content
 */
export interface HomepageValuePropsContent {
  enabled: boolean;
  items: ValuePropItem[];
}

/**
 * Categories section content
 */
export interface HomepageCategoriesContent {
  enabled: boolean;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
}

/**
 * Featured products section content
 */
export interface HomepageFeaturedProductsContent {
  enabled: boolean;
  title: string;
  subtitle: string;
  viewAllText: string;
  viewAllLink: string;
}

/**
 * Newsletter subscription section content
 */
export interface HomepageNewsletterContent {
  enabled: boolean;
  title: string;
  subtitle: string;
  placeholderText: string;
  ctaText: string;
  privacyText: string;
}

/**
 * Footer CTA section content
 */
export interface HomepageFooterCtaContent {
  enabled: boolean;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
}

/**
 * Complete homepage content structure
 */
export interface HomepageContent {
  meta: HomepageMetaContent;
  hero: HomepageHeroContent;
  promoBanner: HomepagePromoBannerContent;
  categories: HomepageCategoriesContent;
  featuredProducts: HomepageFeaturedProductsContent;
  valueProps: HomepageValuePropsContent;
  newsletter: HomepageNewsletterContent;
  footerCta: HomepageFooterCtaContent;
}

/**
 * Default homepage content - safe fallback values
 */
export const DEFAULT_HOMEPAGE_CONTENT: HomepageContent = {
  meta: {
    enabled: true,
    pageTitle: "Welcome to Our Marketplace",
    pageDescription:
      "Discover amazing products from trusted vendors around the world",
  },
  hero: {
    enabled: true,
    title: "Welcome to Our Marketplace",
    subtitle: "Discover amazing products from trusted vendors around the world",
    ctaText: "Start Shopping",
    ctaLink: "/shop",
    backgroundImage: undefined,
  },
  promoBanner: {
    enabled: false,
    text: "🎉 Special Offer: Get 20% off your first order!",
    linkText: "Shop Now",
    linkUrl: "/shop",
  },
  categories: {
    enabled: true,
    title: "Shop by Category",
    subtitle: "Browse our curated selection of product categories",
    ctaText: "View All Categories",
    ctaLink: "/categories",
  },
  featuredProducts: {
    enabled: true,
    title: "Featured Products",
    subtitle: "Check out our handpicked selection of trending products",
    viewAllText: "View All Products",
    viewAllLink: "/products",
  },
  valueProps: {
    enabled: true,
    items: [
      {
        icon: ValuePropIconType.SHOPPING,
        title: "Wide Selection",
        description:
          "Discover thousands of products from top brands and vendors",
      },
      {
        icon: ValuePropIconType.SHIPPING,
        title: "Fast Delivery",
        description:
          "Get your orders delivered quickly with our reliable shipping",
      },
      {
        icon: ValuePropIconType.SECURITY,
        title: "Secure Shopping",
        description: "Shop with confidence using our secure payment system",
      },
    ],
  },
  newsletter: {
    enabled: true,
    title: "Stay Updated",
    subtitle: "Subscribe to our newsletter for exclusive deals and updates",
    placeholderText: "Enter your email address",
    ctaText: "Subscribe",
    privacyText: "We respect your privacy. Unsubscribe at any time.",
  },
  footerCta: {
    enabled: true,
    title: "Ready to Start Shopping?",
    subtitle: "Join thousands of satisfied customers today",
    ctaText: "Browse Products",
    ctaLink: "/products",
  },
};
