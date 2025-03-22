import { Effect } from "effect";
import {
  runBackendEffect,
  serializeBackendEffectResult,
} from "#root/shared/backend/effect.js";
import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { validateSessionToken } from "./session";
import { DatabaseClientService } from "#root/shared/database/drizzle/db.js";

export const authMiddlware = createMiddleware<HonoContext.Env>(
  async (c, next) => {
    const sessionToken = getCookie(c, "session");

    if (!sessionToken) {
      c.set("clientSession", undefined);
      await next();
      return;
    }

    const getClientSession = await runBackendEffect(
      validateSessionToken(sessionToken).pipe(
        Effect.provideService(DatabaseClientService, c.var.db)
      )
    ).then(serializeBackendEffectResult);

    if (!getClientSession.success) {
      c.set("clientSession", undefined);
      await next();
      return;
    }

    c.set("clientSession", getClientSession.result);

    await next();
  }
);
