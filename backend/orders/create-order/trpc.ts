import {
  runBackendEffect,
  serializeBackendEffectResult,
} from "#root/shared/backend/effect";
import { provideDatabase, publicProcedure } from "#root/shared/trpc/server";
import { createOrder, createOrderSchema } from "./service";
export const createOrderProcedure = publicProcedure
  .input(createOrderSchema)
  .mutation(async ({ ctx, input }) => {
    return await runBackendEffect(
      createOrder(input, ctx.clientSession).pipe(provideDatabase(ctx))
    ).then(serializeBackendEffectResult);
  });
