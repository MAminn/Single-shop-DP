import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "./db";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import { sql } from "drizzle-orm";

/**
 * Migrates the database to the latest schema version
 *
 * @returns A promise that resolves when the migration is complete
 */
export async function migrateToLatest() {
  console.log("Starting database migration...");

  try {
    const dbInstance = db();

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const migrationsFolder = path.join(__dirname, "..", "migrations");

    if (!fs.existsSync(migrationsFolder)) {
      console.error(`Migrations folder not found at: ${migrationsFolder}`);
      return;
    }

    // Initialize the migration table if needed
    await initMigrationTable(dbInstance);

    // Check if this is a first-time migration
    const hasMigrations = await checkExistingMigrations(dbInstance);

    if (!hasMigrations) {
      // Apply schema safety SQL for first-time setup
      await applySchemaProtection(dbInstance, __dirname);

      // Mark migration as applied manually to skip the first migration
      await markFirstMigrationApplied(dbInstance);

      console.log(
        "Database initialized with safety checks. Migrations marked as applied."
      );
      return;
    }

    // Regular migrations - only apply new ones
    console.log("Running incremental migrations...");
    await migrate(dbInstance, { migrationsFolder });
    console.log("Incremental migrations completed");

    console.log("Database migration completed successfully!");
  } catch (error) {
    console.error("Database migration failed:", error);
    // Don't crash the server - just log the error
  }
}

/**
 * Initialize the migration table
 */
async function initMigrationTable(dbInstance: ReturnType<typeof db>) {
  try {
    await dbInstance.execute(sql`
      CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL,
        created_at timestamp with time zone DEFAULT now()
      );
    `);
    return true;
  } catch (error) {
    console.error("Error creating migration table:", error);
    return false;
  }
}

/**
 * Check if there are existing migrations
 */
async function checkExistingMigrations(dbInstance: ReturnType<typeof db>) {
  try {
    const result = await dbInstance.execute(sql`
      SELECT COUNT(*) FROM "__drizzle_migrations";
    `);

    if (Array.isArray(result) && result.length > 0) {
      const row = result[0] as { count: string | number };
      const count = Number(row.count);
      return count > 0;
    }
    return false;
  } catch (error) {
    console.error("Error checking existing migrations:", error);
    return false;
  }
}

/**
 * Apply schema protection SQL
 */
async function applySchemaProtection(
  dbInstance: ReturnType<typeof db>,
  dirPath: string
) {
  try {
    const safetyFilePath = path.join(
      dirPath,
      "..",
      "migrations",
      "schema-safety.sql"
    );

    if (fs.existsSync(safetyFilePath)) {
      const safetySql = fs.readFileSync(safetyFilePath, "utf8");
      await dbInstance.execute(sql.raw(safetySql));
      console.log("Applied schema protection SQL");
      return true;
    }

    console.warn("Schema protection SQL file not found at:", safetyFilePath);
    return false;
  } catch (error) {
    console.error("Error applying schema protection:", error);
    return false;
  }
}

/**
 * Mark first migration as applied to avoid conflicts
 */
async function markFirstMigrationApplied(dbInstance: ReturnType<typeof db>) {
  try {
    // Get migrations folder
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const migrationsFolder = path.join(__dirname, "..", "migrations");

    // Find the first migration file
    const files = fs.readdirSync(migrationsFolder);
    const sqlFiles = files.filter(
      (file) => file.endsWith(".sql") && !file.includes("safety")
    );

    if (sqlFiles.length === 0) {
      console.warn("No migration files found to mark as applied");
      return false;
    }

    // Sort numerically to get the first one
    sqlFiles.sort();

    if (sqlFiles.length > 0) {
      const [firstMigration] = sqlFiles as [string, ...string[]];
      const migrationName = firstMigration.replace(".sql", "");

      // Insert it as applied
      await dbInstance.execute(sql`
        INSERT INTO "__drizzle_migrations" (hash)
        VALUES (${migrationName})
        ON CONFLICT DO NOTHING;
      `);

      console.log(`Marked migration ${migrationName} as applied`);
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error marking first migration as applied:", error);
    return false;
  }
}
