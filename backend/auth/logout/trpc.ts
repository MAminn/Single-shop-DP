import { provideDatabase, protectedProcedure } from "#root/shared/trpc/server.js";
import { z } from "zod";
import {
  runBackendEffect,
  serializeBackendEffectResult,
} from "#root/shared/backend/effect.js";
import { logout } from "./logout";

export const logoutProcedure = protectedProcedure
  .input(z.object({ token: z.string() }))
  .mutation(async ({ ctx, input }) => {
    return await runBackendEffect(
      logout(input.token).pipe(provideDatabase(ctx))
    ).then(serializeBackendEffectResult);
  });
