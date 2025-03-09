import { publicProcedure } from "#root/shared/trpc/server.js";
import { Effect } from "effect";
import { z } from "zod";
import { register } from "./register";
import { DatabaseClientService } from "#root/shared/database/drizzle/db.js";

export const registerProcedure = publicProcedure
  .input(z.object({ email: z.string(), password: z.string() }))
  .mutation(async (opts) => {
    const db = opts.ctx.db;
    const users = await Effect.runPromise(
      register(opts.input.email, opts.input.password).pipe(
        Effect.provideService(DatabaseClientService, db)
      )
    );
    return users[0];
  });
