import { t } from "#root/shared/trpc/server";
import { productRouter } from "../products/trpc";
import { vendorRouter } from "../vendor/trpc";
import { fileRouter } from "../file/trpc";
import { orderRouter } from "../orders/trpc";
import { categoriesRouter } from "../categories/trpc";

export const appRouter = t.router({
  product: productRouter,
  vendor: vendorRouter,
  file: fileRouter,
  order: orderRouter,
  category: categoriesRouter,
});
