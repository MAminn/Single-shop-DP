import {
  runBackendEffect,
  serializeBackendEffectResult,
} from "#root/shared/backend/effect";
import { provideDatabase, publicProcedure } from "#root/shared/trpc/server";
import { Effect } from "effect";
import { createOrder, createOrderSchema } from "./service";
import { EmailService } from "#root/shared/email/service";
export const createOrderProcedure = publicProcedure
  .input(createOrderSchema)
  .mutation(async ({ ctx, input }) => {
    return await runBackendEffect(
      createOrder(input, ctx.clientSession).pipe(
        provideDatabase(ctx),
        Effect.provideService(EmailService, ctx.emailService)
      )
    ).then(serializeBackendEffectResult);
  });
