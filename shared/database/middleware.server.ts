import type { FastifyInstance } from "fastify";
import { db } from "./drizzle/db";
import { migrateToLatest } from "./drizzle/migrate";
import fp from "fastify-plugin";

declare module "fastify" {
  interface FastifyInstance {
    db: ReturnType<typeof db>;
  }
  interface FastifyRequest {
    db: ReturnType<typeof db>;
  }
}

const drizzleFastifyPlugin = fp(async (app: FastifyInstance) => {
  console.log("[DB Middleware] Initializing database middleware...");

  try {
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      console.error(
        "[DB Middleware] ERROR: DATABASE_URL environment variable is not set"
      );
      throw new Error("DATABASE_URL environment variable is not set");
    }

    console.log("[DB Middleware] Starting database migrations...");
    await migrateToLatest();
    console.log("[DB Middleware] Database migrations completed");

    console.log("[DB Middleware] Initializing database connection...");
    const dbInstance = db();
    console.log("[DB Middleware] Database connection initialized");

    // Test the connection
    try {
      console.log("[DB Middleware] Testing database connection...");
      await dbInstance.execute("SELECT 1");
      console.log("[DB Middleware] Database connection is working properly");
    } catch (connectionError) {
      console.error(
        "[DB Middleware] ERROR: Failed to connect to database:",
        connectionError
      );
      throw connectionError;
    }

    app.decorate("db", {
      getter() {
        return dbInstance;
      },
    });
    console.log(
      "[DB Middleware] Decorated Fastify instance with 'db' property"
    );

    app.decorateRequest("db", {
      getter() {
        return dbInstance;
      },
    });
    console.log("[DB Middleware] Decorated Fastify request with 'db' property");

    console.log("[DB Middleware] Database middleware initialized successfully");
  } catch (error) {
    console.error(
      "[DB Middleware] FATAL ERROR during database middleware initialization:",
      error
    );
    throw error; // Rethrow to prevent server startup with a broken DB connection
  }
});

export default drizzleFastifyPlugin;
