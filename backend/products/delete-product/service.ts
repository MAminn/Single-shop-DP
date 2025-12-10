import type { ClientSession } from "#root/backend/auth/shared/entities";
import { checkVendorStatus } from "#root/backend/vendor/utils/check-vendor-status";
import { query } from "#root/shared/database/drizzle/db.js";
import { product, vendor } from "#root/shared/database/drizzle/schema.js";
import { ServerError } from "#root/shared/error/server";
import { count, eq } from "drizzle-orm";
import { Effect } from "effect";
import { z } from "zod";

export const deleteProductSchema = z.object({
  id: z.string().uuid(),
});

export const deleteProduct = (
  data: z.infer<typeof deleteProductSchema>,
  session?: ClientSession
) =>
  Effect.gen(function* ($) {
    if (!session || (session.role !== "admin" && session.role !== "vendor")) {
      return yield* $(
        Effect.fail(
          new ServerError({
            tag: "Unauthorized",
            statusCode: 401,
            clientMessage: "Unauthorized",
          })
        )
      );
    }

    // First, fetch the product to get vendor info
    const existingProduct = yield* $(
      query(async (db) => {
        return await db
          .select()
          .from(product)
          .where(eq(product.id, data.id))
          .then((data) => data[0]);
      })
    );

    if (!existingProduct) {
      return yield* $(
        Effect.fail(
          new ServerError({
            tag: "ProductNotFound",
            statusCode: 404,
            clientMessage: "Product not found",
          })
        )
      );
    }

    // Check vendor status before deletion
    if (session.role === "vendor") {
      yield* $(checkVendorStatus(existingProduct.vendorId, session, "delete products"));
    }

    return yield* $(
      query(async (db) => {
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

        const vendorId = existingVendor.id;

        // Delete the product
        await db.delete(product).where(eq(product.id, data.id));

        // After deleting, check if this vendor has any remaining products
        const remainingProducts = await db
          .select({ count: count() })
          .from(product)
          .where(eq(product.vendorId, vendorId));

        const hasProducts = (remainingProducts[0]?.count ?? 0) > 0;

        // Update vendor's featured status based on whether they have any products left
        await db
          .update(vendor)
          .set({ featured: hasProducts })
          .where(eq(vendor.id, vendorId));

        return;
      })
    );
  });
