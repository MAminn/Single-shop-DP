import {
	runBackendEffect,
	serializeBackendEffectResult,
} from "#root/shared/backend/effect";
import { provideDatabase, vendorProcedure } from "#root/shared/trpc/server";
import { editProduct, editProductSchema } from "./service";

export const editProductProcedure = vendorProcedure
	.input(editProductSchema)
	.mutation(async ({ ctx, input }) => {
		return await runBackendEffect(
			editProduct(input, ctx.clientSession).pipe(provideDatabase(ctx)),
		).then(serializeBackendEffectResult);
	});
