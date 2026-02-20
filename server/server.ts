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
import { uploadFileApiPlugin } from "#root/backend/file/upload-file/api";
import { emailServiceMiddleware } from "#root/shared/email/middleware.server";
import { fincartWebhookPlugin } from "#root/backend/orders/fincart-webhook/api.js";
import { ensureDefaultStoreVendor } from "#root/shared/database/bootstrap.js";
import { listActiveClientConfigsRaw } from "#root/backend/pixel-tracking/pixel-config/ssr.js";
import { trackBeaconPlugin } from "#root/server/routes/track.js";

// Normalize env vars — Coolify sometimes injects a leading '=' into values
function normalizeEnv(key: string): string {
  const val = (process.env[key] || "").replace(/^=/, "").trim();
  process.env[key] = val; // Write back so downstream code sees the clean value
  return val;
}
for (const key of [
  "NODE_ENV",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
  "DATABASE_URL",
  "BASE_URL",
  "PUBLIC_ORIGIN",
  "PORT",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASSWORD",
]) {
  if (process.env[key]) normalizeEnv(key);
}

const isProduction = process.env.NODE_ENV === "production";

const getRootPath = () => {
  const serverDir = dirname(fileURLToPath(import.meta.url));
  // When running from source (tsx ./server/server.ts), go one level up.
  // When running from build (node build/server/server.js), go two levels up.
  const isBuildDir = serverDir.includes("build");
  return resolve(serverDir, isBuildDir ? "../.." : "..");
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

const port = Number.parseInt(process.env.PORT || "3000", 10) || 3000;
const hmrPort = Number.parseInt(process.env.HMR_PORT || "24678", 10) || 24678;

export const instance = Fastify({
  ...(isProduction ? productionFastifyConfig : developmentFastifyConfig),
  bodyLimit: 100 * 1024 * 1024,
  routerOptions: {
    maxParamLength: 1000, // tRPC batch requests encode comma-separated procedure names in a single :path param
  },
});

// Configure body size limit for all routes
instance.addHook("onRoute", (routeOptions) => {
  if (
    routeOptions.method === "POST" ||
    routeOptions.method === "PUT" ||
    routeOptions.method === "PATCH"
  ) {
    routeOptions.bodyLimit = 100 * 1024 * 1024; // 100MB
  }
});

async function buildServer() {
  // Health check endpoint - registered FIRST so it's always reachable
  instance.get("/health", async (_request, reply) => {
    return reply.send({ status: "ok", timestamp: Date.now() });
  });

  await instance.register(import("@fastify/compress"), {
    global: true,
  });

  await instance.register(import("@fastify/cookie"));

  await instance.register(import("@fastify/multipart"), {
    limits: {
      fileSize: 100 * 1024 * 1024, // 30MB per file
      files: 10, // Allow up to 10 files
      fieldSize: 5 * 1024 * 1024, // 5MB for non-file fields
      parts: 50, // Allow up to 50 parts in the request
      headerPairs: 100, // Allow up to 100 header pairs
    },
  });

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
      prefix: "/assets",
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

  await instance.register(import("@fastify/static"), {
    root: `${root}/uploads`,
    decorateReply: false,
    wildcard: false,
    prefix: "/uploads",
  });

  // Dynamic route for uploaded files (wildcard: false only registers files existing at boot)
  instance.get("/uploads/*", async (request, reply) => {
    const filePath = (request.params as { "*": string })["*"];
    const fullPath = `${root}/uploads/${filePath}`;
    const { createReadStream, existsSync } = await import("node:fs");
    if (!existsSync(fullPath)) {
      return reply.code(404).send({ error: "File not found" });
    }
    const stream = createReadStream(fullPath);
    // Determine content type from extension
    const ext = fullPath.split(".").pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
      svg: "image/svg+xml",
      avif: "image/avif",
      ico: "image/x-icon",
    };
    const contentType = mimeTypes[ext || ""] || "application/octet-stream";
    return reply.type(contentType).send(stream);
  });

  await instance.register(drizzleFastifyPlugin);

  // Bootstrap: Ensure default store vendor exists (single-shop mode)
  await ensureDefaultStoreVendor();

  await instance.register(emailServiceMiddleware);

  await instance.register(authFasitfyMiddleware);

  await instance.register(fastifyTRPCMiddleware);

  await instance.register(authFastifyPlugin, {
    prefix: "/api/auth",
  });

  await instance.register(uploadFileApiPlugin);

  // Register Fincart webhook endpoint
  await instance.register(fincartWebhookPlugin, {
    prefix: "/api/webhooks/fincart",
  });

  // Register tracking beacon endpoint
  await instance.register(trackBeaconPlugin, {
    prefix: "/api/track",
  });

  // Add product detail route handler - updated to new format
  instance.get("/shop/@productId", async (request, reply) => {
    const pageContextInit = {
      urlOriginal: request.url,
      headersOriginal: request.headers,
      routeParams: request.params,
      db: request.db,
      clientSession: request.clientSession,
    };
    const pageContext = await renderPage(pageContextInit);
    const { httpResponse } = pageContext;

    if (!httpResponse) {
      return reply.code(404).send("Product page not found");
    }

    reply.status(httpResponse.statusCode);

    for (const [name, value] of Object.entries(httpResponse.headers)) {
      if (value) reply.header(name, value);
    }

    httpResponse.pipe(reply.raw);

    return reply;
  });

  // Add a debug endpoint for database connection and migration status
  instance.get("/api/debug/db-status", async (request, reply) => {
    try {
      // Test database connection
      const connectionTest = await request.db.execute(
        "SELECT 1 as connection_test",
      );

      // Test database version
      const pgVersion = await request.db.execute(
        "SELECT version() as pg_version",
      );

      // Check migration table existence
      const migrationTableExists = await request.db.execute(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = '__drizzle_migrations'
        ) as table_exists
      `);

      // Check migration status if table exists
      let migrations = null;
      const tableExists =
        Array.isArray(migrationTableExists) &&
        migrationTableExists.length > 0 &&
        migrationTableExists[0]?.table_exists;

      if (tableExists) {
        migrations = await request.db.execute(
          'SELECT id, hash, created_at FROM "__drizzle_migrations" ORDER BY created_at DESC LIMIT 10',
        );
      }

      // Get database info
      const dbInfo = await request.db.execute(`
        SELECT 
          current_database() as current_db,
          current_schema() as current_schema,
          inet_server_addr() as server_ip,
          inet_server_port() as server_port
      `);

      const dbInfoData =
        Array.isArray(dbInfo) && dbInfo.length > 0 ? dbInfo[0] : {};

      return {
        success: true,
        connectionTest,
        pgVersion,
        migrationTableExists: tableExists,
        migrations,
        dbInfo: dbInfoData,
        serverTimestamp: new Date().toISOString(),
        envVars: {
          nodeEnv: process.env.NODE_ENV,
          databaseUrl: process.env.DATABASE_URL
            ? process.env.DATABASE_URL.replace(
                /(postgres:\/\/[^:]+):([^@]+)@/,
                "postgres://$1:***@",
              )
            : "not defined",
        },
      };
    } catch (error) {
      console.error("[Debug Endpoint] Database connection test failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      };
    }
  });

  // Add a manual migration initialization endpoint
  instance.get("/api/debug/init-migrations", async (request, reply) => {
    try {
      // First test the connection
      await request.db.execute("SELECT 1 as test");

      // Create the migration table
      await request.db.execute(`
        CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
          id SERIAL PRIMARY KEY,
          hash text NOT NULL,
          created_at timestamp with time zone DEFAULT now()
        )
      `);

      // Check if we have migrations in the table
      const migrationCheck = await request.db.execute(`
        SELECT COUNT(*) as count FROM "__drizzle_migrations"
      `);

      const count =
        Array.isArray(migrationCheck) && migrationCheck.length > 0
          ? Number(migrationCheck[0].count)
          : 0;

      if (count === 0) {
        // Find the first migration file
        const fs = await import("node:fs");
        const path = await import("node:path");

        const { fileURLToPath } = await import("node:url");
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const migrationsFolder = path.resolve(
          __dirname,
          "..",
          "shared",
          "database",
          "migrations",
        );

        if (fs.existsSync(migrationsFolder)) {
          const files = fs.readdirSync(migrationsFolder);

          // Filter SQL files that aren't the safety file
          const sqlFiles = files.filter(
            (file) => file.endsWith(".sql") && !file.includes("safety"),
          );

          if (sqlFiles.length > 0) {
            // Sort the files
            sqlFiles.sort();

            // Mark the first migration as applied
            const firstMigration = sqlFiles[0];
            if (firstMigration) {
              const migrationName = firstMigration.replace(".sql", "");

              await request.db.execute(`
                INSERT INTO "__drizzle_migrations" (hash)
                VALUES ('${migrationName}')
                ON CONFLICT DO NOTHING
              `);
            }
          }
        }
      }

      return {
        success: true,
        message: "Manual migration initialization completed",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error(
        "[Manual Migration] Error during manual migration initialization:",
        error,
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      };
    }
  });

  instance.all(
    "/*",
    {
      logLevel: "silent",
    },
    async (request, reply) => {
      // Fetch active pixel configs for SSR script injection (best-effort)
      const pixelConfigs = await listActiveClientConfigsRaw(request.db);

      const pageContextInit = {
        urlOriginal: request.raw.url || "",
        headersOriginal: request.headers,
        db: request.db,
        clientSession: request.clientSession,
        pixelConfigs,
      };

      let pageContext: Awaited<ReturnType<typeof renderPage>>;
      try {
        pageContext = await renderPage(pageContextInit);
      } catch (err) {
        console.error(
          `[Vike Error] renderPage threw for ${request.raw.url}:`,
          err,
        );
        return reply.code(500).send("Internal Server Error");
      }
      const { httpResponse } = pageContext;
      if (!httpResponse) {
        console.warn(`[Vike 404] No httpResponse for: ${request.raw.url}`);
        return reply.callNotFound();
      }

      const { statusCode, headers } = httpResponse;
      for (const header of headers) {
        reply.raw.setHeader(header[0], header[1]);
      }

      reply.status(statusCode);
      httpResponse.pipe(reply.raw);
      return reply;
    },
  );

  await instance.ready();
  return instance;
}

async function main() {
  console.info(
    `[Startup] NODE_ENV=${process.env.NODE_ENV}, isProduction=${isProduction}`,
  );
  console.info(`[Startup] Root path: ${root}`);
  console.info(`[Startup] Port: ${port}`);

  // Verify dist directory exists in production
  if (isProduction) {
    const { existsSync } = await import("node:fs");
    const distServerExists = existsSync(`${root}/dist/server/entry.mjs`);
    const distClientExists = existsSync(`${root}/dist/client`);
    console.info(`[Startup] dist/server/entry.mjs exists: ${distServerExists}`);
    console.info(`[Startup] dist/client exists: ${distClientExists}`);
    if (!distServerExists) {
      console.error(
        "[Startup] CRITICAL: dist/server/entry.mjs missing! Vike pages will not work.",
      );
    }
  }

  const fastify = await buildServer();

  fastify.listen({ port: port, host: "0.0.0.0" }, (err) => {
    console.info(`Server running at http://localhost:${port}`);
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
  });
}

main();
