import { query } from "#root/shared/database/drizzle/db";
import { category, file } from "#root/shared/database/drizzle/schema";
import { eq } from "drizzle-orm";

import { Effect } from "effect";

export const viewCategories = () =>
	Effect.gen(function* ($) {
		return yield* $(
			query(async (db) => {
				return await db
					.select({
						id: category.id,
						name: category.name,
						slug: category.slug,
						imageId: category.imageId,
						filename: file.diskname,
						type: category.type,
					})
					.from(category)
					.leftJoin(file, eq(category.imageId, file.id))
					.where(eq(category.deleted, false))
					.then((data) => data.map((c) => ({ ...c, productCount: 0 })));
			}),
		);
	});

export type ViewCategoriesResult = Effect.Effect.Success<
	Awaited<ReturnType<typeof viewCategories>>
>;
