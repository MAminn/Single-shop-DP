import type { Get, UniversalMiddleware } from "@universal-middleware/core";
import { dbSqlite } from "#root/shared/database/drizzle/db";
import { createMiddleware } from "hono/factory";

declare module "hono" {
  interface Variables {
    db: ReturnType<typeof dbSqlite>;
  }
}

// Add `db` to the Context
export const dbMiddleware: Get<[], UniversalMiddleware> =
  () => async (_request, context, _runtime) => {
    const db = dbSqlite();

    return {
      ...context,
      db: db,
    };
  };

export const dbHonoMiddleware = createMiddleware<HonoContext.Env>(
  async (c, next) => {
    c.set("db", dbSqlite());
    await next();
  }
);
