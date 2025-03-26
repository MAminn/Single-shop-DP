import type { NewSession, Session, User } from "./shared/database.schema";
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
import { session, user } from "#root/shared/database/drizzle/schema.js";
import { eq } from "drizzle-orm";
import { ServerError } from "#root/shared/error/server.js";
import type { ClientSession } from "./shared/entities";

const Tables = {
	session,
	user,
};

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
			sha256(new TextEncoder().encode(token)),
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
					new ServerError({
						tag: "FailedToCreateSession",
						cause: err,
					}),
			}),
			Effect.map((session) => session[0]),
		);

		if (!session) {
			return yield* $(
				Effect.fail(
					new ServerError({
						tag: "FailedToCreateSession",
						statusCode: 500,
						message:
							"Failed to create session, session does not exist after creation.",
					}),
				),
			);
		}

		return session satisfies Session;
	});
}

export function validateSessionToken(token: string) {
	return Effect.gen(function* ($) {
		const sessionToken = encodeHexLowerCase(
			sha256(new TextEncoder().encode(token)),
		);

		const result = yield* $(
			query(async (db) => {
				return await db
					.select({ user: Tables.user, session: Tables.session })
					.from(Tables.session)
					.innerJoin(Tables.user, eq(Tables.session.userId, Tables.user.id))
					.where(eq(Tables.session.token, sessionToken));
			}),
		);

		if (!result[0]) {
			return yield* $(
				Effect.fail(
					new ServerError({
						tag: "InvalidSessionToken",
						statusCode: 400,
						clientMessage: "Invalid session token",
					}),
				),
			);
		}

		const { user, session } = result[0];

		if (Date.now() >= session.expiresAt.getTime()) {
			yield* $(
				query(async (db) => {
					await db
						.delete(Tables.session)
						.where(eq(Tables.session.id, session.id));
				}),
			);
			return yield* $(
				Effect.fail(
					new ServerError({
						tag: "SessionExpired",
						statusCode: 400,
						clientMessage: "Session expired",
					}),
				),
			);
		}

		if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
			const newExpiryDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

			yield* $(
				query(async (db) => {
					await db
						.update(Tables.session)
						.set({
							expiresAt: newExpiryDate,
						})
						.where(eq(Tables.session.id, session.id));
				}),
			);
		}

		return {
			token: session.token,
			email: user.email,
			expiresAt: session.expiresAt,
			role: user.role,
			vendorId: user.vendorId ?? undefined,
		} satisfies SessionValidationResult;
	});
}

export function invalidateSession(token: string) {
	const sessionToken = encodeHexLowerCase(
		sha256(new TextEncoder().encode(token)),
	);
	return query(async (db) => {
		db.delete(Tables.session).where(eq(Tables.session.token, sessionToken));
	});
}

export function invalidateAllSessions(userId: string) {
	return query(
		async (db) =>
			await db.delete(Tables.session).where(eq(Tables.session.userId, userId)),
	);
}

export type SessionValidationResult = ClientSession;
