import { query } from "#root/shared/database/drizzle/db";
import { category, file } from "#root/shared/database/drizzle/schema";
import { eq, sql, and } from "drizzle-orm";

import { Effect } from "effect";

/**
 * View Main Categories
 * Returns unique main categories (distinct by type) with subcategory count
 */
export const viewMainCategories = () =>
  Effect.gen(function* ($) {
    return yield* $(
      query(async (db) => {
        // Get all categories, then group by type in JavaScript
        const allCategories = await db
          .select({
            id: category.id,
            name: category.name,
            type: category.type,
          })
          .from(category)
          .where(eq(category.deleted, false))
          .orderBy(category.type, category.createdAt);

        // Group by type and get the first one as main category
        const categoryMap = new Map<
          string,
          { id: string; name: string; type: string; subcategoryCount: number }
        >();

        for (const cat of allCategories) {
          if (!categoryMap.has(cat.type)) {
            // First category of this type becomes the "main" category
            categoryMap.set(cat.type, {
              id: cat.id,
              name: cat.name,
              type: cat.type,
              subcategoryCount: 0,
            });
          } else {
            // Increment subcategory count
            const mainCat = categoryMap.get(cat.type)!;
            mainCat.subcategoryCount++;
          }
        }

        return Array.from(categoryMap.values());
      }),
    );
  });

export type ViewMainCategoriesResult = Effect.Effect.Success<
  Awaited<ReturnType<typeof viewMainCategories>>
>;
