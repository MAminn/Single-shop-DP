import {
	runBackendEffect,
	serializeBackendEffectResult,
} from "#root/shared/backend/effect";
import { provideDatabase, publicProcedure } from "#root/shared/trpc/server";
import { editVendor, editVendorSchema } from "./service.js";

export const editVendorProcedure = publicProcedure
	.input(editVendorSchema)
	.mutation(async ({ ctx, input }) => {
		return await runBackendEffect(
			editVendor(input, ctx.clientSession).pipe(provideDatabase(ctx)),
		).then(serializeBackendEffectResult);
	});
