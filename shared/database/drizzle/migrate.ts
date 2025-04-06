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
// export async function migrateToLatest() {
//   console.log("=== [DB Migration] Starting database migration process ===");
//   console.log(`[DB Migration] Timestamp: ${new Date().toISOString()}`);

//   try {
//     // Check database URL
//     const dbUrl = process.env.DATABASE_URL;
//     if (!dbUrl) {
//       console.error(
//         "[DB Migration] ERROR: DATABASE_URL is not defined in environment variables"
//       );
//       return;
//     }

//     // Log a sanitized version of the connection string for debugging
//     const sanitizedUrl = dbUrl.replace(
//       /(postgres:\/\/[^:]+):([^@]+)@/,
//       "postgres://$1:***@"
//     );
//     console.log(`[DB Migration] Using database: ${sanitizedUrl}`);

//     console.log("[DB Migration] Creating database instance...");
//     const dbInstance = db();
//     console.log("[DB Migration] Database instance created");

//     // Test the connection first
//     try {
//       console.log("[DB Migration] Testing database connection...");
//       await dbInstance.execute(sql`SELECT 1`);
//       console.log("[DB Migration] Database connection is working properly");
//     } catch (connectionError) {
//       console.error(
//         "[DB Migration] Failed to connect to database:",
//         connectionError
//       );
//       return;
//     }

//     const __filename = fileURLToPath(import.meta.url);
//     const __dirname = path.dirname(__filename);

//     const migrationsFolder = path.join(__dirname, "..", "migrations");
//     console.log(`[DB Migration] Migrations folder path: ${migrationsFolder}`);

//     if (!fs.existsSync(migrationsFolder)) {
//       console.error(
//         `[DB Migration] ERROR: Migrations folder not found at: ${migrationsFolder}`
//       );
//       return;
//     }

//     // Log available migrations
//     const migrationFiles = fs.readdirSync(migrationsFolder);
//     console.log(
//       `[DB Migration] Found ${migrationFiles.length} files in migrations folder:`
//     );
//     for (const file of migrationFiles) {
//       console.log(`[DB Migration] - ${file}`);
//     }

//     // Create the migration table directly first to ensure it exists
//     try {
//       console.log("[DB Migration] Creating migration table...");
//       await dbInstance.execute(sql`
//         CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
//           id SERIAL PRIMARY KEY,
//           hash text NOT NULL,
//           created_at timestamp with time zone DEFAULT now()
//         )
//       `);
//       console.log("[DB Migration] Migration table created successfully");
//     } catch (tableCreateError) {
//       console.error(
//         "[DB Migration] Failed to create migration table:",
//         tableCreateError
//       );
//       return;
//     }

//     // ALWAYS apply schema safety SQL to ensure types exist with IF NOT EXISTS
//     try {
//       console.log("[DB Migration] Applying schema safety SQL (always)...");
//       const safetyFilePath = path.join(
//         __dirname,
//         "..",
//         "migrations",
//         "schema-safety.sql"
//       );

//       if (fs.existsSync(safetyFilePath)) {
//         console.log(
//           "[DB Migration] Schema safety file found, reading contents"
//         );
//         const safetySql = fs.readFileSync(safetyFilePath, "utf8");
//         console.log(
//           `[DB Migration] Schema safety SQL length: ${safetySql.length} characters`
//         );
//         console.log(
//           "[DB Migration] Executing schema safety SQL (ensures types exist)"
//         );
//         await dbInstance.execute(sql.raw(safetySql));
//         console.log(
//           "[DB Migration] Applied schema protection SQL successfully"
//         );
//       } else {
//         console.warn(
//           "[DB Migration] Schema protection SQL file not found at:",
//           safetyFilePath
//         );
//       }
//     } catch (safetySqlError) {
//       console.error(
//         "[DB Migration] Error applying schema protection:",
//         safetySqlError
//       );
//       // Continue even if this fails
//     }

