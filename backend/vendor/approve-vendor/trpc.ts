import {
	runBackendEffect,
	serializeBackendEffectResult,
} from "#root/shared/backend/effect";
import { provideDatabase, publicProcedure } from "#root/shared/trpc/server";
import { approveVendor, approveVendorSchema } from "./service.js";

export const approveVendorProcedure = publicProcedure
	.input(approveVendorSchema)
	.mutation(async ({ ctx, input }) => {
		return await runBackendEffect(
			approveVendor(input, ctx.clientSession).pipe(provideDatabase(ctx)),
		).then(serializeBackendEffectResult);
	});
