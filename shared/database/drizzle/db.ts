import { ServerError } from "#root/shared/error/server.js";
import type { PostgresDb } from "@fastify/postgres";
import { drizzle } from "drizzle-orm/node-postgres";
import { Context, Effect, pipe } from "effect";

export function db() {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  return drizzle(dbUrl);
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
