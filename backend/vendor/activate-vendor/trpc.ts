import {
	runBackendEffect,
	serializeBackendEffectResult,
} from "#root/shared/backend/effect";
import { provideDatabase, adminProcedure } from "#root/shared/trpc/server";
import { activateVendor, activateVendorSchema } from "./service.js";

export const activateVendorProcedure = adminProcedure
	.input(activateVendorSchema)
	.mutation(async ({ ctx, input }) => {
		return await runBackendEffect(
			activateVendor(input, ctx.clientSession).pipe(provideDatabase(ctx)),
		).then(serializeBackendEffectResult);
	});
