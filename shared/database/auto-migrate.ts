import pg from "pg";
import { readdir, readFile } from "fs/promises";
import path from "path";

/**
 * Runs all pending Drizzle migrations on server startup.
 * Gracefully handles "already exists" / "does not exist" errors.
 * Executes each SQL statement individually so one failure doesn't block others.
 *
 * IMPORTANT: On first boot against a fresh database the tracking table
 * (__drizzle_migrations) is empty, so every migration runs in order.
 * If migrations were previously recorded but the actual schema was dropped
 * (e.g. new database on a second deployment), we detect the mismatch and
 * re-run all migrations.
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

    // ── Integrity check ──────────────────────────────────────────────
    // If the tracking table claims migrations were applied but core
    // tables are missing, the tracking data is stale (fresh DB, different
    // cluster, etc.).  Wipe it so every migration re-runs cleanly.
    const tracked = await client.query(
      "SELECT COUNT(*)::int AS cnt FROM __drizzle_migrations",
    );
    if (tracked.rows[0].cnt > 0) {
      const probe = await client.query(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = 'product'
        ) AS ok
      `);
      if (!probe.rows[0].ok) {
        console.warn(
          "⚠️  [Auto-Migrate] Tracking table has entries but core tables are missing — resetting tracking",
        );
        await client.query("DELETE FROM __drizzle_migrations");
      }
    }

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
    let failed = 0;

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

      // Custom (non-Drizzle) migrations don't use the statement-breakpoint
      // delimiter — detect and handle them as a single block.
      const usesBreakpoints = migrationSQL.includes(
        "--> statement-breakpoint",
      );

      let statements: string[];
      if (usesBreakpoints) {
        statements = migrationSQL
          .split("--> statement-breakpoint")
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
          .map((s) => {
            // Only strip trailing semicolons for simple statements, not DO blocks
            if (s.endsWith(";") && !s.includes("$$")) {
              return s.slice(0, -1).trim();
            }
            return s;
          })
          .filter((s) => s.length > 0 && !s.startsWith("--"));
      } else {
        // Run the entire file as a single statement — this handles
        // multi-statement custom scripts (they rely on their own semicolons).
        const trimmed = migrationSQL.trim();
        statements = trimmed.length > 0 ? [trimmed] : [];
      }

      let migrationFailed = false;

      for (const statement of statements) {
        try {
          await client.query(statement);
        } catch (error: any) {
          const msg = String(error.message || "").toLowerCase();
          const code = error.code;

          // PostgreSQL error codes for idempotent DDL scenarios:
          // 42P07 = duplicate_table (relation already exists)
          // 42701 = duplicate_column (column already exists)
          // 42710 = duplicate_object (type/constraint/index already exists)
          // 42704 = undefined_object (constraint/type does not exist — safe to skip for DROP IF EXISTS)
          const isIgnorable =
            code === "42P07" ||
            code === "42701" ||
            code === "42710" ||
            code === "42704" ||
            msg.includes("already exists") ||
            msg.includes("duplicate key value");

          if (isIgnorable) {
            console.log(
              `⚠️  [Auto-Migrate] Skipping statement (${code || "unknown"}): ${msg.slice(0, 120)}`,
            );
            continue;
          }

          // Log but don't throw — continue to next migrations
          console.error(
            `❌ [Auto-Migrate] Statement failed in ${file} (${code || "unknown"}): ${msg.slice(0, 200)}`,
          );
          migrationFailed = true;
          break;
        }
      }

      if (migrationFailed) {
        failed++;
        continue; // Skip marking as applied, but continue with next migration
      }

      // Mark migration as applied
      await client.query(
        "INSERT INTO __drizzle_migrations (hash) VALUES ($1)",
        [file],
      );
      applied++;
      console.log(`✅ [Auto-Migrate] Applied: ${file}`);
    }

    if (failed > 0) {
      console.warn(
        `⚠️  [Auto-Migrate] Done — ${applied} applied, ${skipped} up-to-date, ${failed} FAILED (will retry next restart)`,
      );
    } else {
      console.log(
        `✅ [Auto-Migrate] Done — ${applied} applied, ${skipped} already up-to-date`,
      );
    }
    await client.end();
  } catch (error: any) {
    console.error("❌ [Auto-Migrate] Migration failed:", error.message);
    if (client) await client.end();
    // Don't crash the server — just log the error
  }
}
