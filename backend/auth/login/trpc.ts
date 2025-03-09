import { publicProcedure } from "#root/shared/trpc/server.js";
import { Effect } from "effect";
import { z } from "zod";
import { login } from "./login";
import { DatabaseClientService } from "#root/shared/database/drizzle/db.js";

export const loginProcedure = publicProcedure
  .input(z.object({ email: z.string(), password: z.string() }))
  .mutation(async (opts) => {
    const db = opts.ctx.db;
    const token = await Effect.runPromise(
      login(opts.input.email, opts.input.password).pipe(
        Effect.provideService(DatabaseClientService, db)
      )
    );
    return token;
  });
