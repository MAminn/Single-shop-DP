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
import { getVariantPresets } from "./get-variant-presets";
import { updateVariantPresets } from "./update-variant-presets";
import { getComingSoonMode } from "./get-coming-soon";
import { setComingSoonMode } from "./set-coming-soon";
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

  /** Public: product form needs presets to offer quick-apply */
  getVariantPresets: publicProcedure.query(async ({ ctx }) => {
    return runBackendEffect(
      getVariantPresets().pipe(provideDatabase(ctx)),
    ).then(serializeBackendEffectResult);
  }),

  /** Admin-only: update variant presets */
  updateVariantPresets: adminProcedure
    .input(
      z.object({
        presets: z.array(
          z.object({
            id: z.string(),
            name: z.string().min(1).max(255),
            values: z.array(
              z.object({
                value: z.string().min(1).max(255),
                priceModifier: z.number().optional(),
              }),
            ),
            defaultValue: z.string().max(255).optional(),
            strikethroughValues: z.array(z.string().max(255)).optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return runBackendEffect(
        updateVariantPresets(input.presets).pipe(provideDatabase(ctx)),
      ).then(serializeBackendEffectResult);
    }),

  /** Public: anyone can check coming-soon mode (used by storefront) */
  getComingSoonMode: publicProcedure.query(async ({ ctx }) => {
    return runBackendEffect(
      getComingSoonMode().pipe(provideDatabase(ctx)),
    ).then(serializeBackendEffectResult);
  }),

  /** Admin-only: toggle coming-soon mode */
  setComingSoonMode: adminProcedure
    .input(z.object({ enabled: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      return runBackendEffect(
        setComingSoonMode(input.enabled).pipe(provideDatabase(ctx)),
      ).then(serializeBackendEffectResult);
    }),
});
