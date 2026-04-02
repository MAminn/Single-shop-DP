import type { ClientSession } from "./backend/auth/shared/entities";
import type { DatabaseClient } from "./shared/database/drizzle/db";

interface SsrPixelConfig {
  id: string;
  platform: string;
  pixelId: string;
}

declare global {
  namespace Vike {
    interface PageContext {
      db: DatabaseClient;
      clientSession?: ClientSession;
      pixelConfigs?: SsrPixelConfig[];
      templateSelection?: Record<string, string>;
    }
  }
}

// biome-ignore lint/complexity/noUselessEmptyExport: ensure that the file is considered as a module
export {};
