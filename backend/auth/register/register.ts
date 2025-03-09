import {
  DatabaseClientService,
  db,
  query,
} from "#root/shared/database/drizzle/db.js";
import { Tables } from "#root/shared/database/drizzle/schema.js";
import { Effect } from "effect";
import { hash } from "@node-rs/argon2";

export const register = (email: string, password: string) => {
  return Effect.gen(function* ($) {
    return yield* $(
      query(async (db) => {
        return await db
          .insert(Tables.user)
          .values({ email, passwordDigest: await hash(password) })
          .returning();
      })
    );
  });
};
