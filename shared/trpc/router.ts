import { loginProcedure } from "#root/backend/auth/login/trpc.js";
import { logoutProcedure } from "#root/backend/auth/logout/trpc.js";
import { meProcedure } from "#root/backend/auth/me/trpc.js";
import { registerProcedure } from "#root/backend/auth/register/trpc.js";
import { verifyEmailProcedure } from "#root/backend/auth/verify-email/trpc.js";
import { categoriesRouter } from "#root/backend/categories/trpc";
import { fileRouter } from "#root/backend/file/trpc";
import { orderRouter } from "#root/backend/orders/trpc";
import { productRouter } from "#root/backend/products/trpc";
import { promoCodesRouter } from "#root/backend/promo-codes/trpc";
import { homepageRouter } from "#root/backend/homepage/trpc";
import { publicProcedure, router, t } from "./server";

const authRouter = t.router({
  login: loginProcedure,
  register: registerProcedure,
  me: meProcedure,
  logout: logoutProcedure,
  verifyEmail: verifyEmailProcedure,
});

export const appRouter = router({
  demo: publicProcedure.query(async () => {
    return { demo: true };
  }),
  auth: authRouter,
  category: categoriesRouter,
  product: productRouter,
  order: orderRouter,
  file: fileRouter,
  promoCode: promoCodesRouter,
  homepage: homepageRouter,
});

export type AppRouter = typeof appRouter;
