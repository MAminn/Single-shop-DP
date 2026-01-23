import { db } from "#root/shared/database/drizzle/db";
import { homepageContent } from "#root/shared/database/drizzle/schema";
import { eq } from "drizzle-orm";
import type { HomepageContent } from "#root/shared/types/homepage-content";
import { DEFAULT_HOMEPAGE_CONTENT } from "#root/shared/types/homepage-content";

/**
 * Fetches homepage content for a specific merchant
 * Falls back to default content if not found
 *
 * @param merchantId - The unique identifier for the merchant
 * @returns Promise resolving to the homepage content
 */
export async function getHomepageContent(
  merchantId: string,
): Promise<HomepageContent> {
  try {
    const database = db();
    const result = await database
      .select()
      .from(homepageContent)
      .where(eq(homepageContent.merchantId, merchantId))
      .limit(1);

    if (result.length > 0 && result[0]?.content) {
      // Validate and merge with defaults to ensure all required fields exist
      const storedContent = result[0].content as unknown as HomepageContent;
      return mergeWithDefaults(storedContent);
    }

    // Return default content if not found
    return DEFAULT_HOMEPAGE_CONTENT;
  } catch (error) {
    console.error("Error fetching homepage content:", error);
    // Fail gracefully by returning defaults
    return DEFAULT_HOMEPAGE_CONTENT;
  }
}

/**
 * Merges stored content with defaults to ensure all required fields exist
 * This prevents errors if the schema changes or data is incomplete
 */
function mergeWithDefaults(
  storedContent: Partial<HomepageContent>,
): HomepageContent {
  return {
    meta: {
      ...DEFAULT_HOMEPAGE_CONTENT.meta,
      ...storedContent.meta,
    },
    hero: {
      ...DEFAULT_HOMEPAGE_CONTENT.hero,
      ...storedContent.hero,
    },
    brandStatement: {
      ...DEFAULT_HOMEPAGE_CONTENT.brandStatement,
      ...storedContent.brandStatement,
    },
    promoBanner: {
      ...DEFAULT_HOMEPAGE_CONTENT.promoBanner,
      ...storedContent.promoBanner,
    },
    categories: {
      ...DEFAULT_HOMEPAGE_CONTENT.categories,
      ...storedContent.categories,
    },
    featuredProducts: {
      ...DEFAULT_HOMEPAGE_CONTENT.featuredProducts,
      ...storedContent.featuredProducts,
    },
    valueProps: {
      ...DEFAULT_HOMEPAGE_CONTENT.valueProps,
      ...(storedContent.valueProps || {}),
      items:
        storedContent.valueProps?.items ||
        DEFAULT_HOMEPAGE_CONTENT.valueProps.items,
    },
    newsletter: {
      ...DEFAULT_HOMEPAGE_CONTENT.newsletter,
      ...storedContent.newsletter,
    },
    footerCta: {
      ...DEFAULT_HOMEPAGE_CONTENT.footerCta,
      ...storedContent.footerCta,
    },
  };
}
