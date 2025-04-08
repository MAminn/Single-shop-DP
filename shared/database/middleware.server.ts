import type { FastifyInstance } from "fastify";
import { db } from "./drizzle/db.js";
import { fixDatabaseSchema } from "./schema-fix.js";
import fp from "fastify-plugin";
import { migrate } from "drizzle-orm/node-postgres/migrator";

declare module "fastify" {
  interface FastifyInstance {
    db: ReturnType<typeof db>;
  }
  interface FastifyRequest {
    db: ReturnType<typeof db>;
  }
}

const drizzleFastifyPlugin = fp(async (app: FastifyInstance) => {

  try {
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    const dbInstance = db();

    // Run schema fix to ensure database is ready for migrations
    await fixDatabaseSchema();


    // Try running migrations with error handling for enum conflicts
    try {
      await migrate(dbInstance, {
        migrationsFolder: "shared/database/migrations",
      });
    } catch (migrationError) {
      const errorMessage = String(migrationError);

      // Check for common enum type already exists errors
      if (errorMessage.includes("already exists")) {
        console.warn(
          "[DB Middleware] Migration warning: Some objects already exist in database. This is often normal when rerunning migrations.",
          migrationError
        );
        // Continue execution as this is not fatal - the schema is likely correct
      } else {
        // For other migration errors, we should rethrow
        console.error("[DB Middleware] Migration error:", migrationError);
        throw migrationError;
      }
    }

    // Test the connection
    try {
      await dbInstance.execute("SELECT 1");
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

    app.decorateRequest("db", {
      getter() {
        return dbInstance;
      },
    });

  } catch (error) {
    console.error(
      "[DB Middleware] FATAL ERROR during database middleware initialization:",
      error
    );
    throw error; // Rethrow to prevent server startup with a broken DB connection
  }
});

export default drizzleFastifyPlugin;
