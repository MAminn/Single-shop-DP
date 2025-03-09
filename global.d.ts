import type { DatabaseClient } from "./shared/database/drizzle/db";

declare global {
  namespace Vike {
    interface PageContext {
      db: DatabaseClient;
    }
  }
  namespace HonoContext {
    interface Env {
      Variables: {
        db: DatabaseClient;
      };
    }
  }
}

// biome-ignore lint/complexity/noUselessEmptyExport: ensure that the file is considered as a module
export {};
