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
import { and, asc, count, eq, ilike, inArray, or } from "drizzle-orm";
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
          const baseQueryConditions = [];
          baseQueryConditions.push(eq(vendor.status, "active"));
          baseQueryConditions.push(eq(category.deleted, false));

          if (input.search) {
            baseQueryConditions.push(
              or(
                ilike(product.name, `%${input.search}%`),
                ilike(product.description, `%${input.search}%`),
                ilike(vendor.name, `%${input.search}%`),
                ilike(category.name, `%${input.search}%`)
              )
            );
          }

          if (input.vendorId) {
            baseQueryConditions.push(eq(product.vendorId, input.vendorId));
          }

          // Handle category filtering (potentially complex due to junction table)
          let productIdsInCategory: string[] | null = null;
          if (input.categoryId) {
            const productsInCategoryRes = await tx
              .select({
                productId: productCategory.productId,
              })
              .from(productCategory)
              .where(eq(productCategory.categoryId, input.categoryId))
              .execute();

            productIdsInCategory = productsInCategoryRes.map(
              (p) => p.productId
            );

            if (productIdsInCategory.length > 0) {
              baseQueryConditions.push(
                inArray(product.id, productIdsInCategory)
              );
            } else {
              // If no products found in junction for this category, the result should be empty
              // Effectively, we add a condition that can't be met.
              // We check product.categoryId as a fallback, but realistically, if junction has no entries, it's 0.
              baseQueryConditions.push(
                eq(product.categoryId, input.categoryId)
              );
              // or maybe just return early? For now, let query return 0 results.
            }
          }

          // --- Get Total Count ---
          const countQuery = tx
            .select({ count: count() })
            .from(product)
            .innerJoin(vendor, eq(product.vendorId, vendor.id))
            .innerJoin(category, eq(product.categoryId, category.id))
            .where(and(...baseQueryConditions));

          const totalCountResult = await countQuery.execute();
          const totalCount = totalCountResult[0]?.count ?? 0;

          // --- Get Paginated Products ---
          const pQuery = tx
            .select()
            .from(product)
            .innerJoin(vendor, eq(product.vendorId, vendor.id))
            .innerJoin(category, eq(product.categoryId, category.id))
            .leftJoin(file, eq(product.imageId, file.id))
            .where(and(...baseQueryConditions))
            .$dynamic(); // Keep dynamic for sorting/limit/offset

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

          const productsResult = await pQuery
            .limit(input.limit ?? 10)
            .offset(input.offset ?? 0)
            .execute();

          const productIds = productsResult.map((p) => p.product.id);

          // --- Fetch Related Data (Variants, Categories) ---
          let variants: (typeof productVariant.$inferSelect)[] = [];
          const productCategoryMap = new Map<
            string,
            { id: string; name: string }[]
          >();

          if (productIds.length > 0) {
            variants = await tx
              .select()
              .from(productVariant)
              .where(inArray(productVariant.productId, productIds))
              .execute();

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

          // --- Format Results ---
          const formattedProducts = productsResult.map((productData) => {
            const associatedCategories =
              productCategoryMap.get(productData.product.id) || [];
            return {
              ...productData,
              category: {
                ...productData.category,
                name: formatCategoryName(productData.category.name),
              },
              categories: associatedCategories,
              variants: variants.filter(
                (variant) => variant.productId === productData.product.id
              ),
            };
          });

          // --- Return Paginated Result ---
          return {
            products: formattedProducts,
            totalCount,
          };
        });
      })
    );
  });
