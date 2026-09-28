import { query } from "#root/shared/database/drizzle/db";
import { Effect } from "effect";
import { confirmPendingCodOrders } from "#root/backend/orders/cod-auto-confirm/confirm-batch";

/**
 * Admin action: confirm every currently-pending COD order at once (moves
 * each to "processing" and relays its Purchase event). For when orders have
 * piled up and reviewing them one by one isn't practical — access is gated
 * by adminProcedure at the tRPC layer (see trpc.ts).
 */
export const bulkConfirmPendingCodOrders = (actorRole: string) =>
  Effect.gen(function* ($) {
    const confirmed = yield* $(
      query((db) =>
        confirmPendingCodOrders(db, { actor: `${actorRole} (bulk confirm)` }),
      ),
    );
    return { confirmedCount: confirmed.length };
  });
