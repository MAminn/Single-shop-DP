import {
  runBackendEffect,
  serializeBackendEffectResult,
} from "#root/shared/backend/effect";
import { provideDatabase, protectedProcedure } from "#root/shared/trpc/server";
import { createReview, createReviewSchema } from "./service";

export const createReviewProcedure = protectedProcedure
  .input(createReviewSchema)
  .mutation(async ({ ctx, input }) => {
    return await runBackendEffect(
      createReview(input, ctx.clientSession).pipe(provideDatabase(ctx))
    ).then(serializeBackendEffectResult);
  });
