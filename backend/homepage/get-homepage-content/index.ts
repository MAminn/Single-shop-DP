import { db } from "#root/shared/database/drizzle/db";
import { homepageContent } from "#root/shared/database/drizzle/schema";
import { eq, and } from "drizzle-orm";
import type { HomepageContent } from "#root/shared/types/homepage-content";
import { DEFAULT_HOMEPAGE_CONTENT } from "#root/shared/types/homepage-content";

/**
 * Fetches homepage content for a specific merchant and template
 * Falls back to hardcoded defaults if no content found for the template
 *
 * @param merchantId - The unique identifier for the merchant
 * @param templateId - The template ID to fetch content for
 * @returns Promise resolving to the homepage content
 */
export async function getHomepageContent(
  merchantId: string,
  templateId?: string,
): Promise<HomepageContent> {
  try {
    const database = db();
    const resolvedTemplateId = templateId || "default";

    // Find content for the specific template
    const result = await database
      .select()
      .from(homepageContent)
      .where(
        and(
          eq(homepageContent.merchantId, merchantId),
          eq(homepageContent.templateId, resolvedTemplateId),
        ),
      )
      .limit(1);

    if (result.length > 0 && result[0]?.content) {
      const storedContent = result[0].content as unknown as HomepageContent;
      return mergeWithDefaults(storedContent);
    }

    // If no template-specific content and this isn't already "default",
    // try the legacy "default" row for backward compatibility with existing data
    if (resolvedTemplateId !== "default") {
      const fallback = await database
        .select()
        .from(homepageContent)
        .where(
          and(
            eq(homepageContent.merchantId, merchantId),
            eq(homepageContent.templateId, "default"),
          ),
        )
        .limit(1);

      if (fallback.length > 0 && fallback[0]?.content) {
        const storedContent = fallback[0].content as unknown as HomepageContent;
        return mergeWithDefaults(storedContent);
      }
    }

    // Return hardcoded default content if nothing found
    return DEFAULT_HOMEPAGE_CONTENT;
  } catch (error) {
    console.error("Error fetching homepage content:", error);
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
    discountedProducts: storedContent.discountedProducts ?? DEFAULT_HOMEPAGE_CONTENT.discountedProducts,
    newArrivals: storedContent.newArrivals ?? DEFAULT_HOMEPAGE_CONTENT.newArrivals,
    marquee: storedContent.marquee ?? DEFAULT_HOMEPAGE_CONTENT.marquee,
  };
}
