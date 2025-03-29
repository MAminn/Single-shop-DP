import {
  runBackendEffect,
  serializeBackendEffectResult,
} from "#root/shared/backend/effect";
import { provideDatabase, publicProcedure } from "#root/shared/trpc/server";
import {
  getFeaturedVendors,
  featuredVendorsSchema,
  updateVendorFeaturedStatus,
  updateVendorFeaturedStatusSchema,
  checkAndUpdateVendorFeaturedStatus,
} from "./service";

export const featuredVendorsProcedure = publicProcedure
  .input(featuredVendorsSchema)
  .query(async ({ ctx, input }) => {
    return await runBackendEffect(
      getFeaturedVendors(input).pipe(provideDatabase(ctx))
    ).then(serializeBackendEffectResult);
  });

export const updateVendorFeaturedStatusProcedure = publicProcedure
  .input(updateVendorFeaturedStatusSchema)
  .mutation(async ({ ctx, input }) => {
    return await runBackendEffect(
      updateVendorFeaturedStatus(input).pipe(provideDatabase(ctx))
    ).then(serializeBackendEffectResult);
  });

export const checkAndUpdateVendorFeaturedStatusProcedure = publicProcedure
  .input(updateVendorFeaturedStatusSchema)
  .mutation(async ({ ctx, input }) => {
    return await runBackendEffect(
      checkAndUpdateVendorFeaturedStatus(input).pipe(provideDatabase(ctx))
    ).then(serializeBackendEffectResult);
  });
