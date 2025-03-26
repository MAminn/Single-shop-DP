import type { ClientSession } from "#root/backend/auth/shared/entities";
import { query } from "#root/shared/database/drizzle/db";
import { vendor } from "#root/shared/database/drizzle/schema";
import { ServerError } from "#root/shared/error/server";
import { and, count, eq, gte, lte } from "drizzle-orm";
import { Effect } from "effect";
import { z } from "zod";

export const getAdminOverviewSchema = z.object({});

function normalizeCount(rows: { count: number }[]) {
	return rows[0]?.count ?? 0;
}

export const getAdminOverview = (
	_input: z.infer<typeof getAdminOverviewSchema>,
	session?: ClientSession,
) =>
	Effect.gen(function* ($) {
		if (!session || session.role !== "admin") {
			return yield* $(
				Effect.fail(
					new ServerError({
						tag: "Unauthorized",
						statusCode: 401,
						clientMessage: "Unauthorized",
					}),
				),
			);
		}
		return yield* $(
			query(async (db) => {
				const totalVendors = await db
					.select({
						count: count(vendor.id),
					})
					.from(vendor)
					.where(eq(vendor.status, "active"))
					.then(normalizeCount);

				const newVendors = await db
					.select({
						count: count(vendor.id),
					})
					.from(vendor)
					.where(
						and(
							gte(
								vendor.createdAt,
								new Date(new Date().setMonth(new Date().getMonth() - 1)),
							),
							lte(vendor.createdAt, new Date()),
							eq(vendor.status, "active"),
						),
					)
					.then(normalizeCount);

				const pendingVendors = await db
					.select({
						count: count(vendor.id),
					})
					.from(vendor)
					.where(eq(vendor.status, "pending"))
					.then(normalizeCount);

				return {
					vendors: {
						total: totalVendors,
						new: newVendors,
						pending: pendingVendors,
					},
				};
			}),
		);
	});
