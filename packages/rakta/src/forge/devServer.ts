import { existsSync, readFileSync, statSync, watch } from "node:fs";
import { join, relative } from "node:path";
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
 * Powered by Bun.serve. HMR is a roadmap feature (v0.2.4).
 */
export async function startDevServer(
	options: ForgeDevServerOptions,
): Promise<ForgeDevServerHandle> {
	const manifest = generateManifest(options.appDir);
	const resolvedPort = resolveDevPort(options.port);
	let clientOutDir = await buildDevClientBundle(options, manifest);
	let isClientBundleDirty = false;
	let clientBundleRebuild: Promise<void> | null = null;

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
			message() {},
		},

		async fetch(request: Request, server): Promise<Response> {
			if (request.url.endsWith("/__livereload")) {
				const upgraded = server.upgrade(request);
				if (upgraded) {
					return new Response(null);
				}
			}

			const url = new URL(request.url);
			const { pathname } = url;

			if (clientOutDir.length > 0) {
				await ensureFreshClientBundle();
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
			await ensureFreshClientBundle();
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

			const liveReloadScript = `
<script>
  (function() {
    const ws = new WebSocket("ws://" + location.host + "/__livereload");
    ws.onmessage = () => location.reload();
  })();
</script>`;
			const finalHtml = result.html.replace(
				"</body>",
				`${liveReloadScript}</body>`,
			);

			return new Response(finalHtml, {
				status: result.httpStatus,
				headers: result.responseHeaders,
			});
		},
	});

	const serverPort =
		typeof server.port === "number" ? server.port : resolvedPort;

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
		// Some filesystems do not support recursive watch. The dev server still runs.
	}

	const displayHost =
		options.host === "0.0.0.0" || options.host === "::"
			? "localhost"
			: options.host;

	return {
		port: serverPort,
		host: options.host,
		url: `http://${displayHost}:${serverPort}`,
		stop: () => server.stop(),
	};
}
