import { ServerError } from "#root/shared/error/server.js";
import { drizzle } from "drizzle-orm/node-postgres";
import { Context, Effect, pipe } from "effect";
import * as schema from "./schema.js";

function createConnection() {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    console.error("[DB Connection] ERROR: DATABASE_URL is not set");
    throw new Error("DATABASE_URL is not set");
  }

  try {
    return drizzle(dbUrl, {
      schema,
    });
  } catch (error) {
    console.error(
      "[DB Connection] Failed to create database connection:",
      error,
    );
    throw error;
  }
}

// createConnection() opens a brand-new pg.Pool every call. db() is called
// from ~25 call sites across request handlers and background workers, so
// without caching, every one of those calls (every scanner tick, every
// direct db() call outside the Fastify request lifecycle) leaks another
// pool's worth of connections — the server was hitting Postgres's
// max_connections within minutes under the email-automation workers.
let cachedConnection: ReturnType<typeof createConnection> | undefined;

export function db() {
  if (!cachedConnection) cachedConnection = createConnection();
  return cachedConnection;
}

export class DatabaseClientService extends Context.Tag("DatabaseClientService")<
  DatabaseClientService,
  DatabaseClient
>() {}

export type DatabaseClient = ReturnType<typeof db>;

export const query = <A>(fn: (db: DatabaseClient) => Promise<A>) =>
  pipe(
    DatabaseClientService,
    Effect.flatMap((db) =>
      Effect.tryPromise({
        try: async () => await fn(db),
        catch: (err) => {
          // If it's already a ServerError, pass it through without re-wrapping
          if (err instanceof ServerError) {
            return err;
          }
          console.error("[Database Query Error]", err);
          return new ServerError({
            tag: "DatabaseQueryError",
            cause: err,
          });
        },
      }),
    ),
  );
