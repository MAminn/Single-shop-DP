import { t } from "#root/shared/trpc/server";
import { activateVendorProcedure } from "./activate-vendor/trpc";
import { approveVendorProcedure } from "./approve-vendor/trpc";
import { editVendorProcedure } from "./edit-vendor/trpc";
import {
  featuredVendorsProcedure,
  updateVendorFeaturedStatusProcedure,
  checkAndUpdateVendorFeaturedStatusProcedure,
} from "./featured-vendors/trpc";
import { registerVendorProcedure } from "./register-vendor/trpc";
import { rejectVendorProcedure } from "./reject-vendor/trpc";
import { suspendVendorProcedure } from "./suspend-vendor/trpc";
import { viewVendorByIdProcedure } from "./view-by-id/trpc";
import { viewVendorsProcedure } from "./view-vendors/trpc";

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
