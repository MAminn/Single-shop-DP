import { getLayoutSettings } from "#root/backend/layout/get-layout-settings/index";
import { getStoreOwnerId } from "#root/shared/config/store";
import { STORE_NAME, STORE_CURRENCY } from "#root/shared/config/branding";
import { toAbsoluteUrl } from "#root/shared/config/site-url";

export interface EmailBranding {
  storeName: string;
  logoUrl: string | undefined;
  contactEmail: string | undefined;
  currency: string;
  isMinimal: boolean;
  socialLinks: Array<{ platform: string; url: string }>;
}

/**
 * Resolves branding values for email templates from layout settings.
 * Returns store name (from siteTitle or STORE_NAME env), logo URL, contact
 * email, currency, and whether the minimal template is active.
 */
export async function getEmailBranding(): Promise<EmailBranding> {
  try {
    const settings = await getLayoutSettings(getStoreOwnerId(), "landing-minimal");
    const isMinimal = settings.header.navbarStyle === "minimal";
    const storeName = settings.siteTitle || STORE_NAME || "Store";

    // Gmail, Outlook.com, and Yahoo all strip `data:` URI images out of HTML
    // emails (a known anti-phishing measure — they refuse to render an image
    // that can't be scanned/cached), leaving a broken-image icon where the
    // logo should be. So this must always resolve to a real fetchable URL —
    // relative uploads become absolute against PUBLIC_ORIGIN/BASE_URL, never
    // base64-embedded.
    let logoUrl: string | undefined;
    if (settings.header.logoUrl && !settings.header.logoUrl.startsWith("data:")) {
      logoUrl = toAbsoluteUrl(settings.header.logoUrl);
    }

    return {
      storeName,
      logoUrl,
      contactEmail: settings.header.contactEmail || undefined,
      currency: STORE_CURRENCY,
      isMinimal,
      socialLinks: (settings.footer.socialLinks ?? []).filter(
        (s) => s.url && s.url !== "#",
      ),
    };
  } catch {
    return {
      storeName: STORE_NAME || "Store",
      logoUrl: undefined,
      contactEmail: undefined,
      currency: STORE_CURRENCY,
      isMinimal: false,
      socialLinks: [],
    };
  }
}
