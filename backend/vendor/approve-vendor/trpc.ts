import {
  runBackendEffect,
  serializeBackendEffectResult,
} from "#root/shared/backend/effect.js";
import { provideDatabase, adminProcedure } from "#root/shared/trpc/server.js";
import { approveVendor, approveVendorSchema } from "./service.js";
import { Effect } from "effect";
import { EmailService } from "#root/shared/email/service.js";

export const approveVendorProcedure = adminProcedure
  .input(approveVendorSchema)
  .mutation(async ({ ctx, input }) => {
    return await runBackendEffect(
      approveVendor(input, ctx.clientSession).pipe(
        provideDatabase(ctx),
        Effect.provideService(EmailService, ctx.emailService)
      )
    ).then(serializeBackendEffectResult);
  });
