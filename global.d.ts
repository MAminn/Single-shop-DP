import type { ClientSession } from "./backend/auth/shared/entities";
import type { DatabaseClient } from "./shared/database/drizzle/db";

declare global {
  namespace Vike {
    interface PageContext {
      db: DatabaseClient;
      clientSession?: ClientSession;
    }
  }
}

// biome-ignore lint/complexity/noUselessEmptyExport: ensure that the file is considered as a module
export {};
