import { formatCategoryName } from "#root/lib/utils";
import { query } from "#root/shared/database/drizzle/db";
import {
  category,
  file,
  product,
  productVariant,
  productCategory,
  vendor,
} from "#root/shared/database/drizzle/schema";
import { and, asc, eq, ilike, inArray, or } from "drizzle-orm";
import { Effect } from "effect";
import { z } from "zod";

export const viewProductsSchema = z.object({
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
  search: z.string().trim().max(255).optional(),
  sortBy: z.enum(["name", "price", "stock"]).optional(),
  categoryId: z.string().uuid().optional(),
  vendorId: z.string().uuid().optional(),
});

export const viewProducts = (input: z.infer<typeof viewProductsSchema>) =>
  Effect.gen(function* ($) {
    return yield* $(
      query(async (db) => {
        return await db.transaction(async (tx) => {
          const pQuery = tx
            .select()
            .from(product)
            .innerJoin(vendor, eq(product.vendorId, vendor.id))
            .innerJoin(category, eq(product.categoryId, category.id))
            .leftJoin(file, eq(product.imageId, file.id))
            .$dynamic();

          pQuery.where(eq(vendor.status, "active"));
          pQuery.where(eq(category.deleted, false));

          if (input.search) {
            pQuery.where(
              or(
                ilike(product.name, `%${input.search}%`),
                ilike(product.description, `%${input.search}%`),
                ilike(vendor.name, `%${input.search}%`),
                ilike(category.name, `%${input.search}%`)
              )
            );
          }

          if (input.vendorId) {
            pQuery.where(eq(product.vendorId, input.vendorId));
          }

          if (input.categoryId) {
            // First, get all product IDs that belong to this category (via junction table)
            const productsInCategory = await tx
              .select({
                productId: productCategory.productId,
              })
              .from(productCategory)
              .where(eq(productCategory.categoryId, input.categoryId))
              .execute();

            const productIds = productsInCategory.map((p) => p.productId);

            if (productIds.length > 0) {
              // Filter products to those in the category (either as primary or additional)
              pQuery.where(inArray(product.id, productIds));
            } else {
              // Fallback to the old way if no products found in junction table
              pQuery.where(eq(product.categoryId, input.categoryId));
            }
          }

          if (input.sortBy) {
            pQuery.orderBy(
              asc(
                input.sortBy === "name"
                  ? product.name
                  : input.sortBy === "price"
                    ? product.price
                    : product.stock
              )
            );
          }

          const products = await pQuery
            .limit(input.limit ?? 10)
            .offset(input.offset ?? 0)
            .execute();

          const variants = await tx
            .select()
            .from(productVariant)
            .where(
              inArray(
                productVariant.productId,
                products.map(({ product }) => product.id)
              )
            )
            .execute();

          // Fetch all category associations for these products
          const productCategoryMap = new Map<
            string,
            { id: string; name: string }[]
          >();

          const productIds = products.map((p) => p.product.id);
          if (productIds.length > 0) {
            const productCategories = await tx
              .select({
                productId: productCategory.productId,
                categoryId: productCategory.categoryId,
                categoryName: category.name,
                isPrimary: productCategory.isPrimary,
              })
              .from(productCategory)
              .innerJoin(category, eq(productCategory.categoryId, category.id))
              .where(inArray(productCategory.productId, productIds))
              .execute();

            // Build a map of productId -> categories
            for (const pc of productCategories) {
              if (!productCategoryMap.has(pc.productId)) {
                productCategoryMap.set(pc.productId, []);
              }
              productCategoryMap.get(pc.productId)?.push({
                id: pc.categoryId,
                name: formatCategoryName(pc.categoryName),
              });
            }
          }

          return products.map((product) => {
            // Get all categories for this product
            const productCategories =
              productCategoryMap.get(product.product.id) || [];

            return {
              ...product,
              category: {
                ...product.category,
                name: formatCategoryName(product.category.name),
              },
              categories: productCategories,
              variants: variants.filter(
                (variant) => variant.productId === product.product.id
              ),
            };
          });
        });
      })
    );
  });
