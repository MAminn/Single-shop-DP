import { db } from "#root/shared/database/drizzle/db";
import { homepageContent } from "#root/shared/database/drizzle/schema";
import { eq, and } from "drizzle-orm";
import type { HomepageContent } from "#root/shared/types/homepage-content";
import { v7 as uuidv7 } from "uuid";

/**
 * Updates or creates homepage content for a specific merchant and template
 *
 * @param merchantId - The unique identifier for the merchant
 * @param content - The homepage content to save
 * @param templateId - The template ID to save content for (defaults to "default")
 * @returns Promise resolving to the saved content
 */
export async function updateHomepageContent(
  merchantId: string,
  content: HomepageContent,
  templateId: string = "default",
): Promise<HomepageContent> {
  const database = db();
  const now = new Date();

  // Check if content already exists for this merchant + template
  const existing = await database
    .select()
    .from(homepageContent)
    .where(
      and(
        eq(homepageContent.merchantId, merchantId),
        eq(homepageContent.templateId, templateId),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    // Update existing content
    await database
      .update(homepageContent)
      .set({
        content: content as any,
        updatedAt: now,
      })
      .where(
        and(
          eq(homepageContent.merchantId, merchantId),
          eq(homepageContent.templateId, templateId),
        ),
      );
  } else {
    // Create new content
    await database.insert(homepageContent).values({
      id: uuidv7(),
      merchantId,
      templateId,
      content: content as any,
      createdAt: now,
      updatedAt: now,
    });
  }

  return content;
}
