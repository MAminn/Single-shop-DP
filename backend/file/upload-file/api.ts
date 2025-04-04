import { runBackendEffect } from "#root/shared/backend/effect";
import type { FastifyInstance } from "fastify";
import { createWriteStream } from "node:fs";
import { unlink } from "node:fs/promises";
import sharp from "sharp";
import { v7 } from "uuid";
import { createFile } from "./createFile";
import { DatabaseClientService } from "#root/shared/database/drizzle/db";
import { Effect } from "effect";

export const uploadFileApiPlugin = (app: FastifyInstance) => {
	app.post("/file", async (req, res) => {
		const session = req.clientSession;

		const data = await req.file();
		if (!data) {
			return res
				.status(400)
				.send({ success: false, error: "No file provided" });
		}

		// if (!data.type.startsWith("image/")) {
		// 	return res
		// 		.status(400)
		// 		.send({ success: false, error: "Invalid file type" });
		// }

		try {
			const transformer = sharp()
				.resize({
					height: 1000,
				})
				.webp({
					quality: 90,
				});

			const fileId = v7();

			const writeFileStream = createWriteStream(`./uploads/${fileId}.webp`);

			await new Promise<void>((resolve, reject) => {
				data.file
					.pipe(transformer)
					.pipe(writeFileStream)
					.on("finish", resolve)
					.on("error", reject);
			}).catch(async () => {
				await unlink(`./uploads/${fileId}.webp`);
			});

			const result = await runBackendEffect(
				createFile({
					diskname: `${fileId}.webp`,
				}).pipe(Effect.provideService(DatabaseClientService, req.db)),
			);

			if (!result.success) {
				await unlink(`./uploads/${fileId}.webp`);
				return res
					.status(500)
					.send({ success: false, error: "Failed to upload file" });
			}

			return res.status(200).send({
				success: true,
				result: result.result,
			});
		} catch (err) {
			return res
				.status(500)
				.send({ success: false, error: "Failed to upload file" });
		}
	});
};
