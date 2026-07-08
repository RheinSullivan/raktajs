import { existsSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { generateManifest, writeManifest } from "../router/manifest";
import { writeClientEntry } from "./clientEntry";
import type {
	ForgeBuildArtifact,
	ForgeBuildOptions,
	ForgeBuildResult,
} from "./types";

/**
 * Runs the Rakta.js Forge build pipeline.
 * Uses Bun.build for bundling. Generates a route manifest alongside the bundle.
 */
export async function buildProject(
	options: ForgeBuildOptions,
): Promise<ForgeBuildResult> {
	const startMs = Date.now();
	const artifacts: ForgeBuildArtifact[] = [];
	const errors: string[] = [];

	mkdirSync(resolve(options.outDir), { recursive: true });

	// Generate and write route manifest
	const manifest = generateManifest(options.appDir);
	const manifestPath = join(options.outDir, "route-manifest.json");
	writeManifest(manifest, manifestPath);

	const manifestContent = JSON.stringify(manifest);
	artifacts.push({
		outputPath: manifestPath,
		sizeBytes: new TextEncoder().encode(manifestContent).byteLength,
		kind: "manifest",
	});

	const entryPoint = existsSync(options.entryPoint)
		? options.entryPoint
		: writeClientEntry({
				projectRoot: options.projectRoot,
				appDir: options.appDir,
				workDir: join(options.projectRoot, ".rakta"),
				manifest,
			});

	// Build JavaScript bundle
	const buildResult = await Bun.build({
		entrypoints: [entryPoint],
		outdir: options.outDir,
		target: options.target,
		minify: options.minify,
		sourcemap: options.sourcemap ? "external" : "none",
		splitting: options.splitting,
		naming: {
			entry: "app.[ext]",
			chunk: "chunks/[name]-[hash].[ext]",
			asset: "assets/[name]-[hash].[ext]",
		},
	});

	if (!buildResult.success) {
		for (const log of buildResult.logs) {
			errors.push(log.message);
		}
		return {
			success: false,
			artifacts,
			manifest,
			buildMs: Date.now() - startMs,
			errors,
		};
	}

	for (const output of buildResult.outputs) {
		artifacts.push({
			outputPath: output.path,
			sizeBytes: output.size,
			kind: output.path.endsWith(".css") ? "stylesheet" : "script",
		});
	}

	return {
		success: true,
		artifacts,
		manifest,
		buildMs: Date.now() - startMs,
		errors: [],
	};
}