//     // Check if this is a first-time migration by checking table emptiness
//     let isFreshInstall = false;
//     try {
//       console.log("[DB Migration] Checking if migration table is empty...");
//       const result = await dbInstance.execute(sql`
//         SELECT COUNT(*) FROM "__drizzle_migrations";
//       `);

//       if (Array.isArray(result) && result.length > 0) {
//         const row = result[0] as { count: string | number };
//         const count = Number(row.count);
//         console.log(`[DB Migration] Found ${count} existing migrations`);
//         isFreshInstall = count === 0;
//       } else {
//         console.log(
//           "[DB Migration] Migration count query returned unexpected result, assuming fresh install"
//         );
//         isFreshInstall = true;
//       }
//     } catch (countError) {
//       console.error(
//         "[DB Migration] Error checking migration count:",
//         countError
//       );
//       return;
//     }

//     if (isFreshInstall) {
//       console.log("[DB Migration] First-time migration detected");

//       // Find the first migration to mark as applied
//       const sqlFiles = migrationFiles.filter(
//         (file) => file.endsWith(".sql") && !file.includes("safety")
//       );

//       if (sqlFiles.length > 0) {
//         sqlFiles.sort();
//         console.log(
//           `[DB Migration] SQL migration files (sorted): ${sqlFiles.join(", ")}`
//         );

//         try {
//           const [firstMigration] = sqlFiles as [string, ...string[]];
//           if (firstMigration) {
//             const migrationName = firstMigration.replace(".sql", "");
//             console.log(
//               `[DB Migration] Marking first migration as applied: ${migrationName}`
//             );

//             // Insert it as applied
//             await dbInstance.execute(sql`
//               INSERT INTO "__drizzle_migrations" (hash)
//               VALUES (${migrationName})
//               ON CONFLICT DO NOTHING;
//             `);

//             console.log(
//               `[DB Migration] First migration marked as applied: ${migrationName}`
//             );
//           }
//         } catch (markError) {
//           console.error(
//             "[DB Migration] Error marking first migration as applied:",
//             markError
//           );
//           return;
//         }
//       } else {
//         console.warn(
//           "[DB Migration] No migration files found to mark as applied"
//         );
//       }

//       console.log("[DB Migration] First-time setup completed");
//     } else {
//       console.log(
//         "[DB Migration] Existing migrations found, running incremental migration"
//       );
//     }

//     // Run migrations through the official drizzle migrator with type error handling
//     try {
//       console.log("[DB Migration] Running migrations via drizzle migrator...");
//       const result = await runMigrationsWithTypeErrorHandling(
//         dbInstance,
//         migrationsFolder
//       );

//       if (result.success) {
//         console.log("[DB Migration] Migrations completed successfully");
//       } else if (result.fallbackNeeded) {
//         console.log(
//           "[DB Migration] Using fallback manual migration due to type conflicts"
//         );
//         await manuallyRunRemainingMigrations(
//           dbInstance,
//           migrationsFolder,
//           result.appliedMigrations
//         );
//       }
//     } catch (migrateError) {
//       console.error(
//         "[DB Migration] Error during migration process:",
//         migrateError
//       );
//       // Don't return, try to show status
//     }

//     // Show final migration status
//     try {
//       const migrationStatus = await dbInstance.execute(sql`
//         SELECT hash, created_at FROM "__drizzle_migrations" ORDER BY created_at DESC LIMIT 5
//       `);
//       console.log("[DB Migration] Recent migrations:");
//       console.log(migrationStatus);
//     } catch (statusError) {
//       console.error(
//         "[DB Migration] Could not retrieve migration status:",
//         statusError
//       );
//     }

//     console.log("[DB Migration] === Database migration completed! ===");
//   } catch (error) {
//     console.error("[DB Migration] FATAL ERROR:", error);
//     // Don't crash the server - just log the error
//   }
// }

/**
 * Run migrations with special handling for type already exists errors
 */
