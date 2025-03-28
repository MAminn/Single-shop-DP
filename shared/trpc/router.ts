import { loginProcedure } from "#root/backend/auth/login/trpc.js";
import { logoutProcedure } from "#root/backend/auth/logout/trpc.js";
import { meProcedure } from "#root/backend/auth/me/trpc.js";
import { registerProcedure } from "#root/backend/auth/register/trpc.js";
import { categoriesRouter } from "#root/backend/categories/trpc";
import { orderRouter } from "#root/backend/orders/trpc";
import { productRouter } from "#root/backend/products/trpc";
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
  category: categoriesRouter,
  product: productRouter,
  order: orderRouter,
});

export type AppRouter = typeof appRouter;
