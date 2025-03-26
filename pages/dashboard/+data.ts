import { getAdminOverview } from "#root/backend/dashboard/admin-overview/admin-overview";
import {
	runBackendEffect,
	serializeBackendEffectResult,
} from "#root/shared/backend/effect";
import { DatabaseClientService } from "#root/shared/database/drizzle/db";
import { Effect } from "effect";

export async function data(ctx: Vike.PageContext) {
	const session = ctx.clientSession;

	if (!session) {
		return {
			success: false,
			error: "Unauthorized",
		} as const;
	}

	if (session.role === "vendor") {
		return {
			success: true,
			type: "vendor" as const,
			result: {},
		} as const;
	}

	const fetchAdminOverview = await runBackendEffect(
		getAdminOverview({}, ctx.clientSession).pipe(
			Effect.provideService(DatabaseClientService, ctx.db),
		),
	).then(serializeBackendEffectResult);

	return {
		...fetchAdminOverview,
		type: "admin",
	} as const;
}

export type Data = Awaited<ReturnType<typeof data>>;
