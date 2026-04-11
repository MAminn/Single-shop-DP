import type { ClientSession } from "./backend/auth/shared/entities";
import type { DatabaseClient } from "./shared/database/drizzle/db";
import type { LayoutSettings } from "./shared/types/layout-settings";

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
      layoutSettingsData?: LayoutSettings;
      brandName?: string;
      ssrLocale?: "en" | "ar";
    }
  }
}

// biome-ignore lint/complexity/noUselessEmptyExport: ensure that the file is considered as a module
export {};
