import { Effect } from "effect";
import { z } from "zod";
import { validateSessionToken } from "./session";
import {
  runBackendEffect,
  serializeBackendEffectResult,
} from "#root/shared/backend/effect.js";
import { DatabaseClientService } from "#root/shared/database/drizzle/db.js";
import type { FastifyInstance, FastifyPluginCallback } from "fastify";
import { register } from "./register/register";
import {
  EmailService,
  createDummyEmailService,
} from "#root/shared/email/service.js";

const saveTokenSchema = z.object({
  token: z.string().nonempty(),
});

export const authFastifyPlugin = ((app: FastifyInstance, _, done) => {
  // Normalize env vars (Coolify sometimes adds leading '=')
  const adminEmail = (process.env.ADMIN_EMAIL || "").replace(/^=/, "").trim();
  const adminPassword = (process.env.ADMIN_PASSWORD || "")
    .replace(/^=/, "")
    .trim();

  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set");
  }

  console.log(`[Auth] Bootstrapping admin with email: ${adminEmail}`);

  // Create a dummy email service for admin registration
  const dummyEmailService = createDummyEmailService(app.log);

  runBackendEffect(
    register({
      email: adminEmail,
      name: "Admin",
      password: adminPassword,
      phone: "+201001112233",
      role: "admin",
      confirmPassword: adminPassword,
    }).pipe(
      Effect.provideService(DatabaseClientService, app.db),
      Effect.provideService(EmailService, dummyEmailService),
    ),
  )
    .then(serializeBackendEffectResult)
    .then((result) => {
      if (result.success) {
        console.log("[Auth] Admin account created successfully");
      } else if (result.error === "User already exists") {
        console.log("[Auth] Admin already exists, skipping bootstrap");
      } else {
        console.log("[Auth] Admin bootstrap result:", result.error);
      }
    })
    .catch((err) => {
      console.error("[Auth] Admin bootstrap error:", err);
    });

  /**
   * Helper: build cookie options based on the actual request protocol.
   * With `trustProxy: true`, `req.protocol` correctly reports "https"
   * even behind a TLS-terminating reverse proxy (Traefik / Coolify).
   */
  function cookieOpts(req: import("fastify").FastifyRequest, maxAge?: number) {
    const secure = req.protocol === "https";
    return {
      httpOnly: true,
      secure,
      sameSite: "lax" as const,
      path: "/",
      ...(maxAge != null ? { maxAge } : {}),
    };
  }

  // ── POST /token — set session cookie after login ──────────────────
  app.post("/token", async (req, res) => {
    const validation = saveTokenSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).send({ success: false, error: "Invalid data" });
    }

    const { token } = validation.data;

    const getClientSession = await runBackendEffect(
      validateSessionToken(token).pipe(
        Effect.provideService(DatabaseClientService, req.db),
      ),
    ).then(serializeBackendEffectResult);

    if (!getClientSession.success) {
      return res.status(400).send(getClientSession);
    }

    const clientSession = getClientSession.result;

    // Ensure expiresAt is a Date so getTime() works reliably
    const expiresAt =
      clientSession.expiresAt instanceof Date
        ? clientSession.expiresAt
        : new Date(clientSession.expiresAt);
    const maxAge = Math.ceil((expiresAt.getTime() - Date.now()) / 1000);

    res.setCookie(
      "session",
      token,
      cookieOpts(req, maxAge > 0 ? maxAge : 60 * 60 * 24 * 30),
    );

    return res.status(200).send({
      success: true,
      result: clientSession,
    });
  });

  // ── GET /me — return current session from cookie (client-side restore) ─
  app.get("/me", async (req, res) => {
    // The auth middleware already validated the cookie and set clientSession
    if (!req.clientSession) {
      return res
        .status(401)
        .send({ success: false, error: "Not authenticated" });
    }

    return res.status(200).send({
      success: true,
      result: req.clientSession,
    });
  });

  // ── DELETE /token — clear session cookie on logout ────────────────
  app.delete("/token", async (req, res) => {
    res.clearCookie("session", cookieOpts(req));

    return res.status(200).send({
      success: true,
    });
  });

  done();
}) satisfies FastifyPluginCallback;
