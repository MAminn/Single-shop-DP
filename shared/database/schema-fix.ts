import { db } from "./drizzle/db.js";
import { sql } from "drizzle-orm";

// Simple logger for this script
const log = {
  info: (message: string, ...args: unknown[]) =>
    console.log(`[Schema-Fix] INFO: ${message}`, ...args),
  error: (message: string, ...args: unknown[]) =>
    console.error(`[Schema-Fix] ERROR: ${message}`, ...args),
};

/**
 * This script can be run to fix common database schema issues
 * It safely adds missing objects if they don't exist
 */
export async function fixDatabaseSchema() {
  log.info("Starting database schema repair...");

  try {
    const dbInstance = db();
    log.info("Database connection established");

    // Test connection
    await dbInstance.execute(sql`SELECT 1 as connection_test`);
    log.info("Database connection successful");

    // ========== Fix migrations table if needed ==========
    log.info("Creating migrations table if it doesn't exist...");
    await dbInstance.execute(sql`
      CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL,
        created_at timestamp with time zone DEFAULT now()
      )
    `);

    // Check if we have duplicate migrations
    log.info("Checking for duplicate migrations...");
    const duplicates = await dbInstance.execute(sql`
      SELECT hash, COUNT(*) as count
      FROM "__drizzle_migrations"
      GROUP BY hash
      HAVING COUNT(*) > 1
    `);

    if (Array.isArray(duplicates) && duplicates.length > 0) {
      log.info(
        `Found ${duplicates.length} duplicate migrations, cleaning up...`
      );

      for (const dup of duplicates) {
        if (
          dup &&
          typeof dup === "object" &&
          "hash" in dup &&
          typeof dup.hash === "string"
        ) {
          const hash = dup.hash;
          log.info(`Removing duplicate entries for migration: ${hash}`);

          // Keep only the oldest entry for each migration
          await dbInstance.execute(sql`
            WITH ranked_migrations AS (
              SELECT id, hash, created_at,
                     ROW_NUMBER() OVER (PARTITION BY hash ORDER BY created_at ASC) as rn
              FROM "__drizzle_migrations"
              WHERE hash = ${hash}
            )
            DELETE FROM "__drizzle_migrations"
            WHERE id IN (
              SELECT id FROM ranked_migrations WHERE rn > 1
            )
          `);
        }
      }
    } else {
      log.info("No duplicate migrations found");
    }

    log.info("Database schema repair completed successfully");
    return true;
  } catch (error) {
    log.error("Error during schema repair:", error);
    return false;
  }
}

// Allow script to be run directly
if (process.argv[1]?.includes("schema-fix")) {
  fixDatabaseSchema()
    .then((success) => {
      if (success) {
        log.info("Schema repair completed successfully");
        process.exit(0);
      } else {
        log.error("Schema repair failed");
        process.exit(1);
      }
    })
    .catch((err) => {
      log.error("Unhandled error during schema repair:", err);
      process.exit(1);
    });
}
