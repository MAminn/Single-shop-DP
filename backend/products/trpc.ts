import { t } from "#root/shared/trpc/server";
import { createProductProcedure } from "./create-product/trpc";
import { deleteProductProcedure } from "./delete-product/trpc";
import { editProductProcedure } from "./edit-product/trpc";
import { viewProductsProcedure } from "./view-products/trpc";

export const productRouter = t.router({
	view: viewProductsProcedure,
	create: createProductProcedure,
	edit: editProductProcedure,
	delete: deleteProductProcedure,
});
