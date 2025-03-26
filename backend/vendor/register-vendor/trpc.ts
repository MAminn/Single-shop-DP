import {
	runBackendEffect,
	serializeBackendEffectResult,
} from "#root/shared/backend/effect";
import { provideDatabase, publicProcedure } from "#root/shared/trpc/server";
import { registerVendor, registerVendorSchema } from "./service";

export const registerVendorProcedure = publicProcedure
	.input(registerVendorSchema)
	.mutation(async ({ ctx, input }) => {
		return await runBackendEffect(
			registerVendor(input).pipe(provideDatabase(ctx)),
		).then(serializeBackendEffectResult);
	});
