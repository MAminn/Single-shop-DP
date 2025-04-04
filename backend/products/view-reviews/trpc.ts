import {
  runBackendEffect,
  serializeBackendEffectResult,
} from "#root/shared/backend/effect";
import { provideDatabase, publicProcedure } from "#root/shared/trpc/server";
import { viewReviews, viewReviewsSchema } from "./service";

export const viewReviewsProcedure = publicProcedure
  .input(viewReviewsSchema)
  .query(async ({ ctx, input }) => {
    return await runBackendEffect(
      viewReviews(input).pipe(provideDatabase(ctx))
    ).then(serializeBackendEffectResult);
  });
