import {
  runBackendEffect,
  serializeBackendEffectResult,
} from "#root/shared/backend/effect.js";
import { provideDatabase, publicProcedure } from "#root/shared/trpc/server.js";
import { registerVendor, registerVendorSchema } from "./service.js";
import { Effect } from "effect";
import { EmailService } from "#root/shared/email/service.js";

export const registerVendorProcedure = publicProcedure
  .input(registerVendorSchema)
  .mutation(async ({ ctx, input }) => {
    return await runBackendEffect(
      registerVendor(input).pipe(
        provideDatabase(ctx),
        Effect.provideService(EmailService, ctx.emailService)
      )
    ).then(serializeBackendEffectResult);
  });
