import { provideDatabase, publicProcedure } from "#root/shared/trpc/server.js";
import { z } from "zod";
import { register } from "./register";
import {
  runBackendEffect,
  serializeBackendEffectResult,
} from "#root/shared/backend/effect.js";

export const registerProcedure = publicProcedure
  .input(z.object({ email: z.string(), password: z.string() }))
  .mutation(async ({ ctx, input }) => {
    return await runBackendEffect(
      register(input.email, input.password).pipe(provideDatabase(ctx))
    ).then(serializeBackendEffectResult);
  });
