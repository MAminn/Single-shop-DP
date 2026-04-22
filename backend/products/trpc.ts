import { t, adminProcedure } from "#root/shared/trpc/server";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { product, productVariant } from "#root/shared/database/drizzle/schema";
import { createProductProcedure } from "./create-product/trpc";
import { deleteProductProcedure } from "./delete-product/trpc";
import { editProductProcedure } from "./edit-product/trpc";
import { getCategoriesProcedure } from "./get-categories/trpc";
import { productStatsProcedure } from "./get-product-stats/trpc";
import { topSellingProcedure } from "./get-top-selling/trpc";
import { totalRevenueProcedure } from "./get-total-revenue/trpc";
import { searchProductsProcedure } from "./search-products/trpc";
import { viewProductsProcedure } from "./view-products/trpc";
import { viewReviewsProcedure, viewAllReviewsProcedure } from "./view-reviews/trpc";
import { createReviewProcedure } from "./create-review/trpc";
import { deleteReviewProcedure } from "./delete-review/trpc";
import { getProductImagesProcedure } from "./get-product-images/trpc";
import { getProductByIdProcedure } from "./get-product-by-id/trpc";

export const productRouter = t.router({
  view: viewProductsProcedure,
  create: createProductProcedure,
  edit: editProductProcedure,
  delete: deleteProductProcedure,
  stats: productStatsProcedure,
  topSelling: topSellingProcedure,
  revenue: totalRevenueProcedure,
  search: searchProductsProcedure,
  getReviews: viewReviewsProcedure,
  getAllReviews: viewAllReviewsProcedure,
  createReview: createReviewProcedure,
  deleteReview: deleteReviewProcedure,
  getProductImages: getProductImagesProcedure,
  getCategories: getCategoriesProcedure,
  getById: getProductByIdProcedure,
  /** Admin-only: apply/update a variant preset across ALL non-deleted products */
  applyPresetToAll: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        values: z.array(
          z.object({
            value: z.string().min(1),
            priceModifier: z.number().min(0).optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = ctx.db;
      const allProducts = await db
        .select({ id: product.id })
        .from(product)
        .where(eq(product.deleted, false));

      for (const p of allProducts) {
        const existing = await db
          .select({ id: productVariant.id })
          .from(productVariant)
          .where(
            and(
              eq(productVariant.productId, p.id),
              eq(productVariant.name, input.name),
            ),
          );

        if (existing.length > 0) {
          await db
            .update(productVariant)
            .set({ values: input.values })
            .where(
              and(
                eq(productVariant.productId, p.id),
                eq(productVariant.name, input.name),
              ),
            );
        } else {
          await db.insert(productVariant).values({
            productId: p.id,
            name: input.name,
            values: input.values,
          });
        }
      }

      return { success: true, result: { updatedCount: allProducts.length } };
    }),

  /** Admin-only: remove a variant (by name) from ALL non-deleted products */
  removeVariantFromAllProducts: adminProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const db = ctx.db;
      const { inArray } = await import("drizzle-orm");

      const allProducts = await db
        .select({ id: product.id })
        .from(product)
        .where(eq(product.deleted, false));

      if (allProducts.length > 0) {
        const productIds = allProducts.map((p) => p.id);
        await db
          .delete(productVariant)
          .where(
            and(
              inArray(productVariant.productId, productIds),
              eq(productVariant.name, input.name),
            ),
          );
      }

      return { success: true, result: { removedCount: allProducts.length } };
    }),
});
