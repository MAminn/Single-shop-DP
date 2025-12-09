import { Effect } from "effect";
import { query } from "#root/shared/database/drizzle/db.js";
import { vendor } from "#root/shared/database/drizzle/schema.js";
import { eq } from "drizzle-orm";
import { ServerError } from "#root/shared/error/server.js";
import type { SessionValidationResult } from "#root/backend/auth/session.js";

/**
 * Check if vendor status is active
 * Blocks suspended, inactive, pending, rejected, or archived vendors
 * 
 * @param vendorId - The vendor ID to check
 * @param session - The current user session
 * @param operationName - The name of the operation being performed (for error messages)
 */
export const checkVendorStatus = (
	vendorId: string,
	session: SessionValidationResult,
	operationName: string,
) =>
	Effect.gen(function* ($) {
		// Admin bypass
		if (session.role === "admin") {
			return true;
		}

		// Ensure the vendor is acting on their own account
		if (session.vendorId !== vendorId) {
			return yield* $(
				Effect.fail(
					new ServerError({
						tag: "Forbidden",
						statusCode: 403,
						message: `You are not authorized to ${operationName}`,
						clientMessage: "You can only manage your own vendor account",
					}),
				),
			);
		}

		// Check vendor status
		const vendorRecord = yield* $(
			query(async (db) => {
				return await db
					.select()
					.from(vendor)
					.where(eq(vendor.id, vendorId))
					.limit(1);
			}),
			Effect.map((vendors) => vendors[0]),
		);

		if (!vendorRecord) {
			return yield* $(
				Effect.fail(
					new ServerError({
						tag: "VendorNotFound",
						statusCode: 404,
						message: `Vendor ${vendorId} not found`,
						clientMessage: "Vendor account not found",
					}),
				),
			);
		}

		if (vendorRecord.status !== "active") {
			return yield* $(
				Effect.fail(
					new ServerError({
						tag: "VendorNotActive",
						statusCode: 403,
						message: `Vendor ${vendorId} is ${vendorRecord.status} and cannot ${operationName}`,
						clientMessage: `Your vendor account is ${vendorRecord.status}. Only active vendors can perform this operation.`,
					}),
				),
			);
		}

		return true;
	});
