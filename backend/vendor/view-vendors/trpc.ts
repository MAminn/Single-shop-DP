import {
  runBackendEffect,
  serializeBackendEffectResult,
} from "#root/shared/backend/effect.js";
import { provideDatabase, publicProcedure } from "#root/shared/trpc/server.js";
import { viewVendors, viewVendorsSchema } from "./service.js";

export const viewVendorsProcedure = publicProcedure
  .input(viewVendorsSchema)
  .query(async ({ ctx, input }) => {
    return await runBackendEffect(
      viewVendors(input, ctx.clientSession).pipe(provideDatabase(ctx))
    ).then(serializeBackendEffectResult);
  });
