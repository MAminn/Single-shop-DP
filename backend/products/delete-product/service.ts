import type { ClientSession } from "#root/backend/auth/shared/entities";
import { query } from "#root/shared/database/drizzle/db";
import { product, vendor } from "#root/shared/database/drizzle/schema";
import { ServerError } from "#root/shared/error/server";
import { eq } from "drizzle-orm";
import { Effect } from "effect";
import { z } from "zod";

export const deleteProductSchema = z.object({
	id: z.string().uuid(),
});

export const deleteProduct = (
	data: z.infer<typeof deleteProductSchema>,
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
				const existingProduct = await db
					.select()
					.from(product)
					.where(eq(product.id, data.id))
					.then((data) => data[0]);

				if (!existingProduct) {
					throw new Error("Product not found");
				}

				const existingVendor = await db
					.select()
					.from(vendor)
					.where(eq(vendor.id, existingProduct.vendorId))
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

				await db.delete(product).where(eq(product.id, data.id));

				return;
			}),
		);
	});
