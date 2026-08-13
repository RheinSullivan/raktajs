import { existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { resolveRouteMode } from "../render/modes";
import type { RenderConfig } from "../render/types";
import { matchRoute } from "../router/matcher";
import type { RouteManifest, RouteManifestEntry } from "../router/types";

export const RAKTA_DEVTOOLS_CONTROL_BASE_PATH = "/__rakta/devtools";
export const RAKTA_DEVTOOLS_BUNDLER_NAME = "Bun.build (CherbonsEngine)";

export interface RaktaDevToolsRouteInfo {
	readonly currentPathname: string;
	readonly matchedPattern: string | null;
	readonly routeType: string;
	readonly renderMode: string;
	readonly renderModeSource: string;
	readonly routeSource: string | null;
	readonly layoutFiles: ReadonlyArray<string>;
	readonly pageFile: string | null;
	readonly segments: ReadonlyArray<RouteManifestEntry["segments"][number]>;
	readonly isDynamic: boolean;
	readonly paramNames: ReadonlyArray<string>;
	readonly manifestGeneratedAt: string;
}

export interface RaktaDevToolsCommandResult {
	readonly ok: boolean;
	readonly message: string;
}

export interface ResolveRouteInfoOptions {
	readonly pathname: string;
	readonly manifest: RouteManifest;
	readonly renderConfig: RenderConfig;
}

export function resolveRaktaDevToolsRouteInfo(
	options: ResolveRouteInfoOptions,
): RaktaDevToolsRouteInfo {
	const pageMatch = matchRoute(
		options.pathname,
		options.manifest.routes.filter((route) => route.kind === "page"),
	);
	const apiMatch = matchRoute(
		options.pathname,
		options.manifest.routes.filter((route) => route.kind === "api"),
	);
	const matchedRoute = pageMatch ?? apiMatch;
	const resolvedRouteMode = resolveRouteMode(
		options.pathname,
		options.renderConfig,
	);

	return {
		currentPathname: options.pathname,
		matchedPattern: matchedRoute?.entry.urlPattern ?? null,
		routeType: matchedRoute?.entry.kind ?? "unmatched",
		renderMode: resolvedRouteMode.mode,
		renderModeSource: resolvedRouteMode.source,
		routeSource: matchedRoute?.entry.filePath ?? null,
		layoutFiles:
			matchedRoute === null || matchedRoute === undefined
				? []
				: findLayoutFiles(options.manifest, matchedRoute.entry),
		pageFile: pageMatch?.entry.filePath ?? null,
		segments: matchedRoute?.entry.segments ?? [],
		isDynamic: matchedRoute?.entry.isDynamic ?? false,
		paramNames: matchedRoute?.entry.paramNames ?? [],
		manifestGeneratedAt: options.manifest.generatedAt,
	};
}

export function createRaktaDevToolsJsonResponse(
	payload: RaktaDevToolsCommandResult | RaktaDevToolsRouteInfo,
	status = 200,
): Response {
	return new Response(JSON.stringify(payload), {
		status,
		headers: {
			"Content-Type": "application/json; charset=utf-8",
			"Cache-Control": "no-cache, no-store, must-revalidate",
		},
	});
}

export function clearRaktaDevelopmentCache(
	projectRoot: string,
	cacheDirectoryName = ".rakta",
): RaktaDevToolsCommandResult {
	const resolvedProjectRoot = resolve(projectRoot);
	const cacheDirectory = resolve(projectRoot, cacheDirectoryName, "dev");

	if (
		cacheDirectory === resolvedProjectRoot ||
		(!cacheDirectory.startsWith(`${resolvedProjectRoot}\\`) &&
			!cacheDirectory.startsWith(`${resolvedProjectRoot}/`))
	) {
		return {
			ok: false,
			message: "Refused to clear a cache path outside the project.",
		};
	}

	if (existsSync(cacheDirectory)) {
		rmSync(cacheDirectory, { recursive: true, force: true });
	}

	return {
		ok: true,
		message: "Rakta development cache was reset.",
	};
}

function findLayoutFiles(
	manifest: RouteManifest,
	route: RouteManifestEntry,
): string[] {
	const routeSegmentKeys = route.segments
		.map((segment) => segment.raw)
		.filter((segmentName) => segmentName.length > 0);

	return manifest.routes
		.filter((candidateRoute) => candidateRoute.kind === "layout")
		.filter((candidateRoute) =>
			isLayoutForRoute(
				candidateRoute.segments.map((segment) => segment.raw),
				routeSegmentKeys,
			),
		)
		.sort((firstLayout, secondLayout) => {
			return firstLayout.segments.length - secondLayout.segments.length;
		})
		.map((layoutRoute) => layoutRoute.filePath);
}

function isLayoutForRoute(
	layoutSegmentKeys: ReadonlyArray<string>,
	routeSegmentKeys: ReadonlyArray<string>,
): boolean {
	if (layoutSegmentKeys.length > routeSegmentKeys.length) {
		return false;
	}

	for (const [segmentIndex, layoutSegmentKey] of layoutSegmentKeys.entries()) {
		if (layoutSegmentKey !== routeSegmentKeys[segmentIndex]) {
			return false;
		}
	}

	return true;
}
