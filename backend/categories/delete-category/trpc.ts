import {
	runBackendEffect,
	serializeBackendEffectResult,
} from "#root/shared/backend/effect";
import { provideDatabase, publicProcedure } from "#root/shared/trpc/server";
import { deleteCategory, deleteCategorySchema } from "./service";

export const deleteCategoryProcedure = publicProcedure
	.input(deleteCategorySchema)
	.mutation(async ({ ctx, input }) => {
		return await runBackendEffect(
			deleteCategory(input, ctx.clientSession).pipe(provideDatabase(ctx)),
		).then(serializeBackendEffectResult);
	});
