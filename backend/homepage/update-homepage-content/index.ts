import { db } from "#root/shared/database/drizzle/db";
import { homepageContent } from "#root/shared/database/drizzle/schema";
import { eq } from "drizzle-orm";
import type { HomepageContent } from "#root/shared/types/homepage-content";
import { v7 as uuidv7 } from "uuid";

/**
 * Updates or creates homepage content for a specific merchant
 *
 * @param merchantId - The unique identifier for the merchant
 * @param content - The homepage content to save
 * @returns Promise resolving to the saved content
 */
export async function updateHomepageContent(
  merchantId: string,
  content: HomepageContent
): Promise<HomepageContent> {
  const database = db();
  const now = new Date();

  // Check if content already exists for this merchant
  const existing = await database
    .select()
    .from(homepageContent)
    .where(eq(homepageContent.merchantId, merchantId))
    .limit(1);

  if (existing.length > 0) {
    // Update existing content
    await database
      .update(homepageContent)
      .set({
        content: content as any,
        updatedAt: now,
      })
      .where(eq(homepageContent.merchantId, merchantId));
  } else {
    // Create new content
    await database.insert(homepageContent).values({
      id: uuidv7(),
      merchantId,
      content: content as any,
      createdAt: now,
      updatedAt: now,
    });
  }

  return content;
}
