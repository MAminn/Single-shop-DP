import {
	runBackendEffect,
	serializeBackendEffectResult,
} from "#root/shared/backend/effect";
import { provideDatabase, publicProcedure } from "#root/shared/trpc/server";
import { viewVendorById, viewVendorByIdSchema } from "./service.js";

export const viewVendorByIdProcedure = publicProcedure
	.input(viewVendorByIdSchema)
	.query(async ({ ctx, input }) => {
		return await runBackendEffect(
			viewVendorById(input, ctx.clientSession).pipe(provideDatabase(ctx)),
		).then(serializeBackendEffectResult);
	});
