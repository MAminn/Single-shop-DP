import { getLayoutSettings } from "#root/backend/layout/get-layout-settings/index";
import { getStoreOwnerId } from "#root/shared/config/store";
import { STORE_NAME, STORE_CURRENCY } from "#root/shared/config/branding";

export interface EmailBranding {
  storeName: string;
  logoUrl: string | undefined;
  contactEmail: string | undefined;
  currency: string;
  isMinimal: boolean;
}

/**
 * Resolves branding values for email templates from layout settings.
 * Returns store name (from siteTitle or STORE_NAME env), logo URL, contact
 * email, currency, and whether the minimal template is active.
 */
export async function getEmailBranding(): Promise<EmailBranding> {
  const baseUrl = process.env.BASE_URL || process.env.PUBLIC_ORIGIN || "http://127.0.0.1:3000";

  try {
    const settings = await getLayoutSettings(getStoreOwnerId(), "landing-minimal");
    const isMinimal = settings.header.navbarStyle === "minimal";
    const storeName = settings.siteTitle || STORE_NAME || "Store";

    let logoUrl: string | undefined;
    if (settings.header.logoUrl) {
      const raw = settings.header.logoUrl;
      if (raw.startsWith("http")) {
        logoUrl = raw;
      } else if (raw.startsWith("/")) {
        logoUrl = `${baseUrl}${raw}`;
      } else {
        logoUrl = `${baseUrl}/uploads/${raw}`;
      }
    }

    return {
      storeName,
      logoUrl,
      contactEmail: settings.header.contactEmail || undefined,
      currency: STORE_CURRENCY,
      isMinimal,
    };
  } catch {
    return {
      storeName: STORE_NAME || "Store",
      logoUrl: undefined,
      contactEmail: undefined,
      currency: STORE_CURRENCY,
      isMinimal: false,
    };
  }
}
