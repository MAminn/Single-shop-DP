import { viewVendors } from "#root/backend/vendor/view-vendors/service";
import {
	runBackendEffect,
	serializeBackendEffectResult,
} from "#root/shared/backend/effect";
import { DatabaseClientService } from "#root/shared/database/drizzle/db";
import { Effect } from "effect";

export type Data = Awaited<ReturnType<typeof data>>;

export async function data(ctx: Vike.PageContext) {
	return await runBackendEffect(
		viewVendors({}, ctx.clientSession).pipe(
			Effect.provideService(DatabaseClientService, ctx.db),
		),
	).then(serializeBackendEffectResult);
}
