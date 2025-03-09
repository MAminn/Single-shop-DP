import { initTRPC } from "@trpc/server";
import type { DatabaseClient } from "#root/shared/database/drizzle/db";

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
export const t = initTRPC.context<{ db: DatabaseClient }>().create();

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;
