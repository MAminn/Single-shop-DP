import { provideDatabase, protectedProcedure } from "#root/shared/trpc/server.js";
import { z } from "zod";
import { me } from "./me";
import {
  runBackendEffect,
  serializeBackendEffectResult,
} from "#root/shared/backend/effect.js";

export const meProcedure = protectedProcedure
  .input(z.object({ token: z.string() }))
  .mutation(async ({ ctx, input }) => {
    return runBackendEffect(me(input.token).pipe(provideDatabase(ctx))).then(
      serializeBackendEffectResult
    );
  });
