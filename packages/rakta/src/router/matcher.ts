import type {
	MatchedRoute,
	RouteManifestEntry,
	RouteSegment,
} from "./types.js";

function escapeRegex(text: string): string {
	return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildPatternRegex(segments: RouteSegment[]): {
	regex: RegExp;
	paramNames: string[];
} {
	const paramNames: string[] = [];

	const parts = segments
		.filter((segment) => !segment.isGroup)
		.map((segment) => {
			if (segment.isDynamic && segment.paramName) {
				paramNames.push(segment.paramName);
				if (segment.isOptionalCatchAll) {
					return "(.*)";
				}
				if (segment.isCatchAll) {
					return "(.+)";
				}
				return "([^/]+)";
			}
			return escapeRegex(segment.raw);
		});

	const pattern = parts.length === 0 ? "" : `/${parts.join("/")}`;
	const regex = new RegExp(`^${pattern || "/"}$`);

	return { regex, paramNames };
}

function safeDecode(val: string): string {
	try {
		return decodeURIComponent(val);
	} catch {
		return val;
	}
}

export function matchRoute(
	pathname: string,
	routes: RouteManifestEntry[],
): MatchedRoute | null {
	// Normalize pathname: strip trailing slash unless root
	const normalized =
		pathname !== "/" && pathname.endsWith("/")
			? pathname.slice(0, -1)
			: pathname;

	for (const entry of routes) {
		// Only match pages and api routes
		if (entry.kind !== "page" && entry.kind !== "api") continue;

		const { regex, paramNames } = buildPatternRegex(entry.segments);
		const match = regex.exec(normalized);

		if (!match) continue;

		const params: Record<string, string | string[]> = {};
		paramNames.forEach((name, index) => {
			const captured = match[index + 1];
			if (captured !== undefined) {
				params[name] = captured.includes("/")
					? captured.split("/").filter(Boolean).map(safeDecode)
					: safeDecode(captured);
			}
		});

		return { entry, params };
	}

	return null;
}

export function findLayoutsForPathname(
	pathname: string,
	routes: RouteManifestEntry[],
): RouteManifestEntry[] {
	const layoutRoutes = routes.filter((route) => route.kind === "layout");

	return layoutRoutes.filter((layout) => {
		if (layout.urlPattern === "/") return true;
		return (
			pathname === layout.urlPattern ||
			pathname.startsWith(`${layout.urlPattern}/`)
		);
	});
}

export function findSpecialRoute(
	kind: "loading" | "not-found" | "error",
	pathname: string,
	routes: RouteManifestEntry[],
): RouteManifestEntry | null {
	const candidates = routes.filter((route) => route.kind === kind);

	// Find the most specific match (longest matching prefix)
	let best: RouteManifestEntry | null = null;
	let bestLength = -1;

	for (const candidate of candidates) {
		const prefix = candidate.urlPattern === "/" ? "" : candidate.urlPattern;
		if (pathname.startsWith(prefix) && prefix.length > bestLength) {
			best = candidate;
			bestLength = prefix.length;
		}
	}

	return best;
}
