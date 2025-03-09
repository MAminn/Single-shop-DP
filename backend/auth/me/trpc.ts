import { publicProcedure } from "#root/shared/trpc/server.js";
import { Effect } from "effect";
import { z } from "zod";
import { me } from "./me";
import { DatabaseClientService } from "#root/shared/database/drizzle/db.js";

export const meProcedure = publicProcedure
  .input(z.object({ token: z.string() }))
  .mutation(async (opts) => {
    const db = opts.ctx.db;
    return await Effect.runPromise(
      me(opts.input.token).pipe(
        Effect.provideService(DatabaseClientService, db)
      )
    );
  });
