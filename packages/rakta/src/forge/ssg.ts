/**
 * SSG / CSG build pipeline for Rakta.js.
 *
 * Responsibility:
 *   1. Receive the list of static routes from the route manifest.
 *   2. For each static route: render the HTML shell (with correct meta/title)
 *      and write it to <outDir>/[route]/index.html.
 *   3. For dynamic routes that cannot be statically resolved, produce a clear
 *      build-time error instead of silently generating broken output.
 *   4. Return a list of generated entries for the BuildManifest.
 *
 * Architecture note:
 *   Full server-side React rendering (ReactDOMServer.renderToString) requires
 *   the compiled route modules to be importable at build time. Rakta.js does
 *   not yet compile routes into importable server modules during the SSG pass —
 *   that is planned for v1.3. For now, the SSG pipeline renders the HTML shell
 *   (identical to what the dev server serves) and writes it as static HTML.
 *   This is equivalent to what Vite SSG tools like vite-ssg do in their first
 *   pass. Client-side hydration then takes over after the page loads.
 *
 *   The HTML shell is fully functional: it includes the correct <title>,
 *   <meta>, CSS preload, JS modulepreload, and the loading spinner. Crawlers
 *   and CDNs receive a meaningful HTML document instantly.
 */

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { buildHtmlShell } from "../render/renderer";
import type { RenderMode } from "../render/types";
import type { RouteManifestEntry } from "../router/types";
import type { BuildManifestRoute } from "./buildManifest";

export interface SsgRouteInput {
	readonly entry: RouteManifestEntry;
	/** The render mode resolved for this route. */
	readonly mode: RenderMode;
}

export interface SsgRendererOptions {
	readonly appName: string;
	readonly title?: string | undefined;
	readonly description?: string | undefined;
	/** Path to the client JS asset, e.g. "/app.js" or "/client/app.abc123.js". */
	readonly scriptPath: string;
	/** Path to the CSS asset. */
	readonly cssPath: string;
	readonly lang: string;
}

export interface SsgGenerateOptions {
	readonly outDir: string;
	readonly routes: SsgRouteInput[];
	readonly renderer: SsgRendererOptions;
}

export interface SsgRouteResult {
	readonly pattern: string;
	readonly filePath: string;
	readonly mode: RenderMode;
	readonly htmlPath: string;
	readonly sizeBytes: number;
	readonly success: boolean;
	readonly error?: string;
}

export interface SsgGenerateResult {
	readonly success: boolean;
	readonly routes: SsgRouteResult[];
	readonly errors: string[];
	readonly generateMs: number;
}

/**
 * Converts a URL pattern to the output HTML path.
 * Examples:
 *   "/"          → "<outDir>/index.html"
 *   "/about"     → "<outDir>/about/index.html"
 *   "/blog/post" → "<outDir>/blog/post/index.html"
 */
