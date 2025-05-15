import {
  runBackendEffect,
  serializeBackendEffectResult,
} from "#root/shared/backend/effect.js";
import { provideDatabase, publicProcedure } from "#root/shared/trpc/server.js";
import { viewVendorById, viewVendorByIdSchema } from "./service.js";

export const viewVendorByIdProcedure = publicProcedure
  .input(viewVendorByIdSchema)
  .query(async ({ ctx, input }) => {
    return await runBackendEffect(
      viewVendorById(input).pipe(provideDatabase(ctx))
    ).then(serializeBackendEffectResult);
  });
