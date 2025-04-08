import type { ClientSession } from "#root/backend/auth/shared/entities";
import { query } from "#root/shared/database/drizzle/db";
import { user, vendor, vendorLog } from "#root/shared/database/drizzle/schema";
import { ServerError } from "#root/shared/error/server";
import { eq } from "drizzle-orm";
import { Effect } from "effect";
import { z } from "zod";
import { hashPassword } from "#root/backend/auth/shared/utils";

const socialLinkSchema = z.object({
  platform: z.string().min(1),
  url: z.string().url(),
});

export const editVendorSchema = z.object({
  id: z.string().uuid(),
  name: z.string().nonempty().max(255),
  description: z.string().max(1000).optional(),
  logoId: z.string().uuid().optional(),
  socialLinks: z.array(socialLinkSchema).optional(),
  featured: z.boolean().optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).max(255).optional(),
});

export const editVendor = (
  input: z.infer<typeof editVendorSchema>,
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

    // Pre-hash the password if provided
    let passwordDigest: string | undefined;
    if (input.password) {
      passwordDigest = yield* $(hashPassword(input.password));
    }

    yield* $(
      query(async (db) => {
        await db.transaction(async (tx) => {
          const updatedVendor = await tx
            .update(vendor)
            .set({
              name: input.name,
              description: input.description,
              logoId: input.logoId,
              featured: input.featured,
              socialLinks: input.socialLinks,
            })
            .where(eq(vendor.id, input.id))
            .returning()
            .then((data) => data[0]);

          if (!updatedVendor) {
            throw new Error("Vendor not found");
          }

          const actionUser = await tx
            .select()
            .from(user)
            .where(eq(user.email, session.email))
            .then((data) => data[0]);

          if (!actionUser) {
            throw new Error("User not found");
          }

          // If email or password are provided, update the vendor owner's information
          if (input.email || passwordDigest) {

            // Find the vendor owner
            const vendorOwner = await tx
              .select()
              .from(user)
              .where(eq(user.vendorId, input.id))
              .then((data) => data[0]);

            if (!vendorOwner) {
              console.error("Vendor owner not found for vendor ID:", input.id);
              throw new Error("Vendor owner not found");
            }


            // Prepare updates
            const updates: Record<string, unknown> = {};

            if (input.email) {
              updates.email = input.email;
            }

            if (passwordDigest) {
              updates.passwordDigest = passwordDigest;
            }

            // Apply updates if any
            if (Object.keys(updates).length > 0) {

              const result = await tx
                .update(user)
                .set(updates)
                .where(eq(user.id, vendorOwner.id))
                .returning();
            }
          }

          await tx.insert(vendorLog).values({
            vendorId: updatedVendor.id,
            userId: actionUser.id,
            action: "updated",
          });
        });
      })
    );
  });
