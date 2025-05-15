import { t } from "#root/shared/trpc/server.js";
import { activateVendorProcedure } from "./activate-vendor/trpc.js";
import { approveVendorProcedure } from "./approve-vendor/trpc.js";
import { editVendorProcedure } from "./edit-vendor/trpc.js";
import {
  featuredVendorsProcedure,
  updateVendorFeaturedStatusProcedure,
  checkAndUpdateVendorFeaturedStatusProcedure,
} from "./featured-vendors/trpc.js";
import { registerVendorProcedure } from "./register-vendor/trpc.js";
import { rejectVendorProcedure } from "./reject-vendor/trpc.js";
import { suspendVendorProcedure } from "./suspend-vendor/trpc.js";
import { viewVendorByIdProcedure } from "./view-by-id/trpc.js";
import { viewVendorsProcedure } from "./view-vendors/trpc.js";

export const vendorRouter = t.router({
  register: registerVendorProcedure,
  view: viewVendorsProcedure,
  viewById: viewVendorByIdProcedure,
  approve: approveVendorProcedure,
  reject: rejectVendorProcedure,
  suspend: suspendVendorProcedure,
  activate: activateVendorProcedure,
  edit: editVendorProcedure,
  featured: featuredVendorsProcedure,
  updateFeaturedStatus: updateVendorFeaturedStatusProcedure,
  checkAndUpdateFeaturedStatus: checkAndUpdateVendorFeaturedStatusProcedure,
});
