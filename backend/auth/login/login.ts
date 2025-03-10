import { query } from "#root/shared/database/drizzle/db.js";
import { Tables } from "#root/shared/database/drizzle/schema.js";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { Effect } from "effect";
import { verify } from "@node-rs/argon2";
import { createSession, generateSessionToken } from "../session";
import { ServerError } from "#root/shared/error/server.js";
import { hashPassword } from "../shared/utils";
const verifyPassword = (hash: string, password: string) =>
  Effect.tryPromise({
    try: async () => await verify(hash, password),
    catch: (err) =>
      new ServerError({
        tag: "VerifyPasswordError",
        cause: err,
      }),
  });

export const login = (email: string, password: string) =>
  Effect.gen(function* ($) {
    const user = yield* $(
      query(
        async (db) =>
          await db
            .select()
            .from(Tables.user)
            .where(eq(Tables.user.email, email))
      ),
      Effect.map((users) => users[0])
    );

    const passwordPlaceholder = yield* $(hashPassword(randomUUID()));

    if (!user) {
      yield* $(verifyPassword(passwordPlaceholder, password));
      return yield* $(
        Effect.fail(
          new ServerError({
            tag: "UserNotFound",
            statusCode: 400,
            clientMessage: "Invalid credenetials",
          })
        )
      );
    }

    const passwordMatch = yield* $(
      verifyPassword(user.passwordDigest, password)
    );

    if (!passwordMatch) {
      return yield* $(
        Effect.fail(
          new ServerError({
            tag: "InvalidPassword",
            statusCode: 400,
            clientMessage: "Invalid credenetials",
          })
        )
      );
    }

    const token = generateSessionToken();
    yield* $(createSession(token, user.id));

    return token;
  });
