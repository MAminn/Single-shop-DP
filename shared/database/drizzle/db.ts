import { drizzle } from "drizzle-orm/node-postgres";

export function db() {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  return drizzle(dbUrl);
}

export type DatabaseClient = ReturnType<typeof db>;
