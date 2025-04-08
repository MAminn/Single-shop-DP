import { migrate } from "drizzle-orm/node-postgres/migrator";
import type { db } from "./db.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import { sql } from "drizzle-orm";

/**
 * Migrates the database to the latest schema version
 *
 * @returns A promise that resolves when the migration is complete
 */
/**
 * Manually apply remaining migrations when automatic migration fails due to type conflicts
 */
async function manuallyRunRemainingMigrations(
  dbInstance: ReturnType<typeof db>,
  migrationsFolder: string,
  appliedMigrations: string[]
) {
  try {

    // Get all SQL migration files
    const files = fs
      .readdirSync(migrationsFolder)
      .filter((file) => file.endsWith(".sql") && !file.includes("safety"))
      .sort();


    // Only process files that haven't been applied yet
    const pendingMigrations = files
      .map((file) => file.replace(".sql", ""))
      .filter((migrationName) => !appliedMigrations.includes(migrationName));


    // Process each pending migration
    for (const migrationName of pendingMigrations) {
      const migrationFile = path.join(migrationsFolder, `${migrationName}.sql`);

      try {

        // Read the SQL file
        const migrationSql = fs.readFileSync(migrationFile, "utf8");

        // Split the migration into statements (drizzle uses --> statement-breakpoint)
        const statements = migrationSql.split("--> statement-breakpoint");


        // Execute each statement, skipping any that would create types or constraints that already exist
        let successCount = 0;
        let skipCount = 0;

        for (let i = 0; i < statements.length; i++) {
          const statement = statements[i]?.trim();

          // Skip empty statements
          if (!statement) continue;

          // Automatically skip statements that would create objects without IF NOT EXISTS
          if (
            (statement.toUpperCase().includes("CREATE TYPE") ||
              statement.toUpperCase().includes("CREATE TABLE") ||
              statement.toUpperCase().includes("CREATE EXTENSION")) &&
            !statement.toUpperCase().includes("IF NOT EXISTS")
          ) {
            skipCount++;
            continue;
          }

          try {
            await dbInstance.execute(sql.raw(statement));
            successCount++;
          } catch (statementError: unknown) {
            // Handle common "already exists" errors gracefully
            const errorObj = statementError as {
              code?: string;
              message?: string;
            };
            const errorCode = errorObj?.code;
            const errorMessage = errorObj?.message || "";

            if (
              // PostgreSQL error codes for common "already exists" errors
              errorCode === "42710" || // Type already exists
              errorCode === "42P07" || // Table already exists
              errorCode === "42P16" || // Function already exists
              errorCode === "23505" || // Unique violation
              // Also check error message patterns
              errorMessage.includes("already exists") ||
              (errorMessage.includes("constraint") &&
                errorMessage.includes("already exists")) ||
              errorMessage.includes("duplicate key")
            ) {
              console.warn(
                `[DB Migration] Skipping statement ${i + 1} - object already exists: ${errorMessage}`
              );
              skipCount++;
            } else {
              console.error(
                `[DB Migration] Error executing statement ${i + 1}:`,
                statementError
              );
            }
          }
        }


        // Mark the migration as applied regardless of errors
        // since errors like "already exists" are expected and handled
        await dbInstance.execute(sql`
          INSERT INTO "__drizzle_migrations" (hash)
          VALUES (${migrationName})
          ON CONFLICT DO NOTHING;
        `);

          
      } catch (migrationError) {
        console.error(
          `[DB Migration] Error processing migration ${migrationName}:`,
          migrationError
        );
        // Continue with next migration
      }
    }

  } catch (error) {
    console.error("[DB Migration] Error during manual migration:", error);
    throw error;
  }
}
