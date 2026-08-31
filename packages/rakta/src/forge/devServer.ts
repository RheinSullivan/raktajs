import { existsSync, readFileSync, statSync, watch } from "node:fs";
import { join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";

function safePathJoin(baseDir: string, relativePath: string): string | null {
	try {
		const decoded = decodeURIComponent(relativePath);
		const resolvedBase = resolve(baseDir);
		const resolvedFile = resolve(join(resolvedBase, decoded));

		if (
			resolvedFile === resolvedBase ||
			resolvedFile.startsWith(`${resolvedBase}/`) ||
			resolvedFile.startsWith(`${resolvedBase}\\`)
		) {
			return resolvedFile;
		}
	} catch {
		// URI malformed or path resolution failure
	}
	return null;
}

import { createDevTerminal } from "../developerExperience/terminal";
import {
	applyRaktaDetectionHeaders,
	createRaktaDetectionHeaders,
	RAKTA_VERSION,
} from "../frameworkIdentity";
import { resolveRouteMode } from "../render/modes";
import { render } from "../render/renderer";
import { generateManifest } from "../router/manifest";
import { matchRoute } from "../router/matcher";
import { writeClientEntry } from "./clientEntry";
import {
	clearRaktaDevelopmentCache,
	createRaktaDevToolsJsonResponse,
	RAKTA_DEVTOOLS_CONTROL_BASE_PATH,
	resolveRaktaDevToolsRouteInfo,
} from "./devTools";
import type { ForgeDevServerHandle, ForgeDevServerOptions } from "./types";

const DEFAULT_DEV_PORT = 3000;
const MAX_PORT_SCAN = 50;

/**
 * Probes whether a TCP port is available on the given host.
 * Returns true if the port is free, false if already in use.
 */
async function isPortFree(port: number, host: string): Promise<boolean> {
	return new Promise((resolve) => {
		try {
			const server = Bun.listen({
				hostname: host === "0.0.0.0" || host === "::" ? "127.0.0.1" : host,
				port,
				socket: {
					open(socket) {
						socket.end();
					},
					data() {},
					error() {},
				},
			});
			server.stop(true);
			resolve(true);
		} catch {
			resolve(false);
		}
	});
}

/**
 * Finds the first available port starting from preferredPort.
 * Scans up to MAX_PORT_SCAN consecutive ports before giving up.
 */
async function findAvailablePort(
	preferredPort: number,
	host: string,
): Promise<number> {
	const base = preferredPort > 0 ? preferredPort : DEFAULT_DEV_PORT;
	for (let offset = 0; offset < MAX_PORT_SCAN; offset++) {
		const candidate = base + offset;
		if (await isPortFree(candidate, host)) {
			return candidate;
		}
	}
	// Let OS assign a free port
	return 0;
}

function resolveDevPort(port: number): number {
	return port > 0 ? port : DEFAULT_DEV_PORT;
}

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

function isReadableFile(filePath: string): boolean {
	return existsSync(filePath) && statSync(filePath).isFile();
}

function withRaktaDetectionHeaders(response: Response): Response {
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

function formatBuildDiagnostic(log: {
	message: string;
	level: string;
	position?: { file?: string; line?: number; column?: number } | null;
}): string {
	const level = log.level.toUpperCase();
	const pos = log.position;
	if (pos?.file) {
		const location = [
			pos.file,
			pos.line != null ? `line ${pos.line}` : null,
			pos.column != null ? `col ${pos.column}` : null,
		]
			.filter(Boolean)
			.join(", ");
		return `  [${level}] ${log.message}\n         at ${location}`;
	}
	return `  [${level}] ${log.message}`;
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
		devToolsEnabled: options.devTools,
	});

	const buildResult = await Bun.build({
		entrypoints: [clientEntry],
		outdir: clientOutDir,
		target: "browser",
		sourcemap: "external",
		define: {
			"process.env.NODE_ENV": JSON.stringify("development"),
		},
		naming: {
			entry: "app.[ext]",
			chunk: "chunks/[name]-[hash].[ext]",
			asset: "assets/[name]-[hash].[ext]",
		},
	});

	if (!buildResult.success) {
		const errors = buildResult.logs.filter((log) => log.level === "error");
		const warnings = buildResult.logs.filter((log) => log.level === "warning");

		const lines: string[] = ["Bundle failed - Rakta.js client build error\n"];

		if (errors.length > 0) {
			lines.push(`Errors (${errors.length}):`);
			for (const log of errors) lines.push(formatBuildDiagnostic(log));
		}
		if (warnings.length > 0) {
			lines.push(`\nWarnings (${warnings.length}):`);
			for (const log of warnings) lines.push(formatBuildDiagnostic(log));
		}
		lines.push(
			`\nEntry file: ${clientEntry}`,
			`Project:    ${options.projectRoot}`,
			`\nHint: Check that all imports in your app/ directory resolve correctly.`,
			`      Run "bun install" to ensure dependencies are installed.`,
		);

		throw new Error(lines.join("\n"));
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
 *   ⩛ Rakta.js 1.2.0 (CherbonsEngine)
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
	let manifest = generateManifest(options.appDir);
	const preferredPort = resolveDevPort(options.port);
	const resolvedPort = await findAvailablePort(
		preferredPort,
		options.host ?? "0.0.0.0",
	);

	// Track first-request compile start for compile state logging.
	// We print "○ Compiling / ..." before the initial bundle is served.
	let firstCompileDone = false;
	let compilingFor: string | null = null;

	let clientOutDir = await buildDevClientBundle(options, manifest);
	let isClientBundleDirty = false;
	let clientBundleRebuild: Promise<void> | null = null;
	let devToolsCommand: Promise<Response> | null = null;

	// Development-only. Zero cost in production: this module is never imported
	// by the production server path (tide/adapter.ts).
	// Read version from the closest raktajs package.json at runtime
	let _rVersion = RAKTA_VERSION;
	try {
		const _pkgCandidates = [
			join(options.projectRoot, "node_modules", "raktajs", "package.json"),
			join(__dirname, "..", "..", "package.json"),
		];
		for (const _p of _pkgCandidates) {
			if (existsSync(_p)) {
				const _pkg = JSON.parse(readFileSync(_p, "utf8")) as {
					version?: string;
				};
				if (typeof _pkg.version === "string") {
					_rVersion = _pkg.version;
					break;
				}
			}
		}
	} catch {
		// fall back to default
	}

	const terminal = createDevTerminal({
		version: _rVersion,
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

		clientBundleRebuild ??= (async () => {
			const rebuildStart = Date.now();
			if (compilingFor !== null) {
				terminal.printCompileStart(compilingFor);
			}
			const nextClientOutDir = await buildDevClientBundle(options, manifest);
			clientOutDir = nextClientOutDir;
			isClientBundleDirty = false;
			clientBundleRebuild = null;
			const rebuildMs = Date.now() - rebuildStart;
			terminal.logRebuild(rebuildMs);
		})().catch((caughtError: unknown) => {
			clientBundleRebuild = null;
			terminal.logError("Incremental rebuild failed", caughtError);
			isClientBundleDirty = false;
		});

		await clientBundleRebuild;
	}

	async function restartDevelopmentServer(): Promise<Response> {
		if (devToolsCommand !== null) {
			return createRaktaDevToolsJsonResponse(
				{
					ok: false,
					message: "A Rakta DevTools command is already running.",
				},
				409,
			);
		}

		devToolsCommand = (async () => {
			try {
				manifest = generateManifest(options.appDir);
				clientOutDir = await buildDevClientBundle(options, manifest);
				isClientBundleDirty = false;
				server.publish(
					"livereload",
					JSON.stringify({ type: "devtools:restart" }),
				);
				return createRaktaDevToolsJsonResponse({
					ok: true,
					message: "Rakta development server was restarted.",
				});
			} catch (caughtError) {
				return createRaktaDevToolsJsonResponse(
					{
						ok: false,
						message:
							caughtError instanceof Error
								? caughtError.message
								: "Rakta development server restart failed.",
					},
					500,
				);
			} finally {
				devToolsCommand = null;
			}
		})();

		return devToolsCommand;
	}

	async function resetDevelopmentCache(): Promise<Response> {
		if (devToolsCommand !== null) {
			return createRaktaDevToolsJsonResponse(
				{
					ok: false,
					message: "A Rakta DevTools command is already running.",
				},
				409,
			);
		}

		devToolsCommand = (async () => {
			const cacheResult = clearRaktaDevelopmentCache(options.projectRoot);
			if (!cacheResult.ok) {
				devToolsCommand = null;
				return createRaktaDevToolsJsonResponse(cacheResult, 400);
			}

			try {
				manifest = generateManifest(options.appDir);
				clientOutDir = await buildDevClientBundle(options, manifest);
				isClientBundleDirty = false;
				server.publish(
					"livereload",
					JSON.stringify({ type: "devtools:cache-reset" }),
				);
				return createRaktaDevToolsJsonResponse({
					ok: true,
					message: "Rakta bundler cache was reset and rebuilt.",
				});
			} catch (caughtError) {
				return createRaktaDevToolsJsonResponse(
					{
						ok: false,
						message:
							caughtError instanceof Error
								? caughtError.message
								: "Rakta bundler cache reset failed.",
					},
					500,
				);
			} finally {
				devToolsCommand = null;
			}
		})();

		return devToolsCommand;
	}

	const createServeOptions = (port: number) => ({
		port,
		hostname: options.host,
		websocket: {
			open(ws: import("bun").ServerWebSocket<unknown>) {
				ws.subscribe("livereload");
			},
			message() {
				// no-op
			},
		},

		async fetch(
			request: Request,
			server: import("bun").Server<unknown>,
		): Promise<Response> {
			// Measure every request from arrival to response.
			// This is the server-side half; browser-side timing is in JatiLens.
			const requestStartMs = Date.now();

			if (request.url.endsWith("/__livereload")) {
				const upgraded = server.upgrade(request, { data: undefined });
				if (upgraded) return new Response(null);
			}

			const url = new URL(request.url);
			const { pathname } = url;

			if (
				options.devTools &&
				pathname.startsWith(RAKTA_DEVTOOLS_CONTROL_BASE_PATH)
			) {
				if (
					pathname === `${RAKTA_DEVTOOLS_CONTROL_BASE_PATH}/route` &&
					request.method === "GET"
				) {
					const routePathname = url.searchParams.get("pathname") ?? "/";
					return createRaktaDevToolsJsonResponse(
						resolveRaktaDevToolsRouteInfo({
							pathname: routePathname,
							manifest,
							renderConfig: options.renderConfig,
						}),
					);
				}

				if (
					pathname === `${RAKTA_DEVTOOLS_CONTROL_BASE_PATH}/restart` &&
					request.method === "POST"
				) {
					return restartDevelopmentServer();
				}

				if (
					pathname === `${RAKTA_DEVTOOLS_CONTROL_BASE_PATH}/cache/reset` &&
					request.method === "POST"
				) {
					return resetDevelopmentCache();
				}

				return createRaktaDevToolsJsonResponse(
					{
						ok: false,
						message: "Unknown Rakta DevTools command.",
					},
					404,
				);
			}

			// Rebuild bundle if source changed since last request.
			// Track which route triggered the compile for the compile state log.
			compilingFor = pathname;
			if (!firstCompileDone) {
				terminal.printCompileStart(pathname);
			}
			const bundleStart = Date.now();
			await ensureFreshClientBundle();
			const bundleMs = Date.now() - bundleStart;
			if (!firstCompileDone) {
				if (bundleMs > 50) {
					terminal.printCompileEnd(pathname, bundleMs);
				}
				firstCompileDone = true;
			}

			if (clientOutDir.length > 0) {
				const clientBundlePath = safePathJoin(clientOutDir, pathname);
				if (clientBundlePath !== null && isReadableFile(clientBundlePath)) {
					const isHashedAsset = pathname.includes("/chunks/");
					return new Response(Bun.file(clientBundlePath), {
						headers: {
							...createRaktaDetectionHeaders("bun"),
							"Content-Type": resolveMime(clientBundlePath),
							"Cache-Control": isHashedAsset
								? "public, max-age=31536000, immutable"
								: "no-cache, no-store, must-revalidate",
						},
					});
				}
			}

			const publicPath = safePathJoin(options.publicDir, pathname);
			if (publicPath !== null && isReadableFile(publicPath)) {
				return new Response(Bun.file(publicPath), {
					headers: {
						...createRaktaDetectionHeaders("bun"),
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
				try {
					const routeModule = (await import(
						pathToFileURL(modulePath).href
					)) as ApiRouteExports;
					const method = request.method.toUpperCase() as keyof ApiRouteExports;
					const handler = routeModule[method];

					if (typeof handler !== "function") {
						const ms = Date.now() - requestStartMs;
						terminal.logRequest({
							method: request.method,
							pathname,
							status: 405,
							totalMs: ms,
							kind: "api",
						});
						return withRaktaDetectionHeaders(
							new Response("Method not allowed", { status: 405 }),
						);
					}

					const apiResponse = await handler(request);
					const ms = Date.now() - requestStartMs;
					terminal.logRequest({
						method: request.method,
						pathname,
						status: apiResponse.status,
						totalMs: ms,
						kind: "api",
					});
					return withRaktaDetectionHeaders(apiResponse);
				} catch (caughtError) {
					const ms = Date.now() - requestStartMs;
					terminal.logRequest({
						method: request.method,
						pathname,
						status: 500,
						totalMs: ms,
						kind: "api",
					});
					return withRaktaDetectionHeaders(
						new Response(
							caughtError instanceof Error
								? caughtError.message
								: "Internal API Error",
							{ status: 500 },
						),
					);
				}
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

			const renderStart = Date.now();
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
			const renderMs = Date.now() - renderStart;
			const frameworkMs = ms - renderMs;

			if (result.kind === "failure") {
				terminal.logRequest({
					method: request.method,
					pathname,
					status: result.httpStatus,
					totalMs: ms,
					kind: "page",
					frameworkMs,
					applicationMs: renderMs,
				});
				return withRaktaDetectionHeaders(
					new Response(result.reason, { status: result.httpStatus }),
				);
			}

			// Inject Rakta.js Fast Refresh & Hot Module Replacement (HMR) Client Engine.
			// Fast Refresh: Automatically updates code changes in browser on save WITHOUT losing component state.
			// HMR: Low-level WebSocket technology that swaps modules directly without full page reload.
			const fastRefreshScript = `<script>
  (function(){
    if (window.__RAKTA_HMR_INITIALIZED__) return;
    window.__RAKTA_HMR_INITIALIZED__ = true;
    
    let socket;
    let reconnectAttempts = 0;
    
    function saveState() {
      const state = {
        scrollX: window.scrollX,
        scrollY: window.scrollY,
        activeId: document.activeElement ? document.activeElement.id : null,
        inputs: {}
      };
      document.querySelectorAll("input, textarea, select").forEach((el, idx) => {
        const key = el.id || el.name || "input_" + idx;
        state.inputs[key] = el.value;
      });
      return state;
    }

    function restoreState(state) {
      if (!state) return;
      window.scrollTo(state.scrollX, state.scrollY);
      if (state.inputs) {
        document.querySelectorAll("input, textarea, select").forEach((el, idx) => {
          const key = el.id || el.name || "input_" + idx;
          if (state.inputs[key] !== undefined && el.value !== state.inputs[key]) {
            el.value = state.inputs[key];
          }
        });
      }
      if (state.activeId) {
        const active = document.getElementById(state.activeId);
        if (active && typeof active.focus === "function") active.focus();
      }
    }

    function connect() {
      const protocol = location.protocol === "https:" ? "wss:" : "ws:";
      socket = new WebSocket(protocol + "//" + location.host + "/__livereload");

      socket.onopen = () => {
        reconnectAttempts = 0;
        console.log("%c⩛ [Rakta Fast Refresh]%c HMR active & connected", "color:#f43f5e;font-weight:bold", "color:#a1a1aa");
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "fast-refresh" || data.type === "hmr:update") {
            console.log("%c⩛ [Rakta Fast Refresh]%c Updating component: " + (data.file || "module"), "color:#f43f5e;font-weight:bold", "color:#38bdf8");
            const saved = saveState();
            // Fast Refresh: dispatch event for SPA shell to re-import modified component
            window.dispatchEvent(new CustomEvent("rakta:fast-refresh", { detail: data }));
            setTimeout(() => restoreState(saved), 50);
            return;
          }
        } catch (_) {}

        // Fallback reload if non-JSON or full-reload requested
        console.log("%c⩛ [Rakta HMR]%c Code change detected, reloading page...", "color:#f43f5e;font-weight:bold", "color:#a1a1aa");
        const saved = saveState();
        try { sessionStorage.setItem("__rakta_state__", JSON.stringify(saved)); } catch(_){}
        location.reload();
      };

      socket.onclose = () => {
        if (reconnectAttempts++ < 10) {
          setTimeout(connect, 1000);
        }
      };
    }

    // Restore state after page reload if applicable
    try {
      const savedRaw = sessionStorage.getItem("__rakta_state__");
      if (savedRaw) {
        sessionStorage.removeItem("__rakta_state__");
        const saved = JSON.parse(savedRaw);
        window.addEventListener("DOMContentLoaded", () => restoreState(saved), { once: true });
      }
    } catch(_){}

    connect();
  })();
</script>`;
			const finalHtml = result.html.replace(
				"</body>",
				`${fastRefreshScript}</body>`,
			);

			terminal.logRequest({
				method: request.method,
				pathname,
				status: result.httpStatus,
				totalMs: ms,
				kind: "page",
				frameworkMs,
				applicationMs: renderMs,
			});

			return withRaktaDetectionHeaders(
				new Response(finalHtml, {
					status: result.httpStatus,
					headers: result.responseHeaders,
				}),
			);
		},
	});

	let server: ReturnType<typeof Bun.serve>;
	let serverPort = resolvedPort;

	for (let offset = 0; offset < MAX_PORT_SCAN; offset++) {
		const targetPort = resolvedPort + offset;
		try {
			server = Bun.serve(createServeOptions(targetPort));
			serverPort = typeof server.port === "number" ? server.port : targetPort;
			break;
		} catch (_err) {
			if (offset === MAX_PORT_SCAN - 1) {
				server = Bun.serve(createServeOptions(0));
				serverPort = typeof server.port === "number" ? server.port : 0;
			}
		}
	}

	const displayHost =
		options.host === "0.0.0.0" || options.host === "::"
			? "localhost"
			: options.host;

	const localUrl = `http://${displayHost}:${serverPort}`;

	// Inform user if we had to switch to a different port
	if (serverPort !== preferredPort && preferredPort > 0) {
		process.stderr.write(
			`\x1b[33m⚠\x1b[0m  Port \x1b[1m${preferredPort}\x1b[0m is already in use. Using port \x1b[1m${serverPort}\x1b[0m instead.\n\n`,
		);
	}

	// Print startup banner - version, local/network URLs, env files, ready time, config timing.
	terminal.printStartup(localUrl, options.configDurationMs);

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
		// recursive watch. Dev server still functions - just no HMR.
	}

	return {
		port: serverPort,
		host: options.host,
		url: localUrl,
		stop: () => server.stop(),
	};
}
