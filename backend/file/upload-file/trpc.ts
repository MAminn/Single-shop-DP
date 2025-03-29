import {
  runBackendEffect,
  serializeBackendEffectResult,
} from "#root/shared/backend/effect";
import { provideDatabase, publicProcedure } from "#root/shared/trpc/server";
import { z } from "zod";
import { createFile } from "./createFile";
import { createWriteStream } from "node:fs";
import { unlink } from "node:fs/promises";
import { v7 } from "uuid";
import sharp from "sharp";
import { Effect } from "effect";

// Create a file upload procedure
export const uploadFileProcedure = publicProcedure
  .input(
    z.object({
      // This will be populated from FormData
      file: z.any(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const session = ctx.clientSession;

    if (!session || (session.role !== "admin" && session.role !== "vendor")) {
      return {
        success: false as const,
        error: "Unauthorized",
      };
    }

    // Handle file upload
    try {
      // Generate a unique ID for the file
      const fileId = v7();
      const filename = `${fileId}.webp`;

      // Process the image with sharp
      const transformer = sharp()
        .resize({
          height: 1000,
        })
        .webp({
          quality: 90,
        });

      // Create a write stream to save the file
      const writeFileStream = createWriteStream(`./uploads/${filename}`);

      // Get the file from FormData
      if (!input.file?.buffer) {
        return {
          success: false as const,
          error: "Invalid file data",
        };
      }

      // Process and save the file
      await transformer.toFile(`./uploads/${filename}`);

      // Save the file record to the database
      const result = await runBackendEffect(
        createFile({
          diskname: filename,
        }).pipe(provideDatabase(ctx))
      ).then(serializeBackendEffectResult);

      // Return the result
      return result;
    } catch (error) {
      console.error("File upload error:", error);
      return {
        success: false as const,
        error: "Failed to upload file",
      };
    }
  });
