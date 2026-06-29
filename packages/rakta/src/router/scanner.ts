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
	const isDynamic = raw.startsWith("[") && raw.endsWith("]");
	const paramName = isDynamic ? raw.slice(1, -1) : "";

	return { raw, isDynamic, paramName };
}

function collectParamNames(segments: RouteSegment[]): string[] {
	return segments
		.filter((segment) => segment.isDynamic && segment.paramName.length > 0)
		.map((segment) => segment.paramName);
}

function segmentsToUrlPattern(segments: RouteSegment[]): string {
	if (segments.length === 0) return "/";
	const parts = segments.map((segment) =>
		segment.isDynamic && segment.paramName
			? `:${segment.paramName}`
			: segment.raw,
	);
	return `/${parts.join("/")}`;
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

	// Sort: static routes before dynamic, shorter patterns first
	results.sort((routeA, routeB) => {
		if (routeA.isDynamic !== routeB.isDynamic) {
			return routeA.isDynamic ? 1 : -1;
		}
		return routeA.urlPattern.localeCompare(routeB.urlPattern);
	});

	return results;
}
