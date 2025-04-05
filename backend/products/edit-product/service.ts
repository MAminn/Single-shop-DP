import type { ClientSession } from "#root/backend/auth/shared/entities";
import { checkVendorStatus } from "#root/backend/vendor/utils/check-vendor-status";
import { query } from "#root/shared/database/drizzle/db";
import {
  product,
  productVariant,
  vendor,
} from "#root/shared/database/drizzle/schema";
import { ServerError } from "#root/shared/error/server";
import { and, eq, inArray, not } from "drizzle-orm";
import { Effect } from "effect";
import { z } from "zod";
import { validateProductRules } from "../shared";

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
      })
    )
    .optional(),
});

export const editProduct = (
  data: z.infer<typeof editProductSchema>,
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

    yield* $(validateProductRules(data));

    // If this is a vendor, check their status
    if (session.role === "vendor") {
      yield* $(checkVendorStatus(data.vendorId, session, "edit products"));
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

        // Check vendor status again at the database level
        if (existingVendor.status !== "active") {
          throw new Error(
            `Cannot edit products for a ${existingVendor.status} vendor`
          );
        }

        const existingProduct = await db
          .select()
          .from(product)
          .where(eq(product.id, data.id))
          .then((data) => data[0]);

        if (!existingProduct) {
          throw new Error("Product not found");
        }

        if (existingProduct.vendorId !== data.vendorId) {
          throw new Error("Cannot change product vendor");
        }

        const updatedProduct = await db.transaction(async (tx) => {
          // Update the product
          const updatedProduct = await tx
            .update(product)
            .set({
              name: data.name,
              description: data.description,
              imageId: data.imageId,
              categoryId: data.categoryId,
              price: data.price.toString(),
              stock: data.stock,
              updatedAt: new Date(),
            })
            .where(eq(product.id, data.id))
            .returning()
            .then((data) => data[0]);

          if (!updatedProduct) {
            throw new Error("Product not updated");
          }

          if (data.variants) {
            // Delete existing variants that are not in the new list
            const newVariantNames = data.variants.map((v) => v.name);
            if (newVariantNames.length > 0) {
              await tx
                .delete(productVariant)
                .where(
                  and(
                    eq(productVariant.productId, data.id),
                    not(inArray(productVariant.name, newVariantNames))
                  )
                );
            }

            // Update or insert variants
            for (const variant of data.variants) {
              const existingVariant = await tx
                .select()
                .from(productVariant)
                .where(
                  and(
                    eq(productVariant.productId, data.id),
                    eq(productVariant.name, variant.name)
                  )
                )
                .then((data) => data[0]);

              if (existingVariant) {
                // Update existing variant
                await tx
                  .update(productVariant)
                  .set({
                    values: variant.values,
                  })
                  .where(eq(productVariant.id, existingVariant.id));
              } else {
                // Insert new variant
                await tx.insert(productVariant).values({
                  name: variant.name,
                  values: variant.values,
                  productId: data.id,
                });
              }
            }
          } else {
            // Delete all variants if none provided
            await tx
              .delete(productVariant)
              .where(eq(productVariant.productId, data.id));
          }

          return updatedProduct;
        });

        return updatedProduct;
      })
    );
  });
