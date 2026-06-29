import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { resolveRouteMode } from "../render/modes";
import { render } from "../render/renderer";
import { generateManifest } from "../router/manifest";
import { matchRoute } from "../router/matcher";
import type { ForgeDevServerHandle, ForgeDevServerOptions } from "./types";

const DEFAULT_DEV_PORT = 3000;

const MIME_MAP: Readonly<Record<string, string>> = {
	".html": "text/html; charset=utf-8",
	".js": "application/javascript; charset=utf-8",
	".mjs": "application/javascript; charset=utf-8",
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
	".ttf": "font/ttf",
};

function resolveMime(filePath: string): string {
	const ext = filePath.slice(filePath.lastIndexOf(".")).toLowerCase();
	return MIME_MAP[ext] ?? "application/octet-stream";
}

function resolveDevPort(port: number): number {
	return port > 0 ? port : DEFAULT_DEV_PORT;
}

interface ApiRouteExports {
	GET?: (req: Request) => Promise<Response>;
	POST?: (req: Request) => Promise<Response>;
	PUT?: (req: Request) => Promise<Response>;
	PATCH?: (req: Request) => Promise<Response>;
	DELETE?: (req: Request) => Promise<Response>;
	HEAD?: (req: Request) => Promise<Response>;
	OPTIONS?: (req: Request) => Promise<Response>;
}

/**
 * Starts the Rakta.js Forge development server.
 * Powered by Bun.serve. HMR is a roadmap feature (v0.2.0).
 */
export function startDevServer(
	options: ForgeDevServerOptions,
): ForgeDevServerHandle {
	const manifest = generateManifest(options.appDir);
	const resolvedPort = resolveDevPort(options.port);

	const server = Bun.serve({
		port: resolvedPort,
		hostname: options.host,

		async fetch(request: Request): Promise<Response> {
			const url = new URL(request.url);
			const { pathname } = url;

			// Serve static files from public dir
			const publicPath = join(options.publicDir, pathname);
			if (existsSync(publicPath) && !publicPath.endsWith("/")) {
				return new Response(readFileSync(publicPath), {
					headers: { "Content-Type": resolveMime(pathname) },
				});
			}

			// Match API routes
			const apiMatch = matchRoute(
				pathname,
				manifest.routes.filter((route) => route.kind === "api"),
			);

			if (apiMatch) {
				const modulePath = join(options.appDir, apiMatch.entry.filePath);
				const mod = (await import(modulePath)) as ApiRouteExports;
				const method = request.method.toUpperCase() as keyof ApiRouteExports;
				const handler = mod[method];

				if (typeof handler !== "function") {
					return new Response("Method not allowed", { status: 405 });
				}

				return await handler(request);
			}

			// Resolve render mode and serve HTML shell for page routes
			const resolved = resolveRouteMode(pathname, options.renderConfig);

			const searchParams: Record<string, string> = {};
			url.searchParams.forEach((value, key) => {
				searchParams[key] = value;
			});

			const requestHeaders: Record<string, string> = {};
			request.headers.forEach((value, key) => {
				requestHeaders[key] = value;
			});

			const result = await render(
				{
					routePath: pathname,
					mode: resolved.mode,
					params: {},
					searchParams,
					requestHeaders,
					timestampMs: Date.now(),
				},
				{
					appName: options.appName,
					scriptPath: "/app.js",
					cssPath: "/globals.css",
					lang: "en",
				},
			);

			if (result.kind === "failure") {
				return new Response(result.reason, { status: result.httpStatus });
			}

			return new Response(result.html, {
				status: result.httpStatus,
				headers: result.responseHeaders,
			});
		},
	});

	const serverPorts =
		typeof server.port === "number" ? server.port : resolvedPort;

	return {
		port: serverPorts,
		host: options.host,
		url: `http://${options.host}:${serverPorts}`,
		stop: () => server.stop(),
	};
}
