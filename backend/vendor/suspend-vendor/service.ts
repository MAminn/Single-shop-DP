import type { ClientSession } from "#root/backend/auth/shared/entities";
import { query } from "#root/shared/database/drizzle/db";
import { user, vendor, vendorLog } from "#root/shared/database/drizzle/schema";
import { ServerError } from "#root/shared/error/server";
import { eq } from "drizzle-orm";
import { Effect, Array as EffectArray, Option } from "effect";
import { z } from "zod";

export const suspendVendorSchema = z.object({
	id: z.string().uuid(),
});

export const suspendVendor = (
	input: z.infer<typeof suspendVendorSchema>,
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

		const maybeVendor = yield* $(
			query(async (db) => {
				return await db
					.select({
						id: vendor.id,
						name: vendor.name,
						createdAt: vendor.createdAt,
						status: vendor.status,
						ownerEmail: user.email,
						ownerName: user.name,
					})
					.from(vendor)
					.leftJoin(user, eq(vendor.id, user.vendorId))
					.where(eq(vendor.id, input.id));
			}),
			Effect.map(EffectArray.head),
		);

		if (Option.isNone(maybeVendor)) {
			return yield* $(
				Effect.fail(
					new ServerError({
						tag: "VendorNotFound",
						statusCode: 404,
						clientMessage: "Vendor not found",
					}),
				),
			);
		}

		const targetVendor = Option.getOrThrow(maybeVendor);

		if (targetVendor.status === "suspended") {
			return yield* $(
				Effect.fail(
					new ServerError({
						tag: "VendorAlreadySuspended",
						statusCode: 400,
						clientMessage: "Vendor already suspended",
					}),
				),
			);
		}

		return yield* $(
			query(async (db) => {
				return await db.transaction(async (tx) => {
					const actionUser = await tx
						.select({
							id: user.id,
						})
						.from(user)
						.where(eq(user.email, session.email))
						.then((data) => data[0]);

					if (!actionUser) {
						throw new Error("User not found");
					}

					const suspend = tx
						.update(vendor)
						.set({ status: "suspended", updatedAt: new Date() })
						.where(eq(vendor.id, targetVendor.id));

					const logApprove = tx.insert(vendorLog).values({
						action: "suspended",
						userId: actionUser.id,
						vendorId: targetVendor.id,
					});

					await Promise.all([suspend, logApprove]);
				});
			}),
		);
	});
