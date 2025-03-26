import {
	runBackendEffect,
	serializeBackendEffectResult,
} from "#root/shared/backend/effect";
import { provideDatabase, publicProcedure } from "#root/shared/trpc/server";
import { viewVendors, viewVendorsSchema } from "./service.js";

export const viewVendorsProcedure = publicProcedure
	.input(viewVendorsSchema)
	.query(async ({ ctx, input }) => {
		return await runBackendEffect(
			viewVendors(input, ctx.clientSession).pipe(provideDatabase(ctx)),
		).then(serializeBackendEffectResult);
	});
