import { z } from "zod";
import {
  adminProcedure,
  provideDatabase,
  publicProcedure,
  router,
} from "#root/shared/trpc/server.js";
import {
  runBackendEffect,
  serializeBackendEffectResult,
} from "#root/shared/backend/effect.js";
import { getShippingFee } from "./get-shipping-fee";
import { updateShippingFee } from "./update-shipping-fee";

export const settingsRouter = router({
  /** Public: anyone (including the cart page) can read the shipping fee */
  getShippingFee: publicProcedure.query(async ({ ctx }) => {
    return runBackendEffect(getShippingFee().pipe(provideDatabase(ctx))).then(
      serializeBackendEffectResult,
    );
  }),

  /** Admin-only: update the shipping fee */
  updateShippingFee: adminProcedure
    .input(z.object({ fee: z.number().min(0) }))
    .mutation(async ({ ctx, input }) => {
      return runBackendEffect(
        updateShippingFee(input.fee).pipe(provideDatabase(ctx)),
      ).then(serializeBackendEffectResult);
    }),
});
