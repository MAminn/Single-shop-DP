import { db } from "#root/shared/database/drizzle/db";
import { layoutSettings } from "#root/shared/database/drizzle/schema";
import { eq } from "drizzle-orm";
import type { LayoutSettings } from "#root/shared/types/layout-settings";
import {
  DEFAULT_LAYOUT_SETTINGS,
  DEFAULT_LOGO_SIZE,
} from "#root/shared/types/layout-settings";

/**
 * Fetches layout settings (header/footer) for a specific merchant.
 * Falls back to default settings if not found.
 */
export async function getLayoutSettings(
  merchantId: string,
): Promise<LayoutSettings> {
  try {
    const database = db();
    const result = await database
      .select()
      .from(layoutSettings)
      .where(eq(layoutSettings.merchantId, merchantId))
      .limit(1);

    if (result.length > 0 && result[0]?.content) {
      const stored = result[0].content as unknown as LayoutSettings;
      return mergeWithDefaults(stored);
    }

    return DEFAULT_LAYOUT_SETTINGS;
  } catch (error) {
    console.error("Error fetching layout settings:", error);
    return DEFAULT_LAYOUT_SETTINGS;
  }
}

/**
 * Merges stored settings with defaults to ensure all required fields exist.
 * Prevents errors if the schema evolves or data is incomplete.
 */
function mergeWithDefaults(stored: Partial<LayoutSettings>): LayoutSettings {
  return {
    header: {
      ...DEFAULT_LAYOUT_SETTINGS.header,
      ...stored.header,
      logoSize: {
        ...DEFAULT_LOGO_SIZE,
        ...stored.header?.logoSize,
      },
      navigationLinks:
        stored.header?.navigationLinks ??
        DEFAULT_LAYOUT_SETTINGS.header.navigationLinks,
    },
    footer: {
      ...DEFAULT_LAYOUT_SETTINGS.footer,
      ...stored.footer,
      footerLinkGroups:
        stored.footer?.footerLinkGroups ??
        DEFAULT_LAYOUT_SETTINGS.footer.footerLinkGroups,
      socialLinks:
        stored.footer?.socialLinks ??
        DEFAULT_LAYOUT_SETTINGS.footer.socialLinks,
    },
  };
}
