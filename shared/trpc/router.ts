import { loginProcedure } from "#root/backend/auth/login/trpc.js";
import { meProcedure } from "#root/backend/auth/me/trpc.js";
import { registerProcedure } from "#root/backend/auth/register/trpc.js";
import { publicProcedure, router, t } from "./server";

const authRouter = t.router({
  login: loginProcedure,
  register: registerProcedure,
  me: meProcedure,
});

export const appRouter = router({
  demo: publicProcedure.query(async () => {
    return { demo: true };
  }),
  auth: authRouter,
});

export type AppRouter = typeof appRouter;
