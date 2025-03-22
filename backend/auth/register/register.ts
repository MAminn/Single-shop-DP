import { query } from "#root/shared/database/drizzle/db.js";
import * as Tables from "#root/shared/database/drizzle/schema.js";
import { Array, Effect, Option } from "effect";
import { hashPassword } from "../shared/utils";
import { eq } from "drizzle-orm";
import { ServerError } from "#root/shared/error/server.js";

export const register = (email: string, password: string) => {
  return Effect.gen(function* ($) {
    const existingUser = yield* $(
      query(
        async (db) =>
          await db
            .select()
            .from(Tables.user)
            .where(eq(Tables.user.email, email))
      ),
      Effect.map(Array.head)
    );

    if (Option.isSome(existingUser)) {
      return yield* $(
        Effect.fail(
          new ServerError({
            tag: "UserAlreadyExists",
            statusCode: 400,
            clientMessage: "User already exists",
          })
        )
      );
    }

    const passwordDigest = yield* $(hashPassword(password));

    return yield* $(
      query(async (db) => {
        return await db
          .insert(Tables.user)
          .values({ email, passwordDigest })
          .returning();
      }),
      Effect.map(Array.head),
      Effect.flatMap(
        Option.match({
          onSome: (user) =>
            Effect.succeed({
              id: user.id,
              email: user.email,
            }),
          onNone: () =>
            Effect.fail(
              new ServerError({
                tag: "FailedToCreateUser",
                statusCode: 500,
                message:
                  "Failed to create user, user does not exist after creation.",
                clientMessage: "Failed to create user",
              })
            ),
        })
      )
    );
  });
};
