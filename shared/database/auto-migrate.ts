import pg from "pg";
import { readdir, readFile } from "fs/promises";
import path from "path";

/**
 * Runs all pending Drizzle migrations on server startup.
 * Gracefully handles "already exists" / "does not exist" errors.
 * Executes each SQL statement individually so one failure doesn't block others.
 */
export async function runMigrations(): Promise<void> {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    console.warn("⚠️  DATABASE_URL not set — skipping auto-migration");
    return;
  }

  let client: pg.Client | undefined;
  try {
    console.log("📡 [Auto-Migrate] Connecting to database...");
    client = new pg.Client({ connectionString: dbUrl });
    await client.connect();

    // Ensure migration tracking table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS __drizzle_migrations (
        id SERIAL PRIMARY KEY,
        hash VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const migrationsFolder = path.join(
      process.cwd(),
      "shared/database/migrations",
    );

    let migrationFiles: string[];
    try {
      migrationFiles = (await readdir(migrationsFolder))
        .filter((file) => file.endsWith(".sql"))
        .sort();
    } catch {
      console.log("📁 [Auto-Migrate] No migrations folder found — skipping");
      await client.end();
      return;
    }

    if (migrationFiles.length === 0) {
      console.log("📁 [Auto-Migrate] No migration files found — skipping");
      await client.end();
      return;
    }

    console.log(
      `📁 [Auto-Migrate] Found ${migrationFiles.length} migration files`,
    );

    let applied = 0;
    let skipped = 0;

    for (const file of migrationFiles) {
      // Check if migration was already applied
      const result = await client.query(
        "SELECT * FROM __drizzle_migrations WHERE hash = $1",
        [file],
      );

      if (result.rows.length > 0) {
        skipped++;
        continue;
      }

      console.log(`📝 [Auto-Migrate] Applying: ${file}`);
      const migrationSQL = await readFile(
        path.join(migrationsFolder, file),
        "utf-8",
      );

      // Drizzle uses `--> statement-breakpoint` as delimiter between statements
      const statements = migrationSQL
        .split("--> statement-breakpoint")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map((s) => {
          return s.endsWith(";") ? s.slice(0, -1).trim() : s;
        })
        .filter((s) => s.length > 0 && !s.startsWith("--"));

      for (const statement of statements) {
        try {
          await client.query(statement);
        } catch (error: any) {
          const msg = String(error.message || "").toLowerCase();
          const code = error.code;

          // PostgreSQL error codes for "already exists" scenarios:
          // 42P07 = duplicate_table (relation already exists)
          // 42701 = duplicate_column (column already exists)
          // 42710 = duplicate_object (type/constraint/index already exists)
          const isIgnorable =
            code === "42P07" ||
            code === "42701" ||
            code === "42710" ||
            msg.includes("already exists") ||
            msg.includes("duplicate key value");

          if (isIgnorable) {
            console.log(
              `⚠️  [Auto-Migrate] Skipping statement (${code || "unknown"}): ${msg.slice(0, 120)}`,
            );
            continue;
          }

          throw error;
        }
      }

      // Mark migration as applied
      await client.query(
        "INSERT INTO __drizzle_migrations (hash) VALUES ($1)",
        [file],
      );
      applied++;
      console.log(`✅ [Auto-Migrate] Applied: ${file}`);
    }

    console.log(
      `✅ [Auto-Migrate] Done — ${applied} applied, ${skipped} already up-to-date`,
    );
    await client.end();
  } catch (error: any) {
    console.error("❌ [Auto-Migrate] Migration failed:", error.message);
    if (client) await client.end();
    // Don't crash the server — just log the error
  }
}
