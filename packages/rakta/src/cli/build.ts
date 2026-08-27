import { isAbsolute, join } from "node:path";
import { loadConfig } from "../config/loadConfig";
import { buildProject } from "../forge/build";
import { validateAndReport } from "../forge/buildValidator";
import type { RenderMode } from "../render/types";

function resolveProjectPath(cwd: string, pathValue: string): string {
	if (isAbsolute(pathValue)) {
		return pathValue;
	}

	return join(cwd, pathValue);
}

const VALID_MODES: ReadonlySet<string> = new Set([
	"csr",
	"spa",
	"ssg",
	"csg",
	"ssr",
	"hybrid",
	"isr",
	"streaming_ssr",
	"edge",
]);

function parseModeFlag(args: string[]): RenderMode | undefined {
	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		if (arg === "--mode" && i + 1 < args.length) {
			const value = args[i + 1];
			if (value !== undefined && VALID_MODES.has(value)) {
				return value as RenderMode;
			}
			process.stderr.write(
				`\n  Rakta.js build error: invalid --mode value "${value}".\n` +
					`  Valid modes: ${[...VALID_MODES].join(", ")}\n\n`,
			);
			process.exit(1);
		}
		if (arg?.startsWith("--mode=")) {
			const value = arg.slice("--mode=".length);
			if (VALID_MODES.has(value)) {
				return value as RenderMode;
			}
			process.stderr.write(
				`\n  Rakta.js build error: invalid --mode value "${value}".\n` +
					`  Valid modes: ${[...VALID_MODES].join(", ")}\n\n`,
			);
			process.exit(1);
		}
	}
	return undefined;
}

export async function buildCommand(
	cwd: string = process.cwd(),
	args: string[] = process.argv.slice(2),
): Promise<void> {
	const projectConfig = await loadConfig(cwd);

	const appDirectory = projectConfig.appDir ?? "app";
	const publicDirectory = projectConfig.publicDir ?? "public";
	const outputDirectory = projectConfig.build.outDir ?? "dist";
	const entryFile = projectConfig.build.entryPoint ?? "entry.client.tsx";
	const port = projectConfig.port ?? 3000;

	const entryPoint = resolveProjectPath(join(cwd, appDirectory), entryFile);
	const outDir = resolveProjectPath(cwd, outputDirectory);

	// CLI --mode flag overrides rakta.config.ts rendering.defaultMode
	const modeOverride = parseModeFlag(args);
	const renderConfig =
		modeOverride !== undefined
			? { ...projectConfig.render, defaultMode: modeOverride }
			: projectConfig.render;

	const effectiveMode = renderConfig.defaultMode;

	const modeLabel = effectiveMode.toUpperCase();

	console.log(`\n  ⩛ Rakta.js production build\n`);
	console.log(`    Rendering mode:  ${modeLabel}`);
	console.log(`    Output:          ${outDir}`);
	console.log(`    Minify:          ${projectConfig.build.minify ?? true}`);
	console.log(``);

	const buildStart = Date.now();

	const buildResult = await buildProject({
		projectRoot: cwd,
		entryPoint,
		outDir,
		appDir: join(cwd, appDirectory),
		publicDir: join(cwd, publicDirectory),
		appName: projectConfig.appName,
		seo: projectConfig.seo,
		port,
		sourcemap: projectConfig.build.sourcemap ?? false,
		minify: projectConfig.build.minify ?? true,
		splitting: projectConfig.build.splitting ?? false,
		target: projectConfig.build.target ?? "browser",
		renderConfig,
	});

	if (!buildResult.success) {
		process.stderr.write(`\n  Rakta.js build failed.\n\n`);
		process.stderr.write(`  Rendering mode: ${modeLabel}\n\n`);

		if (buildResult.errors.length > 0) {
			process.stderr.write(`  Build errors (${buildResult.errors.length}):\n`);
			for (const buildError of buildResult.errors) {
				process.stderr.write(`    ✗ ${buildError}\n`);
			}
			process.stderr.write(`\n`);
		}

		process.stderr.write(`  Check:\n`);
		process.stderr.write(`    - Entry file: ${entryPoint}\n`);
		process.stderr.write(`    - App directory: ${join(cwd, appDirectory)}\n`);
		process.stderr.write(
			`    - That all imports in your app/ directory resolve correctly\n`,
		);
		process.stderr.write(
			`    - Run "bun install" to ensure dependencies are installed\n`,
		);
		process.stderr.write(`\n`);

		process.exit(1);
	}

	// Validate the build output
	if (buildResult.buildManifest !== undefined) {
		const valid = validateAndReport(buildResult.buildManifest);
		if (!valid) {
			process.exit(1);
		}
	}

	const totalMs = Date.now() - buildStart;
	const artifactCount = buildResult.artifacts.length;
	const mode = buildResult.effectiveMode ?? effectiveMode;

	console.log(`  ✓ Build complete in ${totalMs}ms`);
	console.log(`    Rendering mode:  ${mode.toUpperCase()}`);
	console.log(`    Output:          ${outDir}`);
	console.log(`    Artifacts:       ${artifactCount}`);

	// Print artifact summary
	const scripts = buildResult.artifacts.filter(
		(a) => a.kind === "script" && !a.outputPath.includes("route-manifest"),
	);
	const stylesheets = buildResult.artifacts.filter(
		(a) => a.kind === "stylesheet",
	);
	const htmlFiles = buildResult.artifacts.filter(
		(a) => a.kind === "asset" && a.outputPath.endsWith(".html"),
	);

	if (scripts.length > 0) {
		const totalKb = (
			scripts.reduce((sum, a) => sum + a.sizeBytes, 0) / 1024
		).toFixed(1);
		console.log(
			`    JS:              ${scripts.length} file(s) (${totalKb} KB)`,
		);
	}
	if (stylesheets.length > 0) {
		const totalKb = (
			stylesheets.reduce((sum, a) => sum + a.sizeBytes, 0) / 1024
		).toFixed(1);
		console.log(
			`    CSS:             ${stylesheets.length} file(s) (${totalKb} KB)`,
		);
	}
	if (htmlFiles.length > 0) {
		console.log(`    HTML:            ${htmlFiles.length} page(s) generated`);
	}

	if (
		mode === "ssr" ||
		mode === "streaming_ssr" ||
		mode === "edge" ||
		mode === "isr"
	) {
		const serverEntry = buildResult.buildManifest?.server?.entry;
		if (serverEntry !== undefined) {
			console.log(`    Server:          ${serverEntry}`);
			console.log(`\n  Start server: bun run start\n`);
		}
	} else {
		console.log(
			`\n  Deploy the "${outputDirectory}/" folder to any static host.\n`,
		);
	}
}
