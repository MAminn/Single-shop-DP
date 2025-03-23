import { Effect } from "effect";
import {
  runBackendEffect,
  serializeBackendEffectResult,
} from "#root/shared/backend/effect.js";
import { validateSessionToken } from "./session";
import { DatabaseClientService } from "#root/shared/database/drizzle/db.js";
import type { FastifyInstance } from "fastify";
import type { ClientSession } from "./shared/entities";
import fp from "fastify-plugin";
declare module "fastify" {
  interface FastifyRequest {
    clientSession?: ClientSession | undefined;
  }
}

export const authFasitfyMiddleware = fp((app: FastifyInstance) => {
  app.decorateRequest("clientSession", undefined);
  app.addHook("onRequest", async (req, _res) => {
    const sessionToken = req.cookies.session;

    if (!sessionToken) {
      req.clientSession = undefined;
      return;
    }

    const getClientSession = await runBackendEffect(
      validateSessionToken(sessionToken).pipe(
        Effect.provideService(DatabaseClientService, req.db)
      )
    ).then(serializeBackendEffectResult);

    if (!getClientSession.success) {
      req.clientSession = undefined;
      return;
    }

    req.clientSession = getClientSession.result;

    return;
  });
});
