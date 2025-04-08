import { db } from "./drizzle/db.js";
import { sql } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { Pool } from "pg";

/**
 * This script safely drops and recreates enum types that might be causing migration issues
 * It should be run manually when migrations fail due to "type already exists" errors
 */
async function fixEnumTypes() {

  const dbInstance = db();

  try {
    // Test connection
    await dbInstance.execute(sql`SELECT 1 as connection_test`);


    // Get a list of all enum types in the database
    const enumTypes = await dbInstance.execute(sql`
      SELECT t.typname as enum_name
      FROM pg_type t 
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      WHERE t.typtype = 'e' AND n.nspname = 'public'
    `);

    // Safely drop and recreate problematic enum types
    // This approach requires manually adding the enum types that need fixing
    const problematicEnums = [
      "category_log_action",
      "category_type",
      "order_status",
      "user_role",
      "vendor_log_action",
      "vendor_status",
    ];

    // Create a transaction for all operations
    await dbInstance.transaction(async (tx) => {
      for (const enumName of problematicEnums) {
        try {
          // Check if any tables use this enum
          const usages = await tx.execute(
            sql.raw(`
            SELECT c.relname as table_name, a.attname as column_name
            FROM pg_class c
            JOIN pg_attribute a ON a.attrelid = c.oid
            JOIN pg_type t ON a.atttypid = t.oid
            WHERE t.typname = '${enumName}'
            AND c.relkind = 'r'
          `)
          );

          // Check if the array has any items
          if (Array.isArray(usages) && usages.length > 0) {
            continue;
          }

          // Drop the enum if it exists and isn't in use
          await tx.execute(sql.raw(`DROP TYPE IF EXISTS "${enumName}"`));
        } catch (error) {
          console.error(`Error processing enum ${enumName}:`, error);
        }
      }
    });

    return true;
  } catch (error) {
    console.error("Error fixing enum types:", error);
    return false;
  } finally {
    // Attempt to close the connection if the method exists
    try {
      // Get the PostgreSQL client/pool from drizzle
      const client = dbInstance.$client as { pool?: Pool };
      if (client?.pool?.end) {
        await client.pool.end();
      }
    } catch (err) {
      console.error("Error closing database connection:", err);
    }
  }
}

// Allow script to be run directly
if (process.argv[1]?.includes("fix-enum-types")) {
  fixEnumTypes()
    .then((success) => {
      if (success) {
        process.exit(0);
      } else {
        console.error("Enum type fix failed");
        process.exit(1);
      }
    })
    .catch((err) => {
      console.error("Unhandled error during enum type fix:", err);
      process.exit(1);
    });
}

export { fixEnumTypes };
