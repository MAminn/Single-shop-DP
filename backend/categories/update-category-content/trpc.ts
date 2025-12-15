import { z } from "zod";
import { protectedProcedure } from "#root/shared/trpc/server";
import { updateCategoryContent } from "./index";

// Zod schema for category content validation
const CategoryContentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.object({
    enabled: z.boolean(),
    text: z.string(),
  }),
  hero: z.object({
    enabled: z.boolean(),
    imageUrl: z.string().url().optional().or(z.literal("")),
  }),
});

/**
 * tRPC procedure to update category content
 * Protected - requires authentication
 */
export const updateCategoryContentProcedure = protectedProcedure
  .input(
    z.object({
      merchantId: z.string().uuid(),
      categoryId: z.string(),
      content: CategoryContentSchema,
    })
  )
  .mutation(async ({ input, ctx }) => {
    // TODO: Add authorization check - ensure user owns this merchant
    // For now, we'll use the merchantId from input

    const updatedContent = await updateCategoryContent(
      input.merchantId,
      input.categoryId,
      input.content
    );

    return {
      success: true,
      content: updatedContent,
    };
  });
