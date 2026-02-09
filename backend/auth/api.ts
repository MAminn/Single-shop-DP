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
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set");
  }

  // Create a dummy email service for admin registration
  const dummyEmailService = createDummyEmailService(app.log);

  runBackendEffect(
    register({
      email: process.env.ADMIN_EMAIL,
      name: "Admin",
      password: process.env.ADMIN_PASSWORD,
      phone: "+201001112233",
      role: "admin",
      confirmPassword: process.env.ADMIN_PASSWORD,
    }).pipe(
      Effect.provideService(DatabaseClientService, app.db),
      Effect.provideService(EmailService, dummyEmailService)
    )
  )
    .then(serializeBackendEffectResult)
    .then((result) => {
      if (result.success) {
        console.log("[Auth] Admin account created or already exists");
      } else {
        console.log("[Auth] Admin bootstrap result:", result.error);
      }
    })
    .catch((err) => {
      console.error("[Auth] Admin bootstrap error:", err);
    });

  // Determine if cookies should be secure (only over HTTPS)
  const isSecure =
    process.env.NODE_ENV === "production" &&
    (process.env.BASE_URL?.startsWith("https://") ||
      process.env.PUBLIC_ORIGIN?.startsWith("https://"));

  app.post("/token", async (req, res) => {
    const validation = saveTokenSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).send({ success: false, error: "Invalid data" });
    }

    const { token } = validation.data;

    const getClientSession = await runBackendEffect(
      validateSessionToken(token).pipe(
        Effect.provideService(DatabaseClientService, req.db)
      )
    ).then(serializeBackendEffectResult);

    if (!getClientSession.success) {
      return res.status(400).send(getClientSession);
    }

    const clientSession = getClientSession.result;

    res.setCookie("session", token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      path: "/",
      maxAge: Math.ceil(
        (clientSession.expiresAt.getTime() - Date.now()) / 1000
      ),
    });

    return res.status(200).send({
      success: true,
      result: clientSession,
    });
  });

  app.delete("/token", async (req, res) => {
    res.clearCookie("session");

    return res.status(200).send({
      success: true,
    });
  });

  done();
}) satisfies FastifyPluginCallback;
