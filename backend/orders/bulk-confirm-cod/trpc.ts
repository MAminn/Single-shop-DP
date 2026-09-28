import {
  runBackendEffect,
  serializeBackendEffectResult,
} from "#root/shared/backend/effect";
import { adminProcedure, provideDatabase } from "#root/shared/trpc/server";
import { bulkConfirmPendingCodOrders } from "./service";

export const bulkConfirmCodOrdersProcedure = adminProcedure.mutation(
  async ({ ctx }) => {
    return await runBackendEffect(
      bulkConfirmPendingCodOrders(ctx.clientSession?.role ?? "admin").pipe(
        provideDatabase(ctx),
      ),
    ).then(serializeBackendEffectResult);
  },
);
