import { existsSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import type { RouteKind, RouteManifestEntry, RouteSegment } from "./types.js";

const FILE_TO_KIND: Record<string, RouteKind> = {
	"page.tsx": "page",
	"page.ts": "page",
	"page.jsx": "page",
	"page.js": "page",
	"layout.tsx": "layout",
	"layout.ts": "layout",
	"layout.jsx": "layout",
	"layout.js": "layout",
	"loading.tsx": "loading",
	"loading.ts": "loading",
	"loading.jsx": "loading",
	"loading.js": "loading",
	"notFound.tsx": "notFound",
	"notFound.ts": "notFound",
	"notFound.jsx": "notFound",
	"notFound.js": "notFound",
	"error.tsx": "error",
	"error.ts": "error",
	"error.jsx": "error",
	"error.js": "error",
	"route.ts": "api",
	"route.js": "api",
};

function parseSegment(raw: string): RouteSegment {
	const isGroup = raw.startsWith("(") && raw.endsWith(")");
	const isDynamic = raw.startsWith("[") && raw.endsWith("]");
	const inner = isDynamic ? raw.slice(1, -1) : "";
	const isOptionalCatchAll = inner.startsWith("[...") && inner.endsWith("]");
	const isCatchAll = inner.startsWith("...") || isOptionalCatchAll;
	const paramName = isOptionalCatchAll
		? inner.slice(4, -1)
		: isCatchAll
			? inner.slice(3)
			: inner;
	const pathPart =
		isDynamic && paramName.length > 0
			? isCatchAll
				? `:${paramName}*`
				: `:${paramName}`
			: raw;

	return {
		raw,
		pathPart,
		isDynamic,
		isCatchAll,
		isOptionalCatchAll,
		isGroup,
		paramName,
	};
}

function collectParamNames(segments: RouteSegment[]): string[] {
	return segments
		.filter((segment) => segment.isDynamic && segment.paramName.length > 0)
		.map((segment) => segment.paramName);
}

function segmentsToUrlPattern(segments: RouteSegment[]): string {
	const parts = segments
		.filter((segment) => !segment.isGroup)
		.map((segment) => segment.pathPart);
	if (parts.length === 0) return "/";
	return `/${parts.join("/")}`;
}

function routeScore(route: RouteManifestEntry): number {
	return route.segments.reduce((score, segment) => {
		if (segment.isGroup) return score;
		if (segment.isOptionalCatchAll) return score + 1;
		if (segment.isCatchAll) return score + 2;
		if (segment.isDynamic) return score + 4;
		return score + 8;
	}, 0);
}

function scanDirectory(
	dirPath: string,
	appRoot: string,
	results: RouteManifestEntry[],
): void {
	if (!existsSync(dirPath)) return;

	const entries = readdirSync(dirPath);

	for (const entryName of entries) {
		const fullPath = join(dirPath, entryName);
		const stats = statSync(fullPath);

		if (stats.isDirectory()) {
			scanDirectory(fullPath, appRoot, results);
			continue;
		}

		if (!stats.isFile()) continue;

		const kind = FILE_TO_KIND[entryName];
		if (!kind) continue;

		// Get path relative to app root, using forward slashes
		const relativePath = relative(appRoot, fullPath).replace(/\\/g, "/");

		// Extract directory segments (all parts except the filename)
		const dirRelative = relative(appRoot, dirPath).replace(/\\/g, "/");
		const rawSegments = dirRelative === "" ? [] : dirRelative.split("/");

		const segments: RouteSegment[] = rawSegments.map(parseSegment);
		const urlPattern = segmentsToUrlPattern(segments);
		const paramNames = collectParamNames(segments);
		const isDynamic = paramNames.length > 0;

		results.push({
			filePath: relativePath,
			urlPattern,
			kind,
			segments,
			isDynamic,
			paramNames,
		});
	}
}

export interface ScanOptions {
	appDir: string;
}

export function scanRoutes(options: ScanOptions): RouteManifestEntry[] {
	const results: RouteManifestEntry[] = [];
	scanDirectory(options.appDir, options.appDir, results);

	// Sort: static and specific routes before dynamic/catch-all fallbacks.
	results.sort((routeA, routeB) => {
		const scoreDifference = routeScore(routeB) - routeScore(routeA);
		if (scoreDifference !== 0) {
			return scoreDifference;
		}
		return routeA.urlPattern.localeCompare(routeB.urlPattern);
	});

	return results;
}
