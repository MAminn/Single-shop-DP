import {
  runBackendEffect,
  serializeBackendEffectResult,
} from "#root/shared/backend/effect";
import { DatabaseClientService } from "#root/shared/database/drizzle/db";
import { Effect } from "effect";
import { getTotalRevenue, getTotalRevenueSchema } from "./service";
import { publicProcedure } from "#root/shared/trpc/server";

export const totalRevenueProcedure = publicProcedure
  .input(getTotalRevenueSchema)
  .query(async ({ input, ctx }) => {
    const result = await runBackendEffect(
      getTotalRevenue(input, ctx.clientSession).pipe(
        Effect.provideService(DatabaseClientService, ctx.db)
      )
    ).then(serializeBackendEffectResult);

    return result;
  });
