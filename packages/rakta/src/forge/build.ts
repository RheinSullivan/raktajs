/**
 * Rakta.js Forge Build Pipeline.
 *
 * This is the application production build entry point.
 * It is NOT a TypeScript compilation step — it transforms an application into
 * deployable artifacts depending on the configured rendering mode.
 *
 * Pipeline:
 *   load config
 *   → scan routes
 *   → generate route manifest
 *   → build client bundle (always)
 *   → write index.html shell (CSR/SPA/hybrid)
 *   → generate static HTML per route (SSG/CSG)
 *   → generate server entry (SSR/streaming_ssr/edge/isr)
 *   → copy public assets
 *   → write build manifest
 *   → validate output
 */

import {
	cpSync,
	existsSync,
	mkdirSync,
	readdirSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { isBuildTimeMode, requiresServer } from "../render/modes";
import type { RenderMode } from "../render/types";
import { generateManifest, writeManifest } from "../router/manifest";
import {
	type BuildManifestClient,
	type BuildManifestRoute,
	type BuildManifestServer,
	createBuildManifest,
	writeBuildManifest,
} from "./buildManifest";
import { writeClientEntry } from "./clientEntry";
import {
	generateStaticPages,
	type SsgRendererOptions,
	type SsgRouteInput,
	toManifestRoutes,
	writeCsrIndexHtml,
} from "./ssg";
import { buildServerEntry } from "./ssr";
import type {
	ForgeBuildArtifact,
	ForgeBuildOptions,
	ForgeBuildResult,
} from "./types";

/**
 * Determines the effective render mode for the build pipeline.
 * Hybrid builds default to CSR at the application level; per-route overrides
 * are respected at request time.
 */
function resolveEffectiveBuildMode(mode: RenderMode): RenderMode {
	if (mode === "hybrid") return "csr";
	return mode;
}

/**
 * Determines whether the build target for the client bundle should be set
 * to "browser" or "bun" based on the rendering mode.
 */
function resolveClientTarget(_mode: RenderMode): "browser" | "bun" | "node" {
	// All modes need a browser bundle for the client side.
	return "browser";
}

/**
 * Copies the contents of the public directory (if it exists) into the output
 * directory so static assets are available at the root URL path.
 */
function copyPublicAssets(
	publicDir: string,
	outDir: string,
	artifacts: ForgeBuildArtifact[],
): void {
	if (!existsSync(publicDir)) return;

	try {
		cpSync(publicDir, outDir, { recursive: true });

		// Record each copied file as an artifact
		const walk = (dir: string): void => {
			for (const entry of readdirSync(dir)) {
				const full = join(dir, entry);
				if (statSync(full).isDirectory()) {
					walk(full);
				} else {
					artifacts.push({
						outputPath: full,
						sizeBytes: statSync(full).size,
						kind: "asset",
					});
				}
			}
		};
		walk(publicDir);
	} catch {
		// Non-fatal: public dir copy failure should not fail the build
	}
}

/**
 * Runs the Rakta.js Forge build pipeline.
 *
 * Produces real deployment artifacts based on the rendering mode:
 *   CSR / SPA / hybrid → dist/index.html + dist/app.js + dist/app.css
 *   SSG / CSG          → dist/<route>/index.html + client assets
 *   SSR / edge / isr   → dist/client/ + dist/server/index.js
 */
export async function buildProject(
	options: ForgeBuildOptions,
): Promise<ForgeBuildResult> {
	const startMs = Date.now();
	const artifacts: ForgeBuildArtifact[] = [];
	const errors: string[] = [];

	const effectiveMode = resolveEffectiveBuildMode(
		options.renderConfig.defaultMode,
	);
	const needsServer = requiresServer(effectiveMode);
	const needsStaticGen = isBuildTimeMode(effectiveMode);

	// For SSR: client assets go into dist/client/, server into dist/server/
	// For CSR/SSG: everything goes directly into dist/
	const clientOutDir = needsServer
		? join(resolve(options.outDir), "client")
		: resolve(options.outDir);

	mkdirSync(clientOutDir, { recursive: true });

	// 1. Generate and write route manifest
	const manifest = generateManifest(options.appDir);
	const manifestPath = join(clientOutDir, "route-manifest.json");
	writeManifest(manifest, manifestPath);

	artifacts.push({
		outputPath: manifestPath,
		sizeBytes: new TextEncoder().encode(JSON.stringify(manifest)).byteLength,
		kind: "manifest",
	});

	// 2. Resolve the client entry point
	const entryPoint = existsSync(options.entryPoint)
		? options.entryPoint
		: writeClientEntry({
				projectRoot: options.projectRoot,
				appDir: options.appDir,
				workDir: join(options.projectRoot, ".rakta"),
				manifest,
				devToolsEnabled: false,
			});

	// 3. Build the client JavaScript bundle
	const buildResult = await Bun.build({
		entrypoints: [entryPoint],
		outdir: clientOutDir,
		target: resolveClientTarget(effectiveMode),
		minify: options.minify,
		sourcemap: options.sourcemap ? "external" : "none",
		splitting: options.splitting,
		define: {
			"process.env.NODE_ENV": JSON.stringify("production"),
		},
		naming: {
			entry: "app.[ext]",
			chunk: "chunks/[name]-[hash].[ext]",
			asset: "assets/[name]-[hash].[ext]",
		},
	});

	if (!buildResult.success) {
		for (const log of buildResult.logs) {
			const pos = log.position;
			if (pos?.file) {
				const location = [
					pos.file,
					pos.line != null ? `line ${pos.line}` : null,
					pos.column != null ? `col ${pos.column}` : null,
				]
					.filter(Boolean)
					.join(", ");
				errors.push(
					`[${log.level.toUpperCase()}] ${log.message} (at ${location})`,
				);
			} else {
				errors.push(`[${log.level.toUpperCase()}] ${log.message}`);
			}
		}

		return {
			success: false,
			artifacts,
			manifest,
			buildMs: Date.now() - startMs,
			errors,
		};
	}

	// Track JS and CSS output paths
	let jsEntryPath = "";
	const cssPaths: string[] = [];

	for (const output of buildResult.outputs) {
		const isCSS = output.path.endsWith(".css");
		artifacts.push({
			outputPath: output.path,
			sizeBytes: output.size,
			kind: isCSS ? "stylesheet" : "script",
		});
		if (isCSS) {
			cssPaths.push(output.path);
		} else if (
			output.path.endsWith(".js") &&
			!output.path.includes("chunks/")
		) {
			jsEntryPath = output.path;
		}
	}

	// Fallback: if no non-chunk JS was found, pick the first JS output
	if (jsEntryPath === "" && buildResult.outputs.length > 0) {
		const firstJs = buildResult.outputs.find((o) => o.path.endsWith(".js"));
		if (firstJs) jsEntryPath = firstJs.path;
	}

	const cssPath = cssPaths[0] ?? "";

	// 4. Copy public assets
	copyPublicAssets(options.publicDir, resolve(options.outDir), artifacts);

	// 5. Determine script/CSS URL paths for HTML generation
	// For SSR: assets are under /client/ prefix; for CSR: at root
	const scriptUrlPath = needsServer
		? `/client/${jsEntryPath
				.replace(clientOutDir, "")
				.replace(/^[\\/]/, "")
				.replace(/\\/g, "/")}`
		: `/${jsEntryPath
				.replace(clientOutDir, "")
				.replace(/^[\\/]/, "")
				.replace(/\\/g, "/")}`;

	const cssUrlPath =
		cssPath.length > 0
			? needsServer
				? `/client/${cssPath
						.replace(clientOutDir, "")
						.replace(/^[\\/]/, "")
						.replace(/\\/g, "/")}`
				: `/${cssPath
						.replace(clientOutDir, "")
						.replace(/^[\\/]/, "")
						.replace(/\\/g, "/")}`
			: needsServer
				? "/client/app.css"
				: "/app.css";

	const rendererOptions: SsgRendererOptions = {
		appName: options.appName,
		scriptPath: scriptUrlPath.replace(/\/+/g, "/"),
		cssPath: cssUrlPath.replace(/\/+/g, "/"),
		lang: "en",
		...(options.seo?.defaultTitle !== undefined
			? { title: options.seo.defaultTitle }
			: {}),
		...(options.seo?.defaultDescription !== undefined
			? { description: options.seo.defaultDescription }
			: {}),
	};

	// 6. Mode-specific pipeline steps
	let ssgManifestRoutes: BuildManifestRoute[] = [];

	if (needsStaticGen) {
		// SSG / CSG: generate per-route HTML files
		const ssgDir = needsServer
			? join(resolve(options.outDir), "static")
			: resolve(options.outDir);

		const ssgInputs: SsgRouteInput[] = manifest.routes
			.filter((r) => r.kind === "page")
			.map((entry) => ({
				entry,
				mode: options.renderConfig.routes[entry.urlPattern] ?? effectiveMode,
			}));

		const ssgResult = await generateStaticPages({
			outDir: ssgDir,
			routes: ssgInputs,
			renderer: rendererOptions,
		});

		for (const route of ssgResult.routes) {
			if (route.success && route.htmlPath.length > 0) {
				artifacts.push({
					outputPath: route.htmlPath,
					sizeBytes: route.sizeBytes,
					kind: "asset",
				});
			}
		}

		if (!ssgResult.success) {
			errors.push(...ssgResult.errors);
		}

		ssgManifestRoutes = toManifestRoutes(
			ssgResult.routes,
			effectiveMode,
			manifest.routes,
		);

		// Always write a root index.html for the SPA fallback
		writeCsrIndexHtml(resolve(options.outDir), rendererOptions);
	} else {
		// CSR / SPA / hybrid: write index.html shell at dist/index.html
		const indexPath = writeCsrIndexHtml(
			resolve(options.outDir),
			rendererOptions,
		);
		artifacts.push({
			outputPath: indexPath,
			sizeBytes: statSync(indexPath).size,
			kind: "asset",
		});

		// Build route list without htmlPath (served dynamically / by SPA rewrite)
		ssgManifestRoutes = manifest.routes
			.filter((r) => r.kind === "page")
			.map((entry) => ({
				pattern: entry.urlPattern,
				filePath: entry.filePath,
				mode: options.renderConfig.routes[entry.urlPattern] ?? effectiveMode,
			}));
	}

	// 7. SSR: build the production server entry
	let serverManifest: BuildManifestServer | undefined;

	if (needsServer) {
		const port = typeof options.port === "number" ? options.port : 3000;

		const ssrResult = await buildServerEntry({
			projectRoot: options.projectRoot,
			outDir: resolve(options.outDir),
			clientOutDir,
			appDir: options.appDir,
			publicDir: options.publicDir,
			appName: options.appName,
			seo: options.seo ?? {},
			renderConfig: options.renderConfig,
			port,
			runtime: "bun",
		});

		if (!ssrResult.success) {
			errors.push(...ssrResult.errors);
		} else {
			artifacts.push({
				outputPath: ssrResult.serverEntry,
				sizeBytes: statSync(ssrResult.serverEntry).size,
				kind: "script",
			});

			serverManifest = {
				entry: ssrResult.serverEntry,
				runtime: "bun",
			};
		}
	}

	// 8. Write build manifest
	const clientManifest: BuildManifestClient = {
		entry: jsEntryPath,
		css: cssPaths,
		assets: buildResult.outputs
			.filter(
				(o) => !o.path.endsWith(".css") && !o.path.includes("route-manifest"),
			)
			.map((o) => o.path),
	};

	const buildManifest = createBuildManifest({
		rendering: options.renderConfig.defaultMode,
		production: true,
		buildMs: Date.now() - startMs,
		client: clientManifest,
		routes: ssgManifestRoutes,
		...(serverManifest !== undefined ? { server: serverManifest } : {}),
	});

	const buildManifestPath = writeBuildManifest(
		buildManifest,
		resolve(options.outDir),
	);

	artifacts.push({
		outputPath: buildManifestPath,
		sizeBytes: new TextEncoder().encode(JSON.stringify(buildManifest))
			.byteLength,
		kind: "manifest",
	});

	// 9. Generate deployment adapter outputs (Vercel Build Output API v3, Netlify, etc.)
	generateDeploymentOutputs({
		projectRoot: options.projectRoot,
		outDir: resolve(options.outDir),
		effectiveMode,
		needsServer,
		artifacts,
	});

	return {
		success: errors.length === 0,
		artifacts,
		manifest,
		buildMs: Date.now() - startMs,
		errors,
		buildManifest,
		effectiveMode,
	};
}

/**
 * Generates platform-specific deployment artifacts:
 * - Netlify/Cloudflare: dist/_redirects for SPA routing
 * - Vercel: .vercel/output with config.json and static assets (Vercel Build Output API v3)
 */
function generateDeploymentOutputs(opts: {
	projectRoot: string;
	outDir: string;
	effectiveMode: RenderMode;
	needsServer: boolean;
	artifacts: ForgeBuildArtifact[];
}): void {
	const { projectRoot, outDir, effectiveMode: _mode, needsServer, artifacts } = opts;

	// 1. Static host redirects (Netlify / Cloudflare Pages / Static hosts)
	const redirectsPath = join(outDir, "_redirects");
	try {
		writeFileSync(
			redirectsPath,
			needsServer
				? `/*  /.netlify/functions/server  200\n`
				: `/*  /index.html  200\n`,
			"utf8",
		);
		artifacts.push({
			outputPath: redirectsPath,
			sizeBytes: statSync(redirectsPath).size,
			kind: "asset",
		});
	} catch {
		// Non-fatal
	}

	// 2. Vercel Build Output API v3 (.vercel/output)
	try {
		const vercelOutputDir = join(projectRoot, ".vercel", "output");
		const vercelStaticDir = join(vercelOutputDir, "static");
		mkdirSync(vercelStaticDir, { recursive: true });

		// Copy static assets from outDir to .vercel/output/static
		cpSync(outDir, vercelStaticDir, { recursive: true });

		// Vercel config.json
		const vercelConfig = {
			version: 3,
			routes: [
				{
					src: "^/chunks/(.+\\.[a-f0-9]{8,}\\.(js|css))$",
					headers: {
						"cache-control": "public, max-age=31536000, immutable",
					},
					continue: true,
				},
				{
					handle: "filesystem",
				},
				{
					src: "/(.*)",
					dest: needsServer ? "/index.func" : "/index.html",
				},
			],
		};

		const vercelConfigPath = join(vercelOutputDir, "config.json");
		writeFileSync(
			vercelConfigPath,
			JSON.stringify(vercelConfig, null, 2),
			"utf8",
		);

		// Vercel project metadata
		const vercelProjectDir = join(projectRoot, ".vercel");
		const vercelProjectPath = join(vercelProjectDir, "project.json");
		writeFileSync(
			vercelProjectPath,
			JSON.stringify(
				{ framework: "raktajs", buildOutputPath: ".vercel/output" },
				null,
				2,
			),
			"utf8",
		);

		if (needsServer) {
			const functionsDir = join(
				vercelOutputDir,
				"functions",
				"index.func",
			);
			mkdirSync(functionsDir, { recursive: true });
			writeFileSync(
				join(functionsDir, ".vc-config.json"),
				JSON.stringify(
					{
						runtime: "nodejs20.x",
						handler: "index.js",
						launcherType: "Nodejs",
						shouldAddHelpers: true,
					},
					null,
					2,
				),
				"utf8",
			);
			writeFileSync(
				join(functionsDir, "index.js"),
				`const { createRaktaRequestHandler } = await import("raktajs/runtime/server");
const { loadConfig } = await import("raktajs/config");
const path = await import("node:path");

const cwd = process.cwd();
const config = await loadConfig(cwd);

const handler = createRaktaRequestHandler({
  projectRoot: cwd,
  appDir: path.join(cwd, config.appDir),
  publicDir: path.join(cwd, config.publicDir),
  outDir: path.join(cwd, config.build.outDir ?? "dist"),
  appName: config.appName,
  seo: config.seo,
  renderConfig: config.render,
});

export default async function (request) {
  return handler(request);
}
`,
				"utf8",
			);
		}
	} catch {
		// Non-fatal
	}
}
