import type { ClientSession } from "#root/backend/auth/shared/entities";
import { query } from "#root/shared/database/drizzle/db";
import {
  file,
  user,
  vendor,
  product,
} from "#root/shared/database/drizzle/schema";
import { ServerError } from "#root/shared/error/server";
import { eq, count } from "drizzle-orm";
import { Array, Effect, Option } from "effect";
import { z } from "zod";

export const approveVendorSchema = z.object({
  id: z.string().uuid(),
});

export const approveVendor = (
  input: z.infer<typeof approveVendorSchema>,
  session?: ClientSession
) =>
  Effect.gen(function* ($) {
    if (!session || session.role !== "admin") {
      return yield* $(
        Effect.fail(
          new ServerError({
            tag: "Unauthorized",
            statusCode: 401,
            clientMessage: "Unauthorized",
          })
        )
      );
    }

    const maybeVendor = yield* $(
      query(async (db) => {
        return await db
          .select({
            id: vendor.id,
            name: vendor.name,
            createdAt: vendor.createdAt,
            status: vendor.status,
            ownerEmail: user.email,
            ownerName: user.name,
          })
          .from(vendor)
          .leftJoin(user, eq(vendor.id, user.vendorId))
          .where(eq(vendor.id, input.id));
      }),
      Effect.map(Array.head)
    );

    if (Option.isNone(maybeVendor)) {
      return yield* $(
        Effect.fail(
          new ServerError({
            tag: "VendorNotFound",
            statusCode: 404,
            clientMessage: "Vendor not found",
          })
        )
      );
    }

    return Option.getOrThrow(maybeVendor);
  });

export const viewVendorByIdSchema = z.object({
  vendorId: z.string().uuid(),
});

export const viewVendorById = (input: z.infer<typeof viewVendorByIdSchema>) =>
  Effect.gen(function* ($) {
    return yield* $(
      query(async (db) => {

        // First check if the vendor exists
        const vendorResult = await db
          .select({
            id: vendor.id,
            name: vendor.name,
            createdAt: vendor.createdAt,
            description: vendor.description,
            logoId: vendor.logoId,
            logoImagePath: file.diskname,
            featured: vendor.featured,
            status: vendor.status,
            ownerEmail: user.email,
            socialLinks: vendor.socialLinks,
          })
          .from(vendor)
          .leftJoin(user, eq(vendor.id, user.vendorId))
          .leftJoin(file, eq(vendor.logoId, file.id))
          .where(eq(vendor.id, input.vendorId))
          .limit(1);

        // Get product count for this vendor
        const productCountResult = await db
          .select({
            count: count(product.id),
          })
          .from(product)
          .where(eq(product.vendorId, input.vendorId));

        const vendorData = vendorResult[0] || null;

        if (vendorData) {

          // Ensure socialLinks is always a properly typed array
          const typedSocialLinks: Array<{ platform: string; url: string }> =
            Array.isArray(vendorData.socialLinks)
              ? vendorData.socialLinks.map((link) => {
                  if (
                    typeof link === "object" &&
                    link !== null &&
                    "platform" in link &&
                    "url" in link
                  ) {
                    return {
                      platform: String(link.platform),
                      url: String(link.url),
                    };
                  }
                  return { platform: "", url: "" };
                })
              : [];

          // Only return the vendor if it's active or we include the product count regardless
          return {
            ...vendorData,
            productCount: productCountResult[0]?.count || 0,
            socialLinks: typedSocialLinks,
          };
        }

        return null;
      })
    );
  });
