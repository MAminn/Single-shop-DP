import { t } from "#root/shared/trpc/server";
import { createCategoryProcedure } from "./create-category/trpc";
import { deleteCategoryProcedure } from "./delete-category/trpc";
import { editCategoryProcedure } from "./edit-category/trpc";
import { viewCategoriesProcedure } from "./view-categories/trpc";
import { getCategoryContentProcedure } from "./get-category-content/trpc";
import { updateCategoryContentProcedure } from "./update-category-content/trpc";

export const categoriesRouter = t.router({
  create: createCategoryProcedure,
  view: viewCategoriesProcedure,
  delete: deleteCategoryProcedure,
  edit: editCategoryProcedure,
  getContent: getCategoryContentProcedure,
  updateContent: updateCategoryContentProcedure,
});
