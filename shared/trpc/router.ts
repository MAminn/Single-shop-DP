import { loginProcedure } from "#root/backend/auth/login/trpc.js";
import { logoutProcedure } from "#root/backend/auth/logout/trpc.js";
import { meProcedure } from "#root/backend/auth/me/trpc.js";
import { registerProcedure } from "#root/backend/auth/register/trpc.js";
import { vendorRouter } from "#root/backend/vendor/trpc";
import { publicProcedure, router, t } from "./server";

const authRouter = t.router({
	login: loginProcedure,
	register: registerProcedure,
	me: meProcedure,
	logout: logoutProcedure,
});

export const appRouter = router({
	demo: publicProcedure.query(async () => {
		return { demo: true };
	}),
	auth: authRouter,
	vendor: vendorRouter,
});

export type AppRouter = typeof appRouter;
