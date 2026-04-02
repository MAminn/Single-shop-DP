import { z } from "zod";
import {
  publicProcedure,
  router,
  protectedProcedure,
} from "#root/shared/trpc/server";
import { getHomepageContent } from "./get-homepage-content";
import { updateHomepageContent } from "./update-homepage-content";
import { uploadHeroImage } from "./upload-hero-image";
import { ValuePropIconType } from "#root/shared/types/homepage-content";
import { Effect } from "effect";

// Zod schema for validating homepage content
const HomepageContentSchema = z.object({
  meta: z.object({
    enabled: z.boolean(),
    pageTitle: z.string(),
    pageDescription: z.string(),
  }),
  hero: z.object({
    enabled: z.boolean(),
    title: z.string(),
    subtitle: z.string(),
    ctaText: z.string(),
    ctaLink: z.string(),
    backgroundImage: z.string().optional(),
    mobileBackgroundImage: z.string().optional(),
  }),
  brandStatement: z.object({
    enabled: z.boolean(),
    title: z.string(),
    description: z.string(),
    image: z.string().optional(),
  }),
  promoBanner: z.object({
    enabled: z.boolean(),
    text: z.string(),
    linkText: z.string().optional(),
    linkUrl: z.string().optional(),
  }),
  categories: z.object({
    enabled: z.boolean(),
    title: z.string(),
    subtitle: z.string(),
    ctaText: z.string(),
    ctaLink: z.string(),
  }),
  featuredProducts: z.object({
    enabled: z.boolean(),
    title: z.string(),
    subtitle: z.string(),
    viewAllText: z.string(),
    viewAllLink: z.string(),
  }),
  valueProps: z.object({
    enabled: z.boolean(),
    items: z.array(
      z.object({
        icon: z.nativeEnum(ValuePropIconType),
        title: z.string(),
        description: z.string(),
      }),
    ),
  }),
  newsletter: z.object({
    enabled: z.boolean(),
    title: z.string(),
    subtitle: z.string(),
    placeholderText: z.string(),
    ctaText: z.string(),
    privacyText: z.string(),
  }),
  footerCta: z.object({
    enabled: z.boolean(),
    title: z.string(),
    subtitle: z.string(),
    ctaText: z.string(),
    ctaLink: z.string(),
  }),
});

export const homepageRouter = router({
  getContent: publicProcedure
    .input(
      z.object({
        merchantId: z.string().uuid(),
        templateId: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      const content = await getHomepageContent(
        input.merchantId,
        input.templateId,
      );
      return {
        success: true,
        result: content,
      };
    }),

  updateContent: protectedProcedure
    .input(
      z.object({
        merchantId: z.string().uuid(),
        templateId: z.string().optional(),
        content: HomepageContentSchema,
      }),
    )
    .mutation(async ({ input }) => {
      const content = await updateHomepageContent(
        input.merchantId,
        input.content,
        input.templateId,
      );
      return {
        success: true,
        result: content,
      };
    }),

  uploadHeroImage: protectedProcedure
    .input(
      z.object({
        file: z.object({
          name: z.string(),
          type: z.string(),
          buffer: z.instanceof(Uint8Array),
        }),
        preserveAspect: z.boolean().optional(), // For brand statement images
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const session = ctx.clientSession;

      // Only admins can upload homepage hero images
      if (!session || session.role !== "admin") {
        return {
          success: false as const,
          error: "Unauthorized. Only admins can upload homepage images.",
        };
      }

      try {
        const result = await Effect.runPromise(
          uploadHeroImage({
            buffer: input.file.buffer,
            mimeType: input.file.type,
            preserveAspect: input.preserveAspect,
          }),
        );

        return {
          success: true as const,
          data: result,
        };
      } catch (error) {
        console.error("Homepage hero image upload error:", error);
        return {
          success: false as const,
          error:
            error instanceof Error ? error.message : "Failed to upload image",
        };
      }
    }),

  uploadMobileHeroImage: protectedProcedure
    .input(
      z.object({
        file: z.object({
          name: z.string(),
          type: z.string(),
          buffer: z.instanceof(Uint8Array),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const session = ctx.clientSession;

      // Only admins can upload homepage hero images
      if (!session || session.role !== "admin") {
        return {
          success: false as const,
          error: "Unauthorized. Only admins can upload homepage images.",
        };
      }

      try {
        const result = await Effect.runPromise(
          uploadHeroImage({
            buffer: input.file.buffer,
            mimeType: input.file.type,
            filenamePrefix: "hero-mobile",
          }),
        );

        return {
          success: true as const,
          data: result,
        };
      } catch (error) {
        console.error("Mobile hero image upload error:", error);
        return {
          success: false as const,
          error:
            error instanceof Error ? error.message : "Failed to upload image",
        };
      }
    }),
});
