import { query } from "#root/shared/database/drizzle/db";
import { productReview, user } from "#root/shared/database/drizzle/schema";
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
