import {
	runBackendEffect,
	serializeBackendEffectResult,
} from "#root/shared/backend/effect";
import { provideDatabase, publicProcedure } from "#root/shared/trpc/server";
import { suspendVendor, suspendVendorSchema } from "./service.js";

export const suspendVendorProcedure = publicProcedure
	.input(suspendVendorSchema)
	.mutation(async ({ ctx, input }) => {
		return await runBackendEffect(
			suspendVendor(input, ctx.clientSession).pipe(provideDatabase(ctx)),
		).then(serializeBackendEffectResult);
	});
