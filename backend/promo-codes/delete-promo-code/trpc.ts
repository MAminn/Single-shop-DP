import {
  runBackendEffect,
  serializeBackendEffectResult,
} from "#root/shared/backend/effect";
import { provideDatabase, publicProcedure } from "#root/shared/trpc/server";
import { deletePromoCode, deletePromoCodeSchema } from "./delete-promo-code";

export const deletePromoCodeProcedure = publicProcedure
  .input(deletePromoCodeSchema)
  .mutation(async ({ ctx, input }) => {
    return await runBackendEffect(
      deletePromoCode(input, ctx.clientSession).pipe(provideDatabase(ctx))
    ).then(serializeBackendEffectResult);
  });
