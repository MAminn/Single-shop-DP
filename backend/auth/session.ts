import type {
  NewSession,
  Session,
  User,
} from "#root/shared/database/drizzle/schema/user.js";
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import { Effect } from "effect";
import {
  DatabaseClientService,
  query,
} from "#root/shared/database/drizzle/db.js";
import { Tables } from "#root/shared/database/drizzle/schema.js";
import { eq } from "drizzle-orm";

export function generateSessionToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
}

export function createSession(token: string, userId: string) {
  return Effect.gen(function* ($) {
    const db = yield* $(DatabaseClientService);

    const sessionToken = encodeHexLowerCase(
      sha256(new TextEncoder().encode(token))
    );

    const newSession: NewSession = {
      token: sessionToken,
      userId,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    };

    const session = yield* $(
      Effect.tryPromise({
        try: async () =>
          await db.insert(Tables.session).values(newSession).returning(),

        catch: (err) =>
          new Error("Failed to create session", {
            cause: err,
          }),
      }),
      Effect.map((session) => session[0])
    );

    if (!session) {
      return yield* $(Effect.fail(new Error("Failed to create session")));
    }

    return session satisfies Session;
  });
}

export function validateSessionToken(token: string) {
  return Effect.gen(function* ($) {
    const sessionToken = encodeHexLowerCase(
      sha256(new TextEncoder().encode(token))
    );

    const result = yield* $(
      query(async (db) => {
        return await db
          .select({ user: Tables.user, session: Tables.session })
          .from(Tables.session)
          .innerJoin(Tables.user, eq(Tables.session.userId, Tables.user.id))
          .where(eq(Tables.session.token, sessionToken));
      })
    );

    if (!result[0]) {
      return { session: null, user: null };
    }

    const { user, session } = result[0];

    if (Date.now() >= session.expiresAt.getTime()) {
      yield* $(
        query(async (db) => {
          await db
            .delete(Tables.session)
            .where(eq(Tables.session.id, session.id));
        })
      );
      return { session: null, user: null };
    }

    if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
      session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

      yield* $(
        query(async (db) => {
          await db
            .update(Tables.session)
            .set({
              expiresAt: session.expiresAt,
            })
            .where(eq(Tables.session.id, session.id));
        })
      );
    }

    return { session, user };
  });
}

export function invalidateSession(sessionId: string) {
  query(async (db) => {
    db.delete(Tables.session).where(eq(Tables.session.id, sessionId));
  });
}

export function invalidateAllSessions(userId: string) {
  return query(
    async (db) =>
      await db.delete(Tables.session).where(eq(Tables.session.userId, userId))
  );
}

export type SessionValidationResult =
  | { session: Session; user: User }
  | { session: null; user: null };
