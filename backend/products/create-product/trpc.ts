import {
	runBackendEffect,
	serializeBackendEffectResult,
} from "#root/shared/backend/effect";
import { provideDatabase, publicProcedure } from "#root/shared/trpc/server";
import { createProduct, createProductSchema } from "./service";

export const createProductProcedure = publicProcedure
	.input(createProductSchema)
	.mutation(async ({ ctx, input }) => {
		return await runBackendEffect(
			createProduct(input, ctx.clientSession).pipe(provideDatabase(ctx)),
		).then(serializeBackendEffectResult);
	});
