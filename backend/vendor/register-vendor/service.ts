import {
  register,
  registerSchema,
} from "#root/backend/auth/register/register.js";
import { query } from "#root/shared/database/drizzle/db.js";
import { vendor, file } from "#root/shared/database/drizzle/schema.js";
import { Effect } from "effect";
import { Array as EffectArray, Option } from "effect";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { ServerError } from "#root/shared/error/server.js";

const socialLinkSchema = z.object({
  platform: z.string().min(1),
  url: z.string().url(),
});

type SocialLink = {
  platform: string;
  url: string;
};

export const registerVendorSchema = z.object({
  user: registerSchema,
  vendor: z.object({
    name: z.string().nonempty().max(255),
    description: z.string().max(1000).optional(),
    logoId: z.string().uuid().optional(),
    socialLinks: z.array(socialLinkSchema).optional().default([]),
  }),
});

export const registerVendor = (input: z.infer<typeof registerVendorSchema>) => {
  return Effect.gen(function* ($) {
    // Check if logoId is valid
    let validLogoId = null;

    if (input.vendor.logoId) {
      const logoId = input.vendor.logoId;

      const fileExists = yield* $(
        query(async (db) => {
          const result = await db
            .select({ id: file.id })
            .from(file)
            .where(eq(file.id, logoId))
            .limit(1);
          return result.length > 0;
        })
      );

      if (fileExists) {
        validLogoId = logoId;
      } else {
        // Inform user but continue
        console.warn(
          `File with ID ${logoId} not found. Creating vendor without logo.`
        );
      }
    }

    // Create vendor data without logoId if it's not valid
    const vendorData: {
      name: string;
      status: "pending";
      description?: string;
      logoId?: string;
      socialLinks: SocialLink[];
    } = {
      name: input.vendor.name,
      status: "pending",
      socialLinks: input.vendor.socialLinks || [],
    };

    // Only add these fields if they exist
    if (input.vendor.description) {
      vendorData.description = input.vendor.description;
    }

    if (validLogoId) {
      vendorData.logoId = validLogoId;
    }

    const newVendor = yield* $(
      query(async (db) => {
        return await db.insert(vendor).values(vendorData).returning({
          id: vendor.id,
          name: vendor.name,
          status: vendor.status,
        });
      }),
      Effect.map(EffectArray.head),
      Effect.map(Option.getOrThrow)
    );

    yield* $(
      register({
        ...input.user,
        vendorId: newVendor.id,
        role: "vendor",
      })
    );

    return newVendor;
  });
};
