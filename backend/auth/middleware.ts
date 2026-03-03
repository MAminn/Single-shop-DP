import { Effect } from "effect";
import {
  runBackendEffect,
  serializeBackendEffectResult,
} from "#root/shared/backend/effect.js";
import { validateSessionToken } from "./session";
import { DatabaseClientService } from "#root/shared/database/drizzle/db.js";
import type { FastifyInstance, FastifyReply } from "fastify";
import type { ClientSession } from "./shared/entities";
import fp from "fastify-plugin";
declare module "fastify" {
  interface FastifyRequest {
    clientSession?: ClientSession | undefined;
  }
}

/**
 * Determines if the cookie should have the Secure flag.
 * With trustProxy enabled, req.protocol correctly reports "https"
 * even when Traefik terminates TLS.
 */
function shouldBeSecure(protocol: string): boolean {
  return protocol === "https";
}

/** Refresh the session cookie so its Max-Age stays in sync with the DB session. */
function refreshSessionCookie(
  res: FastifyReply,
  token: string,
  expiresAt: Date,
  secure: boolean,
) {
  const maxAge = Math.ceil((expiresAt.getTime() - Date.now()) / 1000);
  if (maxAge <= 0) return; // session already expired
  res.setCookie("session", token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

export const authFasitfyMiddleware = fp((app: FastifyInstance) => {
  app.decorateRequest("clientSession", undefined);
  app.addHook("onRequest", async (req, res) => {
    const sessionToken = req.cookies.session;

    if (!sessionToken) {
      req.clientSession = undefined;
      return;
    }

    const getClientSession = await runBackendEffect(
      validateSessionToken(sessionToken).pipe(
        Effect.provideService(DatabaseClientService, req.db),
      ),
    ).then(serializeBackendEffectResult);

    if (!getClientSession.success) {
      req.clientSession = undefined;
      return;
    }

    req.clientSession = getClientSession.result;

    // Refresh the cookie on every authenticated request so the browser
    // keeps the cookie alive as long as the DB session is valid.
    const session = getClientSession.result;
    refreshSessionCookie(
      res,
      sessionToken,
      session.expiresAt instanceof Date
        ? session.expiresAt
        : new Date(session.expiresAt),
      shouldBeSecure(req.protocol),
    );

    return;
  });
});
