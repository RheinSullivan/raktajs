import { existsSync, statSync, watch } from "node:fs";
import { join, relative } from "node:path";
import { createDevTerminal } from "../dx/terminal";
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
 * Powered by Bun.serve. HMR is a roadmap feature.
 *
 * Terminal output (development only):
 *
 *   ⩛ Rakta.js 1.0.6 (CherbonsEngine)
 *
 *     Local:        http://localhost:3000
 *     Network:      http://192.168.1.x:3000
 *     Environments: .env.local
 *     Mode:         development
 *
 *   ✓ Ready in 421ms
 *
 *   ✓ GET  /                  200  24ms
 *   ✓ GET  /api/report        200  18ms
 *   ✗ GET  /missing           404   2ms
 */
export async function startDevServer(
	options: ForgeDevServerOptions,
): Promise<ForgeDevServerHandle> {
	const manifest = generateManifest(options.appDir);
	const resolvedPort = resolveDevPort(options.port);
	let clientOutDir = await buildDevClientBundle(options, manifest);
	let isClientBundleDirty = false;
	let clientBundleRebuild: Promise<void> | null = null;

	// Development-only. Zero cost in production: this module is never imported
	// by the production server path (tide/adapter.ts).
	const terminal = createDevTerminal({
		version: "1.0.6",
		projectRoot: options.projectRoot,
		slowRequestThresholdMs: 1000,
		detailedTiming: false,
	});
	terminal.markStart();

	function shouldReloadForPath(changedPath: string | null): boolean {
		if (changedPath === null) return true;

		const relativePath = relative(options.projectRoot, changedPath).replace(
			/\\/g,
			"/",
		);

		return (
			relativePath.length > 0 &&
			!relativePath.startsWith("node_modules/") &&
			!relativePath.startsWith(".rakta/") &&
			!relativePath.startsWith("dist/")
		);
	}

	async function ensureFreshClientBundle(): Promise<void> {
		if (!isClientBundleDirty) return;

		clientBundleRebuild ??= buildDevClientBundle(options, manifest).then(
			(nextClientOutDir) => {
				clientOutDir = nextClientOutDir;
				isClientBundleDirty = false;
				clientBundleRebuild = null;
			},
			(caughtError: unknown) => {
				clientBundleRebuild = null;
				throw caughtError;
			},
		);

		await clientBundleRebuild;
	}

	const server = Bun.serve({
		port: resolvedPort,
		hostname: options.host,
		websocket: {
			open(ws) {
				ws.subscribe("livereload");
			},
			message() {
				// no-op
			},
		},

		async fetch(request: Request, server): Promise<Response> {
			// Measure every request from arrival to response.
			// This is the server-side half; browser-side timing is in JatiLens.
			const requestStartMs = Date.now();

			if (request.url.endsWith("/__livereload")) {
				const upgraded = server.upgrade(request);
				if (upgraded) return new Response(null);
			}

			const url = new URL(request.url);
			const { pathname } = url;

			// Rebuild bundle if source changed since last request.
			await ensureFreshClientBundle();

			if (clientOutDir.length > 0) {
				const clientBundlePath = join(clientOutDir, pathname);
				if (isReadableFile(clientBundlePath)) {
					const isHashedAsset = pathname.includes("/chunks/");
					return new Response(Bun.file(clientBundlePath), {
						headers: {
							"Content-Type": resolveMime(clientBundlePath),
							"Cache-Control": isHashedAsset
								? "public, max-age=31536000, immutable"
								: "no-cache, no-store, must-revalidate",
						},
					});
				}
			}

			const publicPath = join(options.publicDir, pathname);
			if (isReadableFile(publicPath)) {
				return new Response(Bun.file(publicPath), {
					headers: {
						"Content-Type": resolveMime(pathname),
						"Cache-Control": "no-cache, no-store, must-revalidate",
					},
				});
			}

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
					const ms = Date.now() - requestStartMs;
					terminal.logRequest({
						method: request.method,
						pathname,
						status: 405,
						totalMs: ms,
					});
					return new Response("Method not allowed", { status: 405 });
				}

				const apiResponse = await handler(request);
				const ms = Date.now() - requestStartMs;
				terminal.logRequest({
					method: request.method,
					pathname,
					status: apiResponse.status,
					totalMs: ms,
				});
				return apiResponse;
			}

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

			const ms = Date.now() - requestStartMs;

			if (result.kind === "failure") {
				terminal.logRequest({
					method: request.method,
					pathname,
					status: result.httpStatus,
					totalMs: ms,
				});
				return new Response(result.reason, { status: result.httpStatus });
			}

			// Inject livereload WebSocket into dev HTML.
			const liveReloadScript = `<script>
  (function(){
    const ws=new WebSocket("ws://"+location.host+"/__livereload");
    ws.onmessage=()=>location.reload();
  })();
</script>`;
			const finalHtml = result.html.replace(
				"</body>",
				`${liveReloadScript}</body>`,
			);

			terminal.logRequest({
				method: request.method,
				pathname,
				status: result.httpStatus,
				totalMs: ms,
			});

			return new Response(finalHtml, {
				status: result.httpStatus,
				headers: result.responseHeaders,
			});
		},
	});

	const serverPort =
		typeof server.port === "number" ? server.port : resolvedPort;

	const displayHost =
		options.host === "0.0.0.0" || options.host === "::"
			? "localhost"
			: options.host;

	const localUrl = `http://${displayHost}:${serverPort}`;

	// Print startup banner now that the server is accepting connections.
	terminal.printStartup(localUrl);

	try {
		watch(options.projectRoot, { recursive: true }, (_eventType, filename) => {
			const changedPath =
				typeof filename === "string"
					? join(options.projectRoot, filename)
					: null;

			if (shouldReloadForPath(changedPath)) {
				isClientBundleDirty = true;
				server.publish("livereload", "reload");
			}
		});
	} catch {
		// Some filesystems (e.g. certain Linux containers) do not support
		// recursive watch. Dev server still functions — just no HMR.
	}

	return {
		port: serverPort,
		host: options.host,
		url: localUrl,
		stop: () => server.stop(),
	};
}
