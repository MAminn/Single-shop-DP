import { query } from "#root/shared/database/drizzle/db";
import { storeSettings } from "#root/shared/database/drizzle/schema";
import { eq } from "drizzle-orm";
import { Effect } from "effect";

export const getVariantPresets = () =>
  Effect.gen(function* ($) {
    const rows = yield* $(
      query(async (db) =>
        db
          .select({ variantPresets: storeSettings.variantPresets })
          .from(storeSettings)
          .where(eq(storeSettings.key, "default"))
          .limit(1),
      ),
    );

    return (rows[0]?.variantPresets ?? []) as Array<{
      id: string;
      name: string;
      values: string[];
      defaultValue?: string;
      strikethroughValues?: string[];
    }>;
  });
