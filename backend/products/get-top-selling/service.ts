import type { ClientSession } from "#root/backend/auth/shared/entities";
import { query } from "#root/shared/database/drizzle/db";
import { orderItem, product } from "#root/shared/database/drizzle/schema";
import { ServerError } from "#root/shared/error/server";
import { desc, eq, sql, sum } from "drizzle-orm";
import { Effect } from "effect";
import { z } from "zod";

export const getTopSellingSchema = z.object({
  limit: z.number().min(1).default(5),
});

export interface TopSellingProduct {
  id: string;
  name: string;
  price: number;
  sold: number;
  revenue: number;
  vendorName?: string;
}

export const getTopSelling = (
  input: z.infer<typeof getTopSellingSchema>,
  session?: ClientSession,
) =>
  Effect.gen(function* ($) {
    // Check for authorization
    if (!session) {
      return yield* $(
        Effect.fail(
          new ServerError({
            tag: "Unauthorized",
            statusCode: 401,
            clientMessage: "Unauthorized",
          }),
        ),
      );
    }

    return yield* $(
      query(async (db) => {
        // Get top selling products by sales volume
        const results = await db
          .select({
            id: product.id,
            name: product.name,
            price: product.price,
            sold: sum(orderItem.quantity),
            revenue: sql<number>`sum(${orderItem.price} * ${orderItem.quantity})`,
          })
          .from(orderItem)
          .innerJoin(product, eq(orderItem.productId, product.id))
          .groupBy(product.id, product.name, product.price)
          .orderBy(desc(sql`sum(${orderItem.quantity})`))
          .limit(input.limit);

        // Format results
        return results.map((item) => ({
          id: item.id,
          name: item.name,
          price: Number(item.price),
          sold: Number(item.sold || 0),
          revenue: Number(item.revenue || 0),
        }));
      }),
    );
  });
