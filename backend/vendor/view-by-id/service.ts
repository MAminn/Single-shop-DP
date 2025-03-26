import type { ClientSession } from "#root/backend/auth/shared/entities";
import { query } from "#root/shared/database/drizzle/db";
import { user, vendor } from "#root/shared/database/drizzle/schema";
import { ServerError } from "#root/shared/error/server";
import { eq } from "drizzle-orm";
import { Array, Effect, Option } from "effect";
import { z } from "zod";

export const viewVendorByIdSchema = z.object({
	id: z.string().uuid(),
});

export const viewVendorById = (
	input: z.infer<typeof viewVendorByIdSchema>,
	session?: ClientSession,
) =>
	Effect.gen(function* ($) {
		if (
			!session ||
			(session.vendorId !== input.id && session.role !== "admin")
		) {
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
			Effect.map(Array.head),
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

		return Option.getOrThrow(maybeVendor);
	});
