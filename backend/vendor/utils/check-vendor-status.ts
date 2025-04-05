import type { ClientSession } from "#root/backend/auth/shared/entities";
import { query } from "#root/shared/database/drizzle/db";
import { vendor } from "#root/shared/database/drizzle/schema";
import { ServerError } from "#root/shared/error/server";
import { eq } from "drizzle-orm";
import { Effect } from "effect";

/**
 * Check if a vendor is allowed to perform an action
 * Throws an error if the vendor is suspended or rejected
 *
 * @param vendorId The ID of the vendor to check
 * @param session The client session
 * @param operation A string describing the operation being performed (for error messages)
 */
export const checkVendorStatus = (
  vendorId: string,
  session?: ClientSession,
  operation = "perform this action"
) =>
  Effect.gen(function* ($) {
    // Only check for vendor accounts
    if (!session || session.role !== "vendor") {
      return;
    }

    // Verify that the vendor ID matches the session
    if (session.vendorId !== vendorId) {
      return yield* $(
        Effect.fail(
          new ServerError({
            tag: "Unauthorized",
            statusCode: 401,
            clientMessage: "You are not authorized to perform this action",
          })
        )
      );
    }

    // Get the vendor's status
    const vendorData = yield* $(
      query(async (db) => {
        return await db
          .select({
            status: vendor.status,
          })
          .from(vendor)
          .where(eq(vendor.id, vendorId))
          .then((result) => result[0]);
      })
    );

    if (!vendorData) {
      return yield* $(
        Effect.fail(
          new ServerError({
            tag: "VendorNotFound",
            statusCode: 404,
            clientMessage: "Vendor not found",
          })
        )
      );
    }

    // Check if the vendor is suspended
    if (vendorData.status === "suspended") {
      return yield* $(
        Effect.fail(
          new ServerError({
            tag: "VendorSuspended",
            statusCode: 403,
            clientMessage: `Your vendor account is suspended. You cannot ${operation} until your account is reactivated.`,
          })
        )
      );
    }

    // Check if the vendor is rejected
    if (vendorData.status === "rejected") {
      return yield* $(
        Effect.fail(
          new ServerError({
            tag: "VendorRejected",
            statusCode: 403,
            clientMessage: `Your vendor account application was rejected. You cannot ${operation}.`,
          })
        )
      );
    }

    // Check if the vendor is pending
    if (vendorData.status === "pending") {
      return yield* $(
        Effect.fail(
          new ServerError({
            tag: "VendorPending",
            statusCode: 403,
            clientMessage: `Your vendor account is pending approval. You cannot ${operation} until your account is approved.`,
          })
        )
      );
    }

    // Vendor is allowed to proceed
    return;
  });
