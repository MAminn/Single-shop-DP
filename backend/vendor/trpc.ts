import { t } from "#root/shared/trpc/server";
import { activateVendorProcedure } from "./activate-vendor/trpc";
import { approveVendorProcedure } from "./approve-vendor/trpc";
import { registerVendorProcedure } from "./register-vendor/trpc";
import { rejectVendorProcedure } from "./reject-vendor/trpc";
import { suspendVendorProcedure } from "./suspend-vendor/trpc";
import { viewVendorsProcedure } from "./view-vendors/trpc";

export const vendorRouter = t.router({
	register: registerVendorProcedure,
	view: viewVendorsProcedure,
	approve: approveVendorProcedure,
	reject: rejectVendorProcedure,
	suspend: suspendVendorProcedure,
	activate: activateVendorProcedure,
});
