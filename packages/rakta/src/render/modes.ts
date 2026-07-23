import type {
	RenderConfig,
	RenderMode,
	RenderModeDescriptor,
	ResolvedRouteMode,
} from "./types";

export const RENDER_MODE_DESCRIPTORS: Readonly<
	Record<RenderMode, RenderModeDescriptor>
> = {
	csr: {
		mode: "csr",
		label: "Client-Side Rendering",
		shortLabel: "CSR",
		description:
			"React renders entirely in the browser. The server sends a minimal HTML shell with a JS bundle. No server required at runtime.",
		serverRequired: false,
		buildTimeGenerated: false,
		clientHydration: true,
		roadmap: false,
	},
	ssr: {
		mode: "ssr",
		label: "Server-Side Rendering",
		shortLabel: "SSR",
		description:
			"React renders to HTML on the server per request. The client receives full HTML and then hydrates. Requires a running Node/Bun server.",
		serverRequired: true,
		buildTimeGenerated: false,
		clientHydration: true,
		roadmap: true, // Roadmap: v1.0.1
	},
	ssg: {
		mode: "ssg",
		label: "Static Site Generation",
		shortLabel: "SSG",
		description:
			"Pages are fully rendered at build time. Output is static HTML files. No server required at runtime.",
		serverRequired: false,
		buildTimeGenerated: true,
		clientHydration: false,
		roadmap: true, // Roadmap: v1.0.1
	},
	csg: {
		mode: "csg",
		label: "Client-Side Generation",
		shortLabel: "CSG",
		description:
			"A static shell is generated at build time, data is fetched and rendered on the client. Combines SSG speed with dynamic data.",
		serverRequired: false,
		buildTimeGenerated: true,
		clientHydration: true,
		roadmap: true, // Roadmap: v1.0.1
	},
	spa: {
		mode: "spa",
		label: "Single Page Application",
		shortLabel: "SPA",
		description:
			"A single HTML entry point is served for all routes. React handles all routing client-side. Equivalent to a standard Vite SPA.",
		serverRequired: false,
		buildTimeGenerated: false,
		clientHydration: true,
		roadmap: false,
	},
	hybrid: {
		mode: "hybrid",
		label: "Hybrid Rendering",
		shortLabel: "Hybrid",
		description:
			"Different routes use different render modes. Configured via the `render.routes` map in rakta.config.ts. The top-level mode is the fallback.",
		serverRequired: false,
		buildTimeGenerated: false,
		clientHydration: true,
		roadmap: false,
	},
};

/**
 * Returns true if the pathname matches a given route pattern.
 * Supports exact paths and simple :param segments (e.g. /blog/:slug).
 */
function pathMatchesPattern(pathname: string, pattern: string): boolean {
	if (pattern === pathname) return true;

	const patternParts = pattern.split("/");
	const pathParts = pathname.split("/");

	if (patternParts.length !== pathParts.length) return false;

	for (let i = 0; i < patternParts.length; i++) {
		const pp = patternParts[i];
		const path = pathParts[i];
		if (pp === undefined || path === undefined) return false;
		if (pp.startsWith(":")) continue; // dynamic segment - always matches
		if (pp !== path) return false;
	}

	return true;
}

/**
 * Resolves the render mode for the given pathname using the provided config.
 * Route-specific overrides take priority. The most specific (longest) matching
 * pattern wins. Falls back to `config.defaultMode`.
 */
export function resolveRouteMode(
	pathname: string,
	config: RenderConfig,
): ResolvedRouteMode {
	const patterns = Object.keys(config.routes).sort(
		(a, b) => b.length - a.length, // longest pattern first (most specific)
	);

	for (const pattern of patterns) {
		const overrideMode = config.routes[pattern];
		if (overrideMode !== undefined && pathMatchesPattern(pathname, pattern)) {
			return {
				routePath: pathname,
				mode: overrideMode,
				source: "route-override",
			};
		}
	}

	return {
		routePath: pathname,
		mode: config.defaultMode,
		source: "default",
	};
}

export function getModeDescriptor(mode: RenderMode): RenderModeDescriptor {
	return RENDER_MODE_DESCRIPTORS[mode];
}

export function isRoadmapMode(mode: RenderMode): boolean {
	return RENDER_MODE_DESCRIPTORS[mode].roadmap;
}

export function requiresServer(mode: RenderMode): boolean {
	return RENDER_MODE_DESCRIPTORS[mode].serverRequired;
}

export function isBuildTimeMode(mode: RenderMode): boolean {
	return RENDER_MODE_DESCRIPTORS[mode].buildTimeGenerated;
}
