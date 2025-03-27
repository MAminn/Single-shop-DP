import { query } from "#root/shared/database/drizzle/db";
import {
	category,
	file,
	product,
	vendor,
} from "#root/shared/database/drizzle/schema";
import { and, asc, eq, ilike, or } from "drizzle-orm";
import { Effect } from "effect";
import { z } from "zod";

export const viewProductsSchema = z.object({
	limit: z.number().min(1).max(100).optional(),
	offset: z.number().min(0).optional(),
	search: z.string().trim().max(255).optional(),
	sortBy: z.enum(["name", "price", "stock"]).optional(),
	categoryId: z.string().uuid().optional(),
	vendorId: z.string().uuid().optional(),
});

export const viewProducts = (input: z.infer<typeof viewProductsSchema>) =>
	Effect.gen(function* ($) {
		return yield* $(
			query(async (db) => {
				const pQuery = db
					.select()
					.from(product)
					.innerJoin(vendor, eq(product.vendorId, vendor.id))
					.innerJoin(category, eq(product.categoryId, category.id))
					.leftJoin(file, eq(product.imageId, file.id))
					.$dynamic();

				pQuery.where(eq(vendor.status, "active"));
				pQuery.where(eq(category.deleted, false));

				if (input.search) {
					pQuery.where(
						or(
							ilike(product.name, `%${input.search}%`),
							ilike(product.description, `%${input.search}%`),
							ilike(vendor.name, `%${input.search}%`),
							ilike(category.name, `%${input.search}%`),
						),
					);
				}

				if (input.vendorId) {
					pQuery.where(eq(product.vendorId, input.vendorId));
				}

				if (input.categoryId) {
					pQuery.where(eq(product.categoryId, input.categoryId));
				}

				if (input.sortBy) {
					pQuery.orderBy(
						asc(
							input.sortBy === "name"
								? product.name
								: input.sortBy === "price"
									? product.price
									: product.stock,
						),
					);
				}

				return await pQuery
					.limit(input.limit ?? 10)
					.offset(input.offset ?? 0)
					.execute();
			}),
		);
	});
