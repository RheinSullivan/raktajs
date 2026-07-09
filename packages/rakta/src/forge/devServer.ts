import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { resolveRouteMode } from "../render/modes";
import { render } from "../render/renderer";
import { generateManifest } from "../router/manifest";
import { matchRoute } from "../router/matcher";
import { writeClientEntry } from "./clientEntry";
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

function isReadableFile(filePath: string): boolean {
	return existsSync(filePath) && statSync(filePath).isFile();
}

async function buildDevClientBundle(
	options: ForgeDevServerOptions,
	manifest: ReturnType<typeof generateManifest>,
): Promise<string> {
	const workDir = join(options.projectRoot, ".rakta");
	const clientOutDir = join(workDir, "dev");
	const clientEntry = writeClientEntry({
		projectRoot: options.projectRoot,
		appDir: options.appDir,
		workDir,
		manifest,
	});

	const buildResult = await Bun.build({
		entrypoints: [clientEntry],
		outdir: clientOutDir,
		target: "browser",
		sourcemap: "external",
		naming: {
			entry: "app.[ext]",
			chunk: "chunks/[name]-[hash].[ext]",
			asset: "assets/[name]-[hash].[ext]",
		},
	});

	if (!buildResult.success) {
		const buildErrors = buildResult.logs
			.map((buildLog) => buildLog.message)
			.join("\n");

		throw new Error(`Failed to build Rakta.js client bundle.\n${buildErrors}`);
	}

	return clientOutDir;
}

interface ApiRouteExports {
	GET?: (request: Request) => Promise<Response>;
	POST?: (request: Request) => Promise<Response>;
	PUT?: (request: Request) => Promise<Response>;
	PATCH?: (request: Request) => Promise<Response>;
	DELETE?: (request: Request) => Promise<Response>;
	HEAD?: (request: Request) => Promise<Response>;
	OPTIONS?: (request: Request) => Promise<Response>;
}

/**
 * Starts the Rakta.js Forge development server.
 * Powered by Bun.serve. HMR is a roadmap feature (v0.2.0).
 */
export async function startDevServer(
	options: ForgeDevServerOptions,
): Promise<ForgeDevServerHandle> {
	const manifest = generateManifest(options.appDir);
	const resolvedPort = resolveDevPort(options.port);
	const clientOutDir = await buildDevClientBundle(options, manifest);

	const server = Bun.serve({
		port: resolvedPort,
		hostname: options.host,

		async fetch(request: Request): Promise<Response> {
			const url = new URL(request.url);
			const { pathname } = url;

			if (clientOutDir.length > 0) {
				const clientBundlePath = join(clientOutDir, pathname);

				if (isReadableFile(clientBundlePath)) {
					return new Response(readFileSync(clientBundlePath), {
						headers: { "Content-Type": resolveMime(clientBundlePath) },
					});
				}
			}

			// Serve static files from public dir
			const publicPath = join(options.publicDir, pathname);
			if (isReadableFile(publicPath)) {
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
				const routeModule = (await import(modulePath)) as ApiRouteExports;
				const method = request.method.toUpperCase() as keyof ApiRouteExports;
				const handler = routeModule[method];

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
					title: options.seo.defaultTitle,
					description: options.seo.defaultDescription,
					scriptPath: "/app.js",
					cssPath: "/app.css",
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

	const serverPort =
		typeof server.port === "number" ? server.port : resolvedPort;

	return {
		port: serverPort,
		host: options.host,
		url: `http://${options.host}:${serverPort}`,
		stop: () => server.stop(),
	};
}
