import { register, registerSchema } from "#root/backend/auth/register/register";
import { query } from "#root/shared/database/drizzle/db";
import { vendor } from "#root/shared/database/drizzle/schema";
import { Array, Effect, Option } from "effect";
import { z } from "zod";

export const registerVendorSchema = z.object({
  user: registerSchema,
  vendor: z.object({
    name: z.string().nonempty().max(255),
    description: z.string().max(1000).optional(),
    logoId: z.string().uuid().optional(),
  }),
});

export const registerVendor = (input: z.infer<typeof registerVendorSchema>) => {
  return Effect.gen(function* ($) {
    const newVendor = yield* $(
      query(async (db) => {
        return await db
          .insert(vendor)
          .values({
            name: input.vendor.name,
            status: "pending",
            description: input.vendor.description,
            logoId: input.vendor.logoId,
          })
          .returning({
            id: vendor.id,
            name: vendor.name,
            status: vendor.status,
          });
      }),
      Effect.map(Array.head),
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
