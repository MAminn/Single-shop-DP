import { query } from "#root/shared/database/drizzle/db.js";
import {
  user,
  vendor,
  file,
  product,
} from "#root/shared/database/drizzle/schema.js";
import { eq, desc, and, inArray, count, gt, sql } from "drizzle-orm";
import { Effect } from "effect";
import { z } from "zod";

export const featuredVendorsSchema = z.object({
  limit: z.number().min(1).max(100).optional().default(100),
  offset: z.number().min(0).optional().default(0),
  featured: z.boolean().optional().default(true),
});

export const getFeaturedVendors = (
  input: z.infer<typeof featuredVendorsSchema>
) =>
  Effect.gen(function* ($) {
    // Get all active vendors with their logo and product count
    return yield* $(
      query(async (db) => {
        // First fetch vendor IDs with product counts to filter out vendors with no products
        const vendorsWithProducts = await db
          .select({
            vendorId: product.vendorId,
            productCount: count(product.id),
          })
          .from(product)
          .groupBy(product.vendorId)
          .having(gt(count(product.id), 0));

        const vendorIds = vendorsWithProducts.map((v) => v.vendorId);

        if (vendorIds.length === 0) {
          return [];
        }

        // Fetch vendors with their details
        return await db
          .select({
            id: vendor.id,
            name: vendor.name,
            createdAt: vendor.createdAt,
            status: vendor.status,
            featured: vendor.featured,
            description: vendor.description,
            logoImagePath: file.diskname,
            ownerEmail: user.email,
            productCount: count(product.id),
          })
          .from(vendor)
          .leftJoin(user, eq(vendor.id, user.vendorId))
          .leftJoin(file, eq(vendor.logoId, file.id))
          .leftJoin(product, eq(vendor.id, product.vendorId))
          .where(
            and(
              // Only show active vendors - exclude suspended and rejected
              eq(vendor.status, "active"),
              inArray(vendor.id, vendorIds),
              input.featured ? eq(vendor.featured, true) : undefined
            )
          )
          .groupBy(vendor.id, user.email, file.diskname)
          .orderBy(desc(vendor.createdAt))
          .limit(input.limit)
          .offset(input.offset);
      })
    );
  });

// Schema for updating vendor featured status
export const updateVendorFeaturedStatusSchema = z.object({
  vendorId: z.string().uuid(),
});

/**
 * Updates the featured status of a vendor based on product count
 * If a vendor has at least one product, set featured=true
 */
export const updateVendorFeaturedStatus = (
  input: z.infer<typeof updateVendorFeaturedStatusSchema>
) =>
  Effect.gen(function* ($) {
    return yield* $(
      query(async (db) => {
        // Check if vendor has products
        const products = await db
          .select({ id: product.id })
          .from(product)
          .where(eq(product.vendorId, input.vendorId))
          .limit(1);

        const hasProducts = products.length > 0;

        // Only update featured status for active vendors
        if (hasProducts) {
          // Update the vendor to featured=true if they have products
          return await db
            .update(vendor)
            .set({ featured: true })
            .where(
              and(eq(vendor.id, input.vendorId), eq(vendor.status, "active"))
            )
            .returning();
        }

        return null;
      })
    );
  });

/**
 * Checks if a vendor has any products and updates their featured status accordingly
 * If a vendor has at least one product, featured=true, otherwise featured=false
 */
export const checkAndUpdateVendorFeaturedStatus = (
  input: z.infer<typeof updateVendorFeaturedStatusSchema>
) =>
  Effect.gen(function* ($) {
    return yield* $(
      query(async (db) => {
        // Check if vendor has products
        const products = await db
          .select({ id: product.id })
          .from(product)
          .where(eq(product.vendorId, input.vendorId))
          .limit(1);

        const hasProducts = products.length > 0;

        // Get vendor status
        const vendorData = await db
          .select({ status: vendor.status })
          .from(vendor)
          .where(eq(vendor.id, input.vendorId))
          .then((results) => results[0]);

        // Only set featured=true for active vendors
        const shouldBeFeatured = hasProducts && vendorData?.status === "active";

        // Update the vendor's featured status based on whether they have products and are active
        return await db
          .update(vendor)
          .set({ featured: shouldBeFeatured })
          .where(eq(vendor.id, input.vendorId))
          .returning();
      })
    );
  });
