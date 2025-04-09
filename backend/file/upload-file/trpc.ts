import {
  runBackendEffect,
  serializeBackendEffectResult,
} from "#root/shared/backend/effect";
import { provideDatabase, publicProcedure } from "#root/shared/trpc/server";
import { z } from "zod";
import { createFile } from "./createFile";
import { createWriteStream } from "node:fs";
import { unlink, writeFile } from "node:fs/promises";
import { v7 } from "uuid";
import sharp from "sharp";
import { Effect } from "effect";

// Create a file upload procedure
export const uploadFileProcedure = publicProcedure
  .input(
    z.object({
      // This will be populated from FormData
      file: z.object({
        name: z.string(),
        type: z.string(),
        buffer: z.instanceof(Uint8Array),
      }),
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
      const tempFilePath = `./uploads/temp_${fileId}`;
      const finalFilePath = `./uploads/${filename}`;

      // First save the buffer to a temporary file
      await writeFile(tempFilePath, Buffer.from(input.file.buffer));

      // Process the image with sharp
      await sharp(tempFilePath)
        .resize({
          height: 1000,
        })
        .webp({
          quality: 90,
        })
        .toFile(finalFilePath);

      // Remove the temporary file
      await unlink(tempFilePath).catch((err) =>
        console.error("Error deleting temp file:", err)
      );

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
