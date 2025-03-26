import { query } from "#root/shared/database/drizzle/db.js";
import * as Tables from "#root/shared/database/drizzle/schema.js";
import { Array, Effect, Option } from "effect";
import { hashPassword } from "../shared/utils";
import { eq } from "drizzle-orm";
import { ServerError } from "#root/shared/error/server.js";
import { z } from "zod";

export const registerSchema = z.object({
	email: z.string().email(),
	password: z
		.string()
		.min(8, "Password must be at least 8 characters long")
		.max(255),
	name: z.string().nonempty().max(255),
	phone: z
		.string()
		.regex(/^(\+201|01|00201)[0-2,5]{1}[0-9]{8}/, "Invalid phone number"),
	role: z.enum(["admin", "vendor", "user"]).default("user"),
	vendorId: z.string().uuid().optional(),
});

export const register = ({
	email,
	password,
	name,
	phone,
	role,
	vendorId,
}: z.infer<typeof registerSchema>) => {
	return Effect.gen(function* ($) {
		const existingUser = yield* $(
			query(
				async (db) =>
					await db
						.select()
						.from(Tables.user)
						.where(eq(Tables.user.email, email)),
			),
			Effect.map(Array.head),
		);

		if (Option.isSome(existingUser)) {
			return yield* $(
				Effect.fail(
					new ServerError({
						tag: "UserAlreadyExists",
						statusCode: 400,
						clientMessage: "User already exists",
					}),
				),
			);
		}

		if (vendorId) {
			const maybeVendor = yield* $(
				query(
					async (db) =>
						await db
							.select({
								id: Tables.vendor.id,
								name: Tables.vendor.name,
							})
							.from(Tables.vendor)
							.where(eq(Tables.vendor.id, vendorId)),
				),
				Effect.map(Array.head),
			);

			if (Option.isNone(maybeVendor)) {
				return yield* $(
					Effect.fail(
						new ServerError({
							tag: "VendorNotFound",
							statusCode: 400,
							clientMessage: "Vendor not found",
						}),
					),
				);
			}
		}

		const passwordDigest = yield* $(hashPassword(password));

		return yield* $(
			query(async (db) => {
				return await db
					.insert(Tables.user)
					.values({ email, passwordDigest, name, phone, vendorId, role })
					.returning();
			}),
			Effect.map(Array.head),
			Effect.flatMap(
				Option.match({
					onSome: (user) =>
						Effect.succeed({
							id: user.id,
							email: user.email,
						}),
					onNone: () =>
						Effect.fail(
							new ServerError({
								tag: "FailedToCreateUser",
								statusCode: 500,
								message:
									"Failed to create user, user does not exist after creation.",
								clientMessage: "Failed to create user",
							}),
						),
				}),
			),
		);
	});
};
