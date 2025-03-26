import { t } from "#root/shared/trpc/server";
import { createCategoryProcedure } from "./create-category/trpc";
import { deleteCategoryProcedure } from "./delete-category/trpc";
import { viewCategoriesProcedure } from "./view-categories/trpc";

export const categoriesRouter = t.router({
	create: createCategoryProcedure,
	view: viewCategoriesProcedure,
	delete: deleteCategoryProcedure,
});