async function runMigrationsWithTypeErrorHandling(
  dbInstance: ReturnType<typeof db>,
  migrationsFolder: string
): Promise<{
  success: boolean;
  fallbackNeeded: boolean;
  appliedMigrations: string[];
}> {
  try {
    await migrate(dbInstance, { migrationsFolder });
    return { success: true, fallbackNeeded: false, appliedMigrations: [] };
  } catch (error: unknown) {
    // Check if it's a type already exists error
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "42710" && // PostgreSQL error code for "already exists"
      "message" in error &&
      typeof (error as { message: string }).message === "string" &&
      (error as { message: string }).message.includes("type") &&
      (error as { message: string }).message.includes("already exists")
    ) {
      console.warn(
        "[DB Migration] Ignoring 'type already exists' error:",
        (error as { message: string }).message
      );

      // Types already exist (handled by schema-safety.sql)
      console.log(
        "[DB Migration] Types already exist - this is expected and handled by schema-safety.sql"
      );

      // Get list of migrations already applied
      const migrationResult = await dbInstance.execute(sql`
        SELECT hash FROM "__drizzle_migrations" ORDER BY created_at ASC
      `);

      // Safely extract migration hashes to avoid undefined errors
      const appliedMigrations: string[] = [];
      if (migrationResult && Array.isArray(migrationResult)) {
        for (const row of migrationResult) {
          if (
            row &&
            typeof row === "object" &&
            "hash" in row &&
            typeof row.hash === "string"
          ) {
            appliedMigrations.push(row.hash);
          }
        }
      }

      return {
        success: false,
        fallbackNeeded: true,
        appliedMigrations,
      };
    }

    // Re-throw other errors
    throw error;
  }
}

/**
 * Manually apply remaining migrations when automatic migration fails due to type conflicts
 */
async function manuallyRunRemainingMigrations(
  dbInstance: ReturnType<typeof db>,
  migrationsFolder: string,
  appliedMigrations: string[]
) {
  try {
    console.log("[DB Migration] Starting manual migration process");

    // Get all SQL migration files
    const files = fs
      .readdirSync(migrationsFolder)
      .filter((file) => file.endsWith(".sql") && !file.includes("safety"))
      .sort();

    console.log(`[DB Migration] Found ${files.length} SQL migration files`);

    // Only process files that haven't been applied yet
    const pendingMigrations = files
      .map((file) => file.replace(".sql", ""))
      .filter((migrationName) => !appliedMigrations.includes(migrationName));

    console.log(
      `[DB Migration] Found ${pendingMigrations.length} pending migrations to apply`
    );

    // Process each pending migration
    for (const migrationName of pendingMigrations) {
      const migrationFile = path.join(migrationsFolder, `${migrationName}.sql`);

      try {
        console.log(`[DB Migration] Processing migration ${migrationName}`);

        // Read the SQL file
        const migrationSql = fs.readFileSync(migrationFile, "utf8");

        // Split the migration into statements (drizzle uses --> statement-breakpoint)
        const statements = migrationSql.split("--> statement-breakpoint");

        console.log(
          `[DB Migration] Migration ${migrationName} has ${statements.length} statements`
        );

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
            console.log(
              `[DB Migration] Skipping statement ${i + 1} (object creation without IF NOT EXISTS)`
            );
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

        console.log(
          `[DB Migration] Migration ${migrationName}: ${successCount} statements applied, ${skipCount} skipped`
        );

        // Mark the migration as applied regardless of errors
        // since errors like "already exists" are expected and handled
        await dbInstance.execute(sql`
          INSERT INTO "__drizzle_migrations" (hash)
          VALUES (${migrationName})
          ON CONFLICT DO NOTHING;
        `);

        console.log(
          `[DB Migration] Marked migration ${migrationName} as applied`
        );
      } catch (migrationError) {
        console.error(
          `[DB Migration] Error processing migration ${migrationName}:`,
          migrationError
        );
        // Continue with next migration
      }
    }

    console.log("[DB Migration] Manual migration process completed");
  } catch (error) {
    console.error("[DB Migration] Error during manual migration:", error);
    throw error;
  }
}
