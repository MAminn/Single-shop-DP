import type { ClientSession } from "#root/backend/auth/shared/entities";
import { query } from "#root/shared/database/drizzle/db";
import { product, vendor } from "#root/shared/database/drizzle/schema";
import { ServerError } from "#root/shared/error/server";
import { eq } from "drizzle-orm";
import { Effect } from "effect";
import { z } from "zod";

export const editProductSchema = z.object({
	id: z.string().uuid(),
	name: z.string().nonempty().max(255),
	description: z.string().nonempty().max(3000),
	imageId: z.string().uuid(),
	categoryId: z.string().uuid(),
	price: z.number().min(0).max(10000),
	vendorId: z.string().uuid(),
	stock: z.number().min(0).max(10000),
	variants: z
		.array(
			z.object({
				name: z.string().nonempty().max(255),
				values: z.array(z.string().nonempty().max(255)),
			}),
		)
		.optional(),
});

export const editProduct = (
	data: z.infer<typeof editProductSchema>,
	session?: ClientSession,
) =>
	Effect.gen(function* ($) {
		if (!session || (session.role !== "admin" && session.role !== "vendor")) {
			return yield* $(
				Effect.fail(
					new ServerError({
						tag: "Unauthorized",
						statusCode: 401,
						clientMessage: "Unauthorized",
					}),
				),
			);
		}

		return yield* $(
			query(async (db) => {
				const existingVendor = await db
					.select()
					.from(vendor)
					.where(eq(vendor.id, data.vendorId))
					.then((data) => data[0]);

				if (!existingVendor) {
					throw new Error("Vendor not found");
				}

				if (
					session.role === "vendor" &&
					session.vendorId !== existingVendor.id
				) {
					throw new Error("Unauthorized");
				}

				const updatedProduct = await db
					.update(product)
					.set({
						name: data.name,
						description: data.description,
						imageId: data.imageId,
						categoryId: data.categoryId,
						vendorId: data.vendorId,
						price: data.price.toString(),
						stock: data.stock,
					})
					.where(eq(product.id, data.id))
					.returning()
					.then((data) => data[0]);

				if (!updatedProduct) {
					throw new Error("Product not updated");
				}

				return updatedProduct;
			}),
		);
	});
