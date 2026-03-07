import { db } from "#root/shared/database/drizzle/db";
import { layoutSettings } from "#root/shared/database/drizzle/schema";
import { eq } from "drizzle-orm";
import type { LayoutSettings } from "#root/shared/types/layout-settings";
import { v7 as uuidv7 } from "uuid";

/**
 * Updates or creates layout settings for a specific merchant.
 */
export async function updateLayoutSettings(
  merchantId: string,
  content: LayoutSettings,
): Promise<LayoutSettings> {
  const database = db();
  const now = new Date();

  const existing = await database
    .select()
    .from(layoutSettings)
    .where(eq(layoutSettings.merchantId, merchantId))
    .limit(1);

  if (existing.length > 0) {
    await database
      .update(layoutSettings)
      .set({
        content: content as any,
        updatedAt: now,
      })
      .where(eq(layoutSettings.merchantId, merchantId));
  } else {
    await database.insert(layoutSettings).values({
      id: uuidv7(),
      merchantId,
      content: content as any,
      createdAt: now,
      updatedAt: now,
    });
  }

  return content;
}
