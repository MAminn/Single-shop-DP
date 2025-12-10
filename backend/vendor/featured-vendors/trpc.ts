import {
  runBackendEffect,
  serializeBackendEffectResult,
} from "#root/shared/backend/effect.js";
import { provideDatabase, publicProcedure, adminProcedure } from "#root/shared/trpc/server.js";
import {
  getFeaturedVendors,
  featuredVendorsSchema,
  updateVendorFeaturedStatus,
  updateVendorFeaturedStatusSchema,
  checkAndUpdateVendorFeaturedStatus,
} from "./service.js";

export const featuredVendorsProcedure = publicProcedure
  .input(featuredVendorsSchema)
  .query(async ({ ctx, input }) => {
    return await runBackendEffect(
      getFeaturedVendors(input).pipe(provideDatabase(ctx))
    ).then(serializeBackendEffectResult);
  });

export const updateVendorFeaturedStatusProcedure = adminProcedure
  .input(updateVendorFeaturedStatusSchema)
  .mutation(async ({ ctx, input }) => {
    return await runBackendEffect(
      updateVendorFeaturedStatus(input).pipe(provideDatabase(ctx))
    ).then(serializeBackendEffectResult);
  });

export const checkAndUpdateVendorFeaturedStatusProcedure = adminProcedure
  .input(updateVendorFeaturedStatusSchema)
  .mutation(async ({ ctx, input }) => {
    return await runBackendEffect(
      checkAndUpdateVendorFeaturedStatus(input).pipe(provideDatabase(ctx))
    ).then(serializeBackendEffectResult);
  });
