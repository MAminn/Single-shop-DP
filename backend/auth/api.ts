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

const saveTokenSchema = z.object({
	token: z.string().nonempty(),
});

export const authFastifyPlugin = ((app: FastifyInstance, _, done) => {
	runBackendEffect(
		register({
			email: "admin@lebsy.com",
			name: "Admin",
			password: "admin1234",
			phone: "+201001112233",
			role: "admin",
		}).pipe(Effect.provideService(DatabaseClientService, app.db)),
	).then(serializeBackendEffectResult);

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

		res.setCookie("session", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			path: "/",
			maxAge: Math.ceil(
				(clientSession.expiresAt.getTime() - Date.now()) / 1000,
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
