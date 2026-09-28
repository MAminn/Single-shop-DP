import { query, db } from "#root/shared/database/drizzle/db";
import { storeSettings } from "#root/shared/database/drizzle/schema";
import { eq } from "drizzle-orm";
import { Effect } from "effect";

export const getCodAutoConfirmEnabled = () =>
  Effect.gen(function* ($) {
    const rows = yield* $(
      query(async (db) =>
        db
          .select({ codAutoConfirmEnabled: storeSettings.codAutoConfirmEnabled })
          .from(storeSettings)
          .where(eq(storeSettings.key, "default"))
          .limit(1),
      ),
    );
    return rows[0]?.codAutoConfirmEnabled ?? false;
  });

export const setCodAutoConfirmEnabled = (enabled: boolean) =>
  Effect.gen(function* ($) {
    const updated = yield* $(
      query(async (db) =>
        db
          .update(storeSettings)
          .set({ codAutoConfirmEnabled: enabled, updatedAt: new Date() })
          .where(eq(storeSettings.key, "default"))
          .returning({ codAutoConfirmEnabled: storeSettings.codAutoConfirmEnabled }),
      ),
    );

    if (updated.length > 0) return updated[0]!.codAutoConfirmEnabled;

    // No row yet — insert one
    const inserted = yield* $(
      query(async (db) =>
        db
          .insert(storeSettings)
          .values({ key: "default", codAutoConfirmEnabled: enabled })
          .returning({ codAutoConfirmEnabled: storeSettings.codAutoConfirmEnabled }),
      ),
    );
    return inserted[0]!.codAutoConfirmEnabled;
  });

/** Raw (non-Effect) read for the background worker — see queue-style workers
 * like backend/email-automations/worker.ts, which use the same pattern. */
export async function getCodAutoConfirmEnabledRaw(): Promise<boolean> {
  const rows = await db()
    .select({ codAutoConfirmEnabled: storeSettings.codAutoConfirmEnabled })
    .from(storeSettings)
    .where(eq(storeSettings.key, "default"))
    .limit(1);
  return rows[0]?.codAutoConfirmEnabled ?? false;
}
