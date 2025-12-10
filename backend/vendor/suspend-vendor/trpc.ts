import {
	runBackendEffect,
	serializeBackendEffectResult,
} from "#root/shared/backend/effect";
import { provideDatabase, adminProcedure } from "#root/shared/trpc/server";
import { suspendVendor, suspendVendorSchema } from "./service.js";

export const suspendVendorProcedure = adminProcedure
	.input(suspendVendorSchema)
	.mutation(async ({ ctx, input }) => {
		return await runBackendEffect(
			suspendVendor(input, ctx.clientSession).pipe(provideDatabase(ctx)),
		).then(serializeBackendEffectResult);
	});
