import { Effect } from "effect";
import { Hono } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";
import { z } from "zod";
import { validateSessionToken } from "./session";
import {
  runBackendEffect,
  serializeBackendEffectResult,
} from "#root/shared/backend/effect.js";
import { DatabaseClientService } from "#root/shared/database/drizzle/db.js";

export const authRouter = new Hono<HonoContext.Env>();

const saveTokenSchema = z.object({
  token: z.string().nonempty(),
});

authRouter.post("/save-token", async (c) => {
  console.log("saving token");
  const body = await c.req.json().catch(() => null);

  if (!body) {
    return c.json({ success: false, error: "Invalid data" });
  }

  const validation = saveTokenSchema.safeParse(body);

  if (!validation.success) {
    return c.json({ success: false, error: "Invalid data" });
  }

  const { token } = validation.data;

  const getClientSession = await runBackendEffect(
    validateSessionToken(token).pipe(
      Effect.provideService(DatabaseClientService, c.var.db)
    )
  ).then(serializeBackendEffectResult);

  if (!getClientSession.success) {
    return c.json(getClientSession);
  }

  const clientSession = getClientSession.result;

  setCookie(c, "session", token, {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: "lax",
    path: "/",
    maxAge: (clientSession.expiresAt.getTime() - Date.now()) / 1000,
  });

  return c.json({
    success: true,
    result: clientSession,
  });
});

authRouter.delete("/remove-token", async (c) => {
  deleteCookie(c, "session");

  return c.json({
    success: true,
  });
});
