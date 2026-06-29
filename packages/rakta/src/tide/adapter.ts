import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { type RenderConfig, render, resolveRouteMode } from "../render";
import { generateManifest, matchRoute } from "../router";
import {
	buildErrorResponse,
	buildHtmlResponse,
	createRuntimeContext,
} from "./runtime";
import type { TideAdapter, TideAdapterConfig } from "./types";

const STATIC_MIME_TYPES: Readonly<Record<string, string>> = {
	".js": "application/javascript; charset=utf-8",
	".ts": "application/javascript; charset=utf-8",
	".css": "text/css; charset=utf-8",
	".json": "application/json; charset=utf-8",
	".png": "image/png",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".webp": "image/webp",
	".svg": "image/svg+xml",
	".ico": "image/x-icon",
	".woff": "font/woff",
	".woff2": "font/woff2",
};

type ApiRouteHandler = (request: Request) => Response | Promise<Response>;

interface ApiRouteExports {
	readonly GET?: ApiRouteHandler;
	readonly POST?: ApiRouteHandler;
	readonly PUT?: ApiRouteHandler;
	readonly PATCH?: ApiRouteHandler;
	readonly DELETE?: ApiRouteHandler;
	readonly HEAD?: ApiRouteHandler;
	readonly OPTIONS?: ApiRouteHandler;
}

function mimeForPath(filePath: string): string {
	const extensionIndex = filePath.lastIndexOf(".");

	if (extensionIndex < 0) {
		return "application/octet-stream";
	}

	const extension = filePath.slice(extensionIndex).toLowerCase();

	return STATIC_MIME_TYPES[extension] ?? "application/octet-stream";
}

function normalizeStaticPath(pathname: string): string {
	const pathnameWithoutLeadingSlash = pathname.replace(/^\/+/, "");

	if (pathnameWithoutLeadingSlash.length > 0) {
		return pathnameWithoutLeadingSlash;
	}

	return "index.html";
}

function isApiRouteExports(value: unknown): value is ApiRouteExports {
	if (typeof value !== "object" || value === null) {
		return false;
	}

	return true;
}

function getApiRouteHandler(
	routeExports: ApiRouteExports,
	method: string,
): ApiRouteHandler | undefined {
	if (method === "GET") {
		return routeExports.GET;
	}

	if (method === "POST") {
		return routeExports.POST;
	}

	if (method === "PUT") {
		return routeExports.PUT;
	}

	if (method === "PATCH") {
		return routeExports.PATCH;
	}

	if (method === "DELETE") {
		return routeExports.DELETE;
	}

	if (method === "HEAD") {
		return routeExports.HEAD;
	}

	if (method === "OPTIONS") {
		return routeExports.OPTIONS;
	}

	return undefined;
}

/**
 * Creates the Bun Tide adapter.
 * Handles static files, API routes, and page rendering.
 */
export function createBunAdapter(
	adapterConfig: TideAdapterConfig,
	renderConfig: RenderConfig,
): TideAdapter {
	const manifest = generateManifest(adapterConfig.appDir);
	const searchDirectories = [adapterConfig.publicDir, adapterConfig.outDir];

	let serverInstance: ReturnType<typeof Bun.serve> | undefined;

	async function handle(request: Request): Promise<Response> {
		const url = new URL(request.url);
		const { pathname } = url;
		const staticPathname = normalizeStaticPath(pathname);

		for (const searchDirectory of searchDirectories) {
			const filePath = join(searchDirectory, staticPathname);

			if (existsSync(filePath) && !filePath.endsWith("/")) {
				return new Response(readFileSync(filePath), {
					headers: {
						"Content-Type": mimeForPath(filePath),
						"Cache-Control": "public, max-age=31536000, immutable",
					},
				});
			}
		}

		const apiRoutes = manifest.routes.filter((route) => route.kind === "api");
		const apiMatch = matchRoute(pathname, apiRoutes);

		if (apiMatch) {
			const modulePath = join(adapterConfig.appDir, apiMatch.entry.filePath);

			const routeModule: unknown = await import(modulePath);

			if (!isApiRouteExports(routeModule)) {
				return new Response("Invalid API route module", {
					status: 500,
				});
			}

			const handler = getApiRouteHandler(
				routeModule,
				request.method.toUpperCase(),
			);

			if (!handler) {
				return new Response("Method not allowed", {
					status: 405,
				});
			}

			return await handler(request);
		}

		const resolvedRouteMode = resolveRouteMode(pathname, renderConfig);

		const runtimeContext = createRuntimeContext(
			request,
			url,
			{},
			resolvedRouteMode.mode,
		);

		const renderResult = await render(
			{
				routePath: runtimeContext.pathname,
				mode: runtimeContext.resolvedMode,
				params: runtimeContext.params,
				searchParams: runtimeContext.searchParams,
				requestHeaders: runtimeContext.requestHeaders,
				timestampMs: runtimeContext.timestampMs,
			},
			{
				appName: adapterConfig.appName,
				scriptPath: "/app.js",
				cssPath: "/globals.css",
				lang: "en",
			},
		);

		if (renderResult.kind === "failure") {
			return buildErrorResponse(renderResult.reason, renderResult.httpStatus);
		}

		return buildHtmlResponse(renderResult.html, renderResult.httpStatus);
	}

	return {
		kind: "bun",
		handle,
		start: async (): Promise<void> => {
			serverInstance = Bun.serve({
				port: adapterConfig.port,
				hostname: adapterConfig.host,
				fetch: handle,
			});

			console.log(
				`[Rakta.js Tide] Running at http://${adapterConfig.host}:${serverInstance.port}`,
			);
		},
		stop: (): void => {
			if (!serverInstance) {
				return;
			}

			serverInstance.stop();
		},
	};
}
