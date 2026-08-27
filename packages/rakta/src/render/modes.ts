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
		roadmap: false,
	},
	ssg: {
		mode: "ssg",
		label: "Static Site Generation",
		shortLabel: "SSG",
		description:
			"Pages are fully rendered at build time. Output is static HTML files. No server required at runtime.",
		serverRequired: false,
		buildTimeGenerated: true,
		clientHydration: true,
		roadmap: false,
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
		roadmap: false,
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
	isr: {
		mode: "isr",
		label: "Incremental Static Regeneration",
		shortLabel: "ISR",
		description:
			"Static pages are revalidated asynchronously in the background based on a revalidate time interval.",
		serverRequired: true,
		buildTimeGenerated: true,
		clientHydration: true,
		roadmap: false,
	},
	streaming_ssr: {
		mode: "streaming_ssr",
		label: "Streaming Server-Side Rendering",
		shortLabel: "Streaming SSR",
		description:
			"Streams HTML chunks directly over HTTP ReadableStream for minimal time-to-first-byte (TTFB).",
		serverRequired: true,
		buildTimeGenerated: false,
		clientHydration: true,
		roadmap: false,
	},
	edge: {
		mode: "edge",
		label: "Edge Rendering",
		shortLabel: "Edge",
		description:
			"Executes render handlers directly at edge locations close to users (Cloudflare Workers, Vercel Edge).",
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

	for (let index = 0; index < patternParts.length; index++) {
		const patternPart = patternParts[index];
		const pathPart = pathParts[index];
		if (patternPart === undefined || pathPart === undefined) return false;
		if (patternPart.startsWith(":")) continue; // dynamic segment - always matches
		if (patternPart !== pathPart) return false;
	}

	return true;
}

/**
 * Resolves the render mode for the given pathname using the provided config.
 * Route-specific overrides take priority. More specific routes win:
 *   1. Deeper routes (more segments) beat shallower ones.
 *   2. Among same-depth routes, routes with more *literal* segments beat those
 *      with more dynamic (:param) segments.
 * Falls back to `config.defaultMode`.
 */
export function resolveRouteMode(
	pathname: string,
	config: RenderConfig,
): ResolvedRouteMode {
	/**
	 * Compute a specificity score for a route pattern.
	 * Each segment contributes 2 points; dynamic segments lose 1 point so that
	 * `/users/profile` (score 4) beats `/users/:id` (score 3) when both match.
	 */
	function specificityOf(pattern: string): number {
		const parts = pattern.split("/").filter(Boolean);
		return parts.reduce(
			(score, part) => score + (part.startsWith(":") ? 1 : 2),
			0,
		);
	}

	const patterns = Object.keys(config.routes).sort(
		(a, b) => specificityOf(b) - specificityOf(a), // highest specificity first
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
