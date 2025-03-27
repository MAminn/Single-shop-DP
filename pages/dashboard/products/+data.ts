import { viewCategories } from "#root/backend/categories/view-categories/service";
import { viewProducts } from "#root/backend/products/view-products/service";
import { viewVendors } from "#root/backend/vendor/view-vendors/service";
import {
	runBackendEffect,
	serializeBackendEffectResult,
} from "#root/shared/backend/effect";
import { DatabaseClientService } from "#root/shared/database/drizzle/db";
import { Effect } from "effect";
import type { PageContext } from "vike/types";

export async function data(ctx: PageContext) {
	const session = ctx.clientSession;

	if (!session) {
		return {
			success: false,
			error: "Unauthorized",
		} as const;
	}

	const getVendorId = () => {
		if (session.role === "vendor") {
			return session.vendorId;
		}

		if (ctx.urlParsed.search.vendorId) {
			return ctx.urlParsed.search.vendorId;
		}
	};

	const getCategoryId = () => {
		if (ctx.urlParsed.search.categoryId) {
			return ctx.urlParsed.search.categoryId;
		}
	};

	const viewProductsResult = await runBackendEffect(
		viewProducts({
			vendorId: getVendorId(),
			categoryId: getCategoryId(),
		}).pipe(Effect.provideService(DatabaseClientService, ctx.db)),
	).then(serializeBackendEffectResult);

	if (!viewProductsResult.success) {
		return viewProductsResult;
	}

	const viewCategoriesResult = await runBackendEffect(
		viewCategories().pipe(Effect.provideService(DatabaseClientService, ctx.db)),
	).then(serializeBackendEffectResult);

	if (!viewCategoriesResult.success) {
		return viewCategoriesResult;
	}

	let vendors = [] as { id: string; name: string }[];

	if (ctx.clientSession?.role === "admin") {
		const viewVendorsResult = await runBackendEffect(
			viewVendors({}, ctx.clientSession).pipe(
				Effect.provideService(DatabaseClientService, ctx.db),
			),
		).then(serializeBackendEffectResult);

		if (!viewVendorsResult.success) {
			return viewVendorsResult;
		}

		vendors = viewVendorsResult.result;
	}

	return {
		success: true,
		vendorId: getVendorId(),
		categoryId: getCategoryId(),
		vendors,
		categories: viewCategoriesResult.result,
		products: viewProductsResult.result,
	} as const;
}

export type Data = Awaited<ReturnType<typeof data>>;
