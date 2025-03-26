import { t } from "#root/shared/trpc/server";
import { registerVendorProcedure } from "./register-vendor/trpc";
import { viewVendorsProcedure } from "./view-vendors/trpc";

export const vendorRouter = t.router({
	register: registerVendorProcedure,
	view: viewVendorsProcedure,
});
