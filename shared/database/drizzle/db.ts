import { ServerError } from "#root/shared/error/server.js";
import { drizzle } from "drizzle-orm/node-postgres";
import { Context, Effect, pipe } from "effect";
import * as schema from "./schema.js";

export function db() {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    console.error("[DB Connection] ERROR: DATABASE_URL is not set");
    throw new Error("DATABASE_URL is not set");
  }

  // Log a sanitized version of the connection string for debugging
  const sanitizedUrl = dbUrl.replace(
    /(postgres:\/\/[^:]+):([^@]+)@/,
    "postgres://$1:***@"
  );
  console.log(`[DB Connection] Connecting to database: ${sanitizedUrl}`);

  try {
    const connection = drizzle(dbUrl, {
      schema,
    });
    console.log("[DB Connection] Database connection created successfully");
    return connection;
  } catch (error) {
    console.error(
      "[DB Connection] Failed to create database connection:",
      error
    );
    throw error;
  }
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
        catch: (err) =>
          new ServerError({
            tag: "DatabaseQueryError",
            cause: err,
          }),
      })
    )
  );
