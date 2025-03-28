import { t } from "#root/shared/trpc/server";
import { createOrderProcedure } from "./create-order/trpc";
import { updateOrderStatusProcedure } from "./update-order-status/trpc";
import { viewOrdersProcedure } from "./view-orders/trpc";

export const orderRouter = t.router({
  view: viewOrdersProcedure,
  create: createOrderProcedure,
  updateStatus: updateOrderStatusProcedure,
});
