import Fastify from "fastify";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createDevMiddleware, renderPage } from "vike/server";
import { pipe } from "effect";
import drizzleFastifyPlugin from "#root/shared/database/middleware.server.js";
import "dotenv/config";
import { fastifyTRPCMiddleware } from "#root/shared/trpc/middleware.server.js";
import { authFasitfyMiddleware } from "#root/backend/auth/middleware.js";
import { authFastifyPlugin } from "#root/backend/auth/api.js";

const isProduction = process.env.NODE_ENV === "production";

const getRootPath = () => {
  return pipe(fileURLToPath(import.meta.url), dirname, (dirname) =>
    resolve(dirname, isProduction ? "../.." : "..")
  );
};

const root = getRootPath();

const productionFastifyConfig = { logger: true };
const developmentFastifyConfig = {
  logger: {
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
      },
    },
  },
};

const port = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000;
const hmrPort = process.env.HMR_PORT
  ? Number.parseInt(process.env.HMR_PORT, 10)
  : 24678;

export const instance = Fastify(
  isProduction ? productionFastifyConfig : developmentFastifyConfig
);

async function buildServer() {
  await instance.register(import("@fastify/compress"), {
    global: true,
  });

  await instance.register(import("@fastify/cookie"));

  if (isProduction) {
    await instance.register(import("@fastify/static"), {
      root: `${root}/dist/client`,
      decorateReply: false,
      wildcard: false,
    });

    await instance.register(import("@fastify/static"), {
      root: `${root}/assets`,
      decorateReply: false,
      wildcard: false,
      prefix: "/assets"
    });
  } else {
    // Do not use Connect-style middleware
    // in production if possible
    // to preserve performance
    await instance.register(import("@fastify/middie"));

    const viteDevMiddleware = (
      await createDevMiddleware({
        root,
        viteConfig: {
          server: {
            middlewareMode: true,
            hmr: { port: hmrPort },
          },
        },
      })
    ).devMiddleware;

    await instance.use(viteDevMiddleware);
  }

  await instance.register(drizzleFastifyPlugin);

  await instance.register(authFasitfyMiddleware);

  await instance.register(fastifyTRPCMiddleware);

  await instance.register(authFastifyPlugin, {
    prefix: "/api/auth",
  });

  instance.all(
    "/*",
    {
      logLevel: "silent",
    },
    async (request, reply) => {
      const pageContextInit = {
        urlOriginal: request.raw.url || "",
        headersOriginal: request.headers,
        db: request.db,
        clientSession: request.clientSession,
      };

      const pageContext = await renderPage(pageContextInit);
      const { httpResponse } = pageContext;
      if (!httpResponse) return reply.callNotFound();

      const { statusCode, headers } = httpResponse;
      for (const header of headers) {
        reply.raw.setHeader(header[0], header[1]);
      }

      reply.status(statusCode);
      httpResponse.pipe(reply.raw);
      return reply;
    }
  );

  await instance.ready();
  return instance;
}

async function main() {
  const fastify = await buildServer();

  fastify.listen({ port: port }, (err) => {
    console.info(`Server running at http://localhost:${port}`);
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
  });
}

main();
