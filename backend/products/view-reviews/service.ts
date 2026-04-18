import { query } from "#root/shared/database/drizzle/db";
import { product, productReview } from "#root/shared/database/drizzle/schema";
import { desc, eq } from "drizzle-orm";
import { Effect } from "effect";
import { z } from "zod";

export const viewReviewsSchema = z.object({
  productId: z.string().uuid(),
});

export const viewReviews = (input: z.infer<typeof viewReviewsSchema>) =>
  Effect.gen(function* ($) {
    return yield* $(
      query(async (db) => {
        const reviews = await db
          .select({
            id: productReview.id,
            productId: productReview.productId,
            userId: productReview.userId,
            userName: productReview.userName,
            rating: productReview.rating,
            comment: productReview.comment,
            createdAt: productReview.createdAt,
          })
          .from(productReview)
          .where(eq(productReview.productId, input.productId))
          .orderBy(desc(productReview.createdAt))
          .execute();

        // Calculate average rating
        const avgRating =
          reviews.length > 0
            ? reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length
            : 0;

        return {
          reviews,
          averageRating: Number.parseFloat(avgRating.toFixed(1)),
          totalReviews: reviews.length,
        };
      })
    );
  });

/** List all reviews across all products (for admin dashboard) */
export const viewAllReviewsSchema = z.object({
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional(),
});

export const viewAllReviews = (input: z.infer<typeof viewAllReviewsSchema>) =>
  Effect.gen(function* ($) {
    return yield* $(
      query(async (db) => {
        const reviews = await db
          .select({
            id: productReview.id,
            productId: productReview.productId,
            productName: product.name,
            userId: productReview.userId,
            userName: productReview.userName,
            rating: productReview.rating,
            comment: productReview.comment,
            createdAt: productReview.createdAt,
          })
          .from(productReview)
          .innerJoin(product, eq(productReview.productId, product.id))
          .orderBy(desc(productReview.createdAt))
          .limit(input.limit ?? 50)
          .offset(input.offset ?? 0)
          .execute();

        return { reviews };
      })
    );
  });
