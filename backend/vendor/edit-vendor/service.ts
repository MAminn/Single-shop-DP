import type { ClientSession } from "#root/backend/auth/shared/entities";
import { query } from "#root/shared/database/drizzle/db";
import { user, vendor, vendorLog } from "#root/shared/database/drizzle/schema";
import { ServerError } from "#root/shared/error/server";
import { eq } from "drizzle-orm";
import { Effect } from "effect";
import { z } from "zod";

export const editVendorSchema = z.object({
	id: z.string().uuid(),
	name: z.string().nonempty().max(255),
});

export const editVendor = (
	input: z.infer<typeof editVendorSchema>,
	session?: ClientSession,
) =>
	Effect.gen(function* ($) {
		if (!session || session.role !== "admin") {
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

		yield* $(
			query(async (db) => {
				await db.transaction(async (tx) => {
					const updatedVendor = await tx
						.update(vendor)
						.set({
							name: input.name,
						})
						.where(eq(vendor.id, input.id))
						.returning()
						.then((data) => data[0]);

					if (!updatedVendor) {
						throw new Error("Vendor not found");
					}

					const actionUser = await tx
						.select()
						.from(user)
						.where(eq(user.email, session.email))
						.then((data) => data[0]);

					if (!actionUser) {
						throw new Error("User not found");
					}

					await tx.insert(vendorLog).values({
						vendorId: updatedVendor.id,
						userId: actionUser.id,
						action: "updated",
					});
				});
			}),
		);
	});
