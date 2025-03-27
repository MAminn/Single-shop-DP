import {
	runBackendEffect,
	serializeBackendEffectResult,
} from "#root/shared/backend/effect";
import { provideDatabase, publicProcedure } from "#root/shared/trpc/server";
import { editCategory, editCategorySchema } from "./service";

export const editCategoryProcedure = publicProcedure
	.input(editCategorySchema)
	.mutation(async ({ ctx, input }) => {
		return await runBackendEffect(
			editCategory(input, ctx.clientSession).pipe(provideDatabase(ctx)),
		).then(serializeBackendEffectResult);
	});
