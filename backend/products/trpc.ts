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
});
