import { initTRPC } from "@trpc/server";
import {
	DatabaseClientService,
	type DatabaseClient,
} from "#root/shared/database/drizzle/db.js";
import { Effect } from "effect";
import superjson from "superjson";
import type { Context } from "./context.server";

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
export const t = initTRPC.context<Context>().create({
	transformer: superjson,
});

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;

export const provideDatabase = (ctx: { db: DatabaseClient }) =>
	Effect.provideService(DatabaseClientService, ctx.db);
