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

    console.log("Edit vendor input:", {
      id: input.id,
      name: input.name,
      hasEmail: !!input.email,
      hasPassword: !!input.password,
      email: input.email ? `${input.email.substring(0, 3)}...` : undefined,
    });

    // Pre-hash the password if provided
    let passwordDigest: string | undefined;
    if (input.password) {
      console.log("Hashing password...");
      passwordDigest = yield* $(hashPassword(input.password));
      console.log("Password hashed successfully");
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
            console.log("Attempting to update vendor owner's credentials");

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

            console.log("Found vendor owner:", {
              id: vendorOwner.id,
              email: vendorOwner.email,
              hasPasswordDigest: !!vendorOwner.passwordDigest,
              vendorId: vendorOwner.vendorId,
            });

            // Prepare updates
            const updates: Record<string, unknown> = {};

            if (input.email) {
              console.log("Updating email to:", input.email);
              updates.email = input.email;
            }

            if (passwordDigest) {
              console.log("Updating password digest");
              updates.passwordDigest = passwordDigest;
            }

            // Apply updates if any
            if (Object.keys(updates).length > 0) {
              console.log("Applying updates to user:", updates);

              const result = await tx
                .update(user)
                .set(updates)
                .where(eq(user.id, vendorOwner.id))
                .returning();

              console.log("Update result:", result);
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

    console.log("Vendor edit completed successfully");
  });
