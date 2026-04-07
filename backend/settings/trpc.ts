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
import { getTemplateSelection } from "./get-template-selection";
import { updateTemplateSelection } from "./update-template-selection";
import { getLinkTreeConfig } from "./get-link-tree-config";
import { updateLinkTreeConfig } from "./update-link-tree-config";
import { linkTreeConfigSchema } from "#root/shared/types/link-tree";

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

  /** Public: storefront and admin can read the active template selection */
  getTemplateSelection: publicProcedure.query(async ({ ctx }) => {
    return runBackendEffect(
      getTemplateSelection().pipe(provideDatabase(ctx)),
    ).then(serializeBackendEffectResult);
  }),

  /** Admin-only: update template selection */
  updateTemplateSelection: adminProcedure
    .input(z.object({ selection: z.record(z.string(), z.string()) }))
    .mutation(async ({ ctx, input }) => {
      return runBackendEffect(
        updateTemplateSelection(input.selection).pipe(provideDatabase(ctx)),
      ).then(serializeBackendEffectResult);
    }),

  /** Public: anyone (including the /links page) can read the link tree config */
  getLinkTreeConfig: publicProcedure.query(async ({ ctx }) => {
    return runBackendEffect(
      getLinkTreeConfig().pipe(provideDatabase(ctx)),
    ).then(serializeBackendEffectResult);
  }),

  /** Admin-only: update the link tree config */
  updateLinkTreeConfig: adminProcedure
    .input(z.object({ config: linkTreeConfigSchema }))
    .mutation(async ({ ctx, input }) => {
      return runBackendEffect(
        updateLinkTreeConfig(input.config).pipe(provideDatabase(ctx)),
      ).then(serializeBackendEffectResult);
    }),
});
