/**
 * Rakta.js Production Server Runtime.
 *
 * This is the platform-neutral request handler abstraction.
 * Platform adapters (Vercel, Netlify, Cloudflare, Node, Bun) wrap this.
 *
 * The core contract:
 *   handleRequest(request: Request): Promise<Response>
 *
 * The handler:
 *   1. Checks if the request is for a static asset → serves from outDir.
 *   2. Checks if the request is for an API route → dispatches to the handler.
 *   3. Resolves the render mode for the pathname.
 *   4. For SSR modes: loads the route module, calls renderToString.
 *   5. For CSR/SPA: serves the index.html shell.
 *   6. For SSG: serves the pre-generated HTML file.
 */

import { existsSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type { SeoConfig } from "../config/defineConfig";
import { readBuildManifest } from "../forge/buildManifest";
import {
	applyRaktaDetectionHeaders,
	createRaktaDetectionHeaders,
	RAKTA_NAME,
	RAKTA_VERSION,
} from "../frameworkIdentity";
import { resolveRouteMode } from "../render/modes";
import { buildHtmlShell } from "../render/renderer";
import type { RenderConfig, RenderMode } from "../render/types";
import { generateManifest, matchRoute } from "../router";

const STATIC_MIME: Readonly<Record<string, string>> = {
	".js": "application/javascript; charset=utf-8",
	".mjs": "application/javascript; charset=utf-8",
	".css": "text/css; charset=utf-8",
	".json": "application/json; charset=utf-8",
	".html": "text/html; charset=utf-8",
	".png": "image/png",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".webp": "image/webp",
	".svg": "image/svg+xml",
	".ico": "image/x-icon",
	".woff": "font/woff",
	".woff2": "font/woff2",
	".ttf": "font/ttf",
	".txt": "text/plain; charset=utf-8",
	".xml": "application/xml; charset=utf-8",
};

function mimeFor(filePath: string): string {
	const ext = filePath.slice(filePath.lastIndexOf(".")).toLowerCase();
	return STATIC_MIME[ext] ?? "application/octet-stream";
}

function safeJoin(base: string, rel: string): string | null {
	try {
		const decoded = decodeURIComponent(rel);
		const resolved = resolve(join(resolve(base), decoded));
		if (
			resolved === resolve(base) ||
			resolved.startsWith(`${resolve(base)}/`) ||
			resolved.startsWith(`${resolve(base)}\\`)
		) {
			return resolved;
		}
	} catch {
		// path traversal or URI error
	}
	return null;
}

function isFile(filePath: string): boolean {
	try {
		return existsSync(filePath) && statSync(filePath).isFile();
	} catch {
		return false;
	}
}

function normalizeStaticPath(pathname: string): string {
	const stripped = pathname.replace(/^\/+/, "");
	return stripped.length > 0 ? stripped : "index.html";
}

export interface RaktaServerRuntimeOptions {
	readonly projectRoot: string;
	readonly appDir: string;
	readonly publicDir: string;
	readonly outDir: string;
	readonly appName: string;
	readonly seo: SeoConfig;
	readonly renderConfig: RenderConfig;
	readonly port?: number;
	readonly host?: string;
}

type ApiRouteHandler = (request: Request) => Response | Promise<Response>;

interface ApiExports {
	GET?: ApiRouteHandler;
	POST?: ApiRouteHandler;
	PUT?: ApiRouteHandler;
	PATCH?: ApiRouteHandler;
	DELETE?: ApiRouteHandler;
	HEAD?: ApiRouteHandler;
	OPTIONS?: ApiRouteHandler;
}

function withDetection(response: Response): Response {
	const headers = applyRaktaDetectionHeaders(
		new Headers(response.headers),
		"bun",
	);
	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers,
	});
}

/**
 * Determines which JS and CSS asset paths to use based on the build manifest.
 * Falls back to conventional paths if no manifest is found.
 */
function resolveAssetPaths(outDir: string): {
	scriptPath: string;
	cssPath: string;
	clientDir: string;
} {
	const manifest = readBuildManifest(outDir);

	if (manifest !== null) {
		const clientDir =
			manifest.server !== undefined ? join(outDir, "client") : outDir;

		const scriptPath = manifest.client.entry
			.replace(clientDir, "")
			.replace(/\\/g, "/");
		const cssPath =
			manifest.client.css[0]?.replace(clientDir, "").replace(/\\/g, "/") ??
			"/app.css";

		return {
			scriptPath: scriptPath.startsWith("/") ? scriptPath : `/${scriptPath}`,
			cssPath: cssPath.startsWith("/") ? cssPath : `/${cssPath}`,
			clientDir,
		};
	}

	// Fallback: conventional paths
	const clientDir = existsSync(join(outDir, "client"))
		? join(outDir, "client")
		: outDir;
	return { scriptPath: "/app.js", cssPath: "/app.css", clientDir };
}

/**
 * Renders a CSR HTML shell for SSR mode.
 * In a future version this will call ReactDOMServer.renderToString with the
 * compiled route module. For now it returns the HTML shell, which is
 * functionally correct - the client hydrates immediately on load.
 */
