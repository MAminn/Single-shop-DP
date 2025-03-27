import {
	runBackendEffect,
	serializeBackendEffectResult,
} from "#root/shared/backend/effect";
import { provideDatabase, publicProcedure } from "#root/shared/trpc/server";
import { deleteProduct, deleteProductSchema } from "./service";

export const deleteProductProcedure = publicProcedure
	.input(deleteProductSchema)
	.mutation(async ({ ctx, input }) => {
		return await runBackendEffect(
			deleteProduct(input, ctx.clientSession).pipe(provideDatabase(ctx)),
		).then(serializeBackendEffectResult);
	});
