import {
	runBackendEffect,
	serializeBackendEffectResult,
} from "#root/shared/backend/effect";
import { provideDatabase, adminProcedure } from "#root/shared/trpc/server";
import { rejectVendor, rejectVendorSchema } from "./service.js";

export const rejectVendorProcedure = adminProcedure
	.input(rejectVendorSchema)
	.mutation(async ({ ctx, input }) => {
		return await runBackendEffect(
			rejectVendor(input, ctx.clientSession).pipe(provideDatabase(ctx)),
		).then(serializeBackendEffectResult);
	});