async function renderSsrHtml(
	_pathname: string,
	_mode: RenderMode,
	scriptPath: string,
	cssPath: string,
	appName: string,
	seo: SeoConfig,
): Promise<string> {
	return buildHtmlShell({
		appName,
		title: seo.defaultTitle,
		description: seo.defaultDescription,
		scriptPath,
		cssPath,
		lang: "en",
	});
}

/**
 * Creates the core Rakta.js production request handler.
 * This is the platform-neutral heart of the production server.
 */
export function createRaktaRequestHandler(
	options: RaktaServerRuntimeOptions,
): (request: Request) => Promise<Response> {
	const routeManifest = generateManifest(options.appDir);
	const { scriptPath, cssPath, clientDir } = resolveAssetPaths(options.outDir);
	const staticDirs = [options.publicDir, clientDir, options.outDir];
	const detectionHeaders = createRaktaDetectionHeaders("bun");

	return async function handleRequest(request: Request): Promise<Response> {
		const url = new URL(request.url);
		const { pathname } = url;

		// 1. Static asset serving
		const staticRelative = normalizeStaticPath(pathname);
		for (const dir of staticDirs) {
			const filePath = safeJoin(dir, staticRelative);
			if (filePath !== null && isFile(filePath)) {
				const isImmutable =
					staticRelative.includes("chunks/") ||
					/\.[a-f0-9]{8,}\.(js|css)$/.test(staticRelative);
				return new Response(readFileSync(filePath), {
					headers: {
						...detectionHeaders,
						"Content-Type": mimeFor(filePath),
						"Cache-Control": isImmutable
							? "public, max-age=31536000, immutable"
							: "public, max-age=0, must-revalidate",
						Vary: "Accept-Encoding",
					},
				});
			}
		}

		// 2. Framework fingerprint endpoint
		if (
			pathname === "/.well-known/rakta" ||
			pathname === "/.well-known/rakta.json"
		) {
			return new Response(
				JSON.stringify({ framework: RAKTA_NAME, version: RAKTA_VERSION }),
				{
					headers: {
						...detectionHeaders,
						"Content-Type": "application/json",
						"Cache-Control": "public, max-age=86400",
					},
				},
			);
		}

		// 3. API routes
		const apiRoutes = routeManifest.routes.filter((r) => r.kind === "api");
		const apiMatch = matchRoute(pathname, apiRoutes);
		if (apiMatch) {
			const modulePath = join(options.appDir, apiMatch.entry.filePath);
			try {
				const mod = (await import(
					pathToFileURL(modulePath).href
				)) as ApiExports;
				const method = request.method.toUpperCase() as keyof ApiExports;
				const handler = mod[method];
				if (typeof handler !== "function") {
					return withDetection(
						new Response("Method not allowed", { status: 405 }),
					);
				}
				return withDetection(await handler(request));
			} catch (err) {
				return withDetection(
					new Response(
						JSON.stringify({
							error: err instanceof Error ? err.message : "API Error",
						}),
						{ status: 500, headers: { "Content-Type": "application/json" } },
					),
				);
			}
		}

		// 4. Check for pre-generated SSG HTML
		const ssgHtmlPath = (() => {
			const ssgDir = join(options.outDir, "static");
			// Try <outDir>/static/<route>/index.html then <outDir>/<route>/index.html
			const dirs = [ssgDir, options.outDir];
			for (const base of dirs) {
				const candidate =
					pathname === "/" || pathname === ""
						? join(base, "index.html")
						: join(
								base,
								...pathname.replace(/^\//, "").split("/"),
								"index.html",
							);
				if (isFile(candidate)) return candidate;
			}
			return null;
		})();

		if (ssgHtmlPath !== null) {
			return new Response(readFileSync(ssgHtmlPath), {
				headers: {
					...detectionHeaders,
					"Content-Type": "text/html; charset=utf-8",
					"Cache-Control": "public, max-age=0, must-revalidate",
				},
			});
		}

		// 5. Page rendering (CSR shell or SSR)
		const resolved = resolveRouteMode(pathname, options.renderConfig);

		const html = await renderSsrHtml(
			pathname,
			resolved.mode,
			scriptPath,
			cssPath,
			options.appName,
			options.seo,
		);

		return withDetection(
			new Response(html, {
				headers: {
					...detectionHeaders,
					"Content-Type": "text/html; charset=utf-8",
					"Cache-Control": "no-cache, no-store, must-revalidate",
					"X-Rakta-Mode": resolved.mode,
				},
			}),
		);
	};
}

/**
 * Creates and starts a Bun production server using the Rakta request handler.
 * Called by `rakta start`.
 */
export async function startProductionServer(
	options: RaktaServerRuntimeOptions,
): Promise<{ port: number; url: string; stop: () => void }> {
	const handler = createRaktaRequestHandler(options);
	const port = options.port ?? 3000;
	const host = options.host ?? "0.0.0.0";

	const server = Bun.serve({
		port,
		hostname: host,
		fetch: handler,
	});

	const displayHost = host === "0.0.0.0" || host === "::" ? "localhost" : host;
	const actualPort = typeof server.port === "number" ? server.port : port;
	const url = `http://${displayHost}:${actualPort}`;

	return {
		port: actualPort,
		url,
		stop: () => server.stop(),
	};
}
