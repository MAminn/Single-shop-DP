import type { ClientSession } from "#root/backend/auth/shared/entities";
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

        const updatedProduct = await db.transaction(async (tx) => {
          const updatedProduct = await tx
            .update(product)
            .set({
              name: data.name,
              description: data.description,
              imageId: data.imageId,
              categoryId: data.categoryId,
              vendorId: data.vendorId,
              price: data.price.toString(),
              stock: data.stock,
            })
            .where(eq(product.id, data.id))
            .returning()
            .then((data) => data[0]);

          if (!updatedProduct) {
            throw new Error("Product not updated");
          }

          if (!data.variants) {
            return updatedProduct;
          }

          const variantNames: string[] = [];

          for (const variant of data.variants) {
            const existingVariant = await tx
              .select()
              .from(productVariant)
              .where(
                and(
                  eq(productVariant.name, variant.name),
                  eq(productVariant.productId, updatedProduct.id)
                )
              )
              .then((data) => data[0]);

            if (existingVariant) {
              await tx
                .update(productVariant)
                .set({
                  values: variant.values,
                })
                .where(eq(productVariant.id, existingVariant.id));

              variantNames.push(existingVariant.name);
            } else {
              await tx.insert(productVariant).values({
                name: variant.name,
                values: variant.values,
                productId: updatedProduct.id,
              });

              variantNames.push(variant.name);
            }
          }

          await tx
            .delete(productVariant)
            .where(
              and(
                eq(productVariant.productId, updatedProduct.id),
                not(inArray(productVariant.name, variantNames))
              )
            );

          return updatedProduct;
        });

        if (!updatedProduct) {
          throw new Error("Product not updated");
        }

        return updatedProduct;
      })
    );
  });