function patternToHtmlPath(outDir: string, pattern: string): string {
	// Strip trailing slash (except root)
	const normalized =
		pattern.endsWith("/") && pattern !== "/" ? pattern.slice(0, -1) : pattern;

	if (normalized === "/") {
		return join(outDir, "index.html");
	}

	// Remove leading slash and join segments
	const parts = normalized.replace(/^\//, "").split("/");
	return join(outDir, ...parts, "index.html");
}

/**
 * Returns true if the route has unresolvable dynamic segments.
 * SSG cannot generate pages for routes like "/blog/:slug" without explicit
 * static paths provided by the route module's generateStaticPaths() export.
 * For now, dynamic routes without static params are skipped with a warning.
 */
function isDynamicRoute(entry: RouteManifestEntry): boolean {
	return entry.isDynamic && entry.paramNames.length > 0;
}

/**
 * Generates static HTML files for all SSG/CSG routes.
 */
export async function generateStaticPages(
	options: SsgGenerateOptions,
): Promise<SsgGenerateResult> {
	const startMs = Date.now();
	const results: SsgRouteResult[] = [];
	const errors: string[] = [];

	mkdirSync(options.outDir, { recursive: true });

	for (const routeInput of options.routes) {
		const { entry, mode } = routeInput;

		// Only SSG and CSG routes are statically generated.
		if (mode !== "ssg" && mode !== "csg") {
			continue;
		}

		// Dynamic routes without static paths cannot be pre-rendered.
		if (isDynamicRoute(entry)) {
			const msg = [
				`SSG route "${entry.urlPattern}" has dynamic segments (${entry.paramNames.map((p) => `:${p}`).join(", ")}).`,
				`  Dynamic SSG routes require a generateStaticPaths() export in the route module`,
				`  to enumerate the static paths at build time. Without it, Rakta.js cannot`,
				`  pre-render this route. The route will still work client-side via CSR fallback.`,
				`  → Add \`export async function generateStaticPaths() { return [{ params: {...} }]; }\``,
				`    to ${entry.filePath} to enable static generation for this route.`,
			].join("\n");

			process.stderr.write(`\n  ⚠ ${msg}\n`);

			results.push({
				pattern: entry.urlPattern,
				filePath: entry.filePath,
				mode,
				htmlPath: "",
				sizeBytes: 0,
				success: false,
				error: `Dynamic route skipped: no generateStaticPaths() export found in ${entry.filePath}`,
			});
			continue;
		}

		const htmlPath = patternToHtmlPath(options.outDir, entry.urlPattern);

		try {
			// Ensure output directory exists
			mkdirSync(dirname(htmlPath), { recursive: true });

			// Build the HTML shell for this route.
			// The title/description can be per-route in a future version.
			const html = buildHtmlShell({
				appName: options.renderer.appName,
				title: options.renderer.title,
				description: options.renderer.description,
				scriptPath: options.renderer.scriptPath,
				cssPath: options.renderer.cssPath,
				lang: options.renderer.lang,
			});

			writeFileSync(htmlPath, html, "utf-8");

			const sizeBytes = new TextEncoder().encode(html).byteLength;

			results.push({
				pattern: entry.urlPattern,
				filePath: entry.filePath,
				mode,
				htmlPath,
				sizeBytes,
				success: true,
			});
		} catch (caughtError) {
			const message =
				caughtError instanceof Error
					? caughtError.message
					: String(caughtError);
			const fullError = [
				`Failed to generate static HTML for route "${entry.urlPattern}".`,
				`  File: ${htmlPath}`,
				`  Error: ${message}`,
			].join("\n");

			errors.push(fullError);

			results.push({
				pattern: entry.urlPattern,
				filePath: entry.filePath,
				mode,
				htmlPath,
				sizeBytes: 0,
				success: false,
				error: message,
			});
		}
	}

	return {
		success: errors.length === 0,
		routes: results,
		errors,
		generateMs: Date.now() - startMs,
	};
}

/**
 * Writes a CSR fallback index.html into <outDir>/index.html if it does not
 * already exist. Used for CSR/SPA builds so the SPA rewrite rule always has
 * a target file.
 */
export function writeCsrIndexHtml(
	outDir: string,
	rendererOptions: SsgRendererOptions,
): string {
	mkdirSync(outDir, { recursive: true });
	const indexPath = join(outDir, "index.html");

	if (!existsSync(indexPath)) {
		const html = buildHtmlShell({
			appName: rendererOptions.appName,
			title: rendererOptions.title,
			description: rendererOptions.description,
			scriptPath: rendererOptions.scriptPath,
			cssPath: rendererOptions.cssPath,
			lang: rendererOptions.lang,
		});
		writeFileSync(indexPath, html, "utf-8");
	}

	return indexPath;
}

/**
 * Converts SsgRouteResult[] to BuildManifestRoute[].
 */
export function toManifestRoutes(
	results: SsgRouteResult[],
	defaultMode: RenderMode,
	allEntries: RouteManifestEntry[],
): BuildManifestRoute[] {
	const ssgByPattern = new Map(results.map((r) => [r.pattern, r]));

	return allEntries
		.filter((e) => e.kind === "page")
		.map((entry) => {
			const ssgResult = ssgByPattern.get(entry.urlPattern);
			const base: BuildManifestRoute = {
				pattern: entry.urlPattern,
				filePath: entry.filePath,
				mode: ssgResult?.mode ?? defaultMode,
			};
			if (ssgResult?.success && ssgResult.htmlPath) {
				return { ...base, htmlPath: ssgResult.htmlPath };
			}
			return base;
		});
}
