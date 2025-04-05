import type { ClientSession } from "#root/backend/auth/shared/entities";
import { checkVendorStatus } from "#root/backend/vendor/utils/check-vendor-status";
import { query } from "#root/shared/database/drizzle/db";
import {
  product,
  productVariant,
  vendor,
} from "#root/shared/database/drizzle/schema";
import { ServerError } from "#root/shared/error/server";
import { eq } from "drizzle-orm";
import { Effect } from "effect";
import { z } from "zod";
import { validateProductRules } from "../shared";

export const createProductSchema = z.object({
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

export const createProduct = (
  data: z.infer<typeof createProductSchema>,
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
      yield* $(
        checkVendorStatus(data.vendorId, session, "create new products")
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

        // Check vendor status again at the database level
        if (existingVendor.status !== "active") {
          throw new Error(
            `Cannot create products for a ${existingVendor.status} vendor`
          );
        }

        const newProduct = await db.transaction(async (tx) => {
          const newProduct = await tx
            .insert(product)
            .values({
              name: data.name,
              description: data.description,
              imageId: data.imageId,
              categoryId: data.categoryId,
              vendorId: data.vendorId,
              price: data.price.toString(),
              stock: data.stock,
            })
            .returning()
            .then((data) => data[0]);

          if (!newProduct) {
            throw new Error("Product not created");
          }

          if (data.variants) {
            await tx
              .insert(productVariant)
              .values(
                data.variants.map((variant) => {
                  return {
                    name: variant.name,
                    values: variant.values,
                    productId: newProduct.id,
                  };
                })
              )
              .returning()
              .then((data) => data[0]);
          }

          // Update the vendor to be featured if they have products
          await tx
            .update(vendor)
            .set({ featured: true })
            .where(eq(vendor.id, data.vendorId));

          return newProduct;
        });

        return newProduct;
      })
    );
  });
