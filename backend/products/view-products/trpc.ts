import {
	runBackendEffect,
	serializeBackendEffectResult,
} from "#root/shared/backend/effect";
import { provideDatabase, publicProcedure } from "#root/shared/trpc/server";
import { viewProducts, viewProductsSchema } from "./service";

export const viewProductsProcedure = publicProcedure
	.input(viewProductsSchema)
	.query(async ({ ctx, input }) => {
		return await runBackendEffect(
			viewProducts(input).pipe(provideDatabase(ctx)),
		).then(serializeBackendEffectResult);
	});
