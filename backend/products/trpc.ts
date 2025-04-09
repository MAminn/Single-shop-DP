import { t } from "#root/shared/trpc/server";
import { createProductProcedure } from "./create-product/trpc";
import { deleteProductProcedure } from "./delete-product/trpc";
import { editProductProcedure } from "./edit-product/trpc";
import { getCategoriesProcedure } from "./get-categories/trpc";
import { productStatsProcedure } from "./get-product-stats/trpc";
import { topSellingProcedure } from "./get-top-selling/trpc";
import { totalRevenueProcedure } from "./get-total-revenue/trpc";
import { searchProductsProcedure } from "./search-products/trpc";
import { viewProductsProcedure } from "./view-products/trpc";
import { viewReviewsProcedure } from "./view-reviews/trpc";
import { createReviewProcedure } from "./create-review/trpc";
import { getProductImagesProcedure } from "./get-product-images/trpc";

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
  createReview: createReviewProcedure,
  getProductImages: getProductImagesProcedure,
  getCategories: getCategoriesProcedure,
});
