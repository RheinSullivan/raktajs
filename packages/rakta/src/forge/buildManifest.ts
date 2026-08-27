/**
 * BuildManifest — machine-readable description of every production artifact
 * that Rakta.js emits.
 *
 * Written to <outDir>/build-manifest.json after every successful build.
 * Deployment adapters consume this file to know exactly what was produced
 * and where each artifact lives.
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { RAKTA_VERSION } from "../frameworkIdentity";
import type { RenderMode } from "../render/types";

// Schema version — increment when the shape changes in a breaking way.
export const BUILD_MANIFEST_VERSION = 1;

export interface BuildManifestRoute {
	/** URL pattern, e.g. "/" or "/blog/:slug". */
	readonly pattern: string;
	/** File path relative to appDir. */
	readonly filePath: string;
	/** Resolved render mode for this route. */
	readonly mode: RenderMode;
	/** Absolute path to the generated HTML file for SSG routes. */
	readonly htmlPath?: string;
}

export interface BuildManifestClient {
	/** Absolute path to the main JS entry asset (e.g. dist/client/app.js). */
	readonly entry: string;
	/** Absolute paths to all CSS assets. */
	readonly css: string[];
	/** All asset paths (JS chunks, images, fonts, etc.). */
	readonly assets: string[];
}

export interface BuildManifestServer {
	/** Absolute path to the server entry point. */
	readonly entry: string;
	/** Runtime the server was compiled for. */
	readonly runtime: "bun" | "node";
}

export interface BuildManifestDeployment {
	/** Platform this build was adapted for, if any. */
	readonly platform?: string;
	/** Directory containing platform-specific deployment artifacts. */
	readonly outputDir?: string;
}

export interface BuildManifest {
	/** Schema version. */
	readonly version: typeof BUILD_MANIFEST_VERSION;
	/** Rakta.js version that produced this manifest. */
	readonly frameworkVersion: string;
	/** ISO timestamp of when the build completed. */
	readonly builtAt: string;
	/** Primary rendering mode of the application. */
	readonly rendering: RenderMode;
	/** Whether this was a production build (minified, optimized). */
	readonly production: boolean;
	/** Total build duration in milliseconds. */
	readonly buildMs: number;
	/** Client-side assets. Always present. */
	readonly client: BuildManifestClient;
	/** Server bundle info. Present only for SSR/edge/isr/streaming_ssr. */
	readonly server?: BuildManifestServer;
	/** Per-route information. */
	readonly routes: BuildManifestRoute[];
	/** Deployment adapter info, if a platform build was run. */
	readonly deployment?: BuildManifestDeployment;
}

export interface BuildManifestInput {
	readonly rendering: RenderMode;
	readonly production: boolean;
	readonly buildMs: number;
	readonly client: BuildManifestClient;
	readonly server?: BuildManifestServer;
	readonly routes: BuildManifestRoute[];
	readonly deployment?: BuildManifestDeployment;
}
export function createBuildManifest(input: BuildManifestInput): BuildManifest {
	return {
		version: BUILD_MANIFEST_VERSION,
		frameworkVersion: RAKTA_VERSION,
		builtAt: new Date().toISOString(),
		...input,
	};
}

/** Writes a BuildManifest to <outDir>/build-manifest.json. */
export function writeBuildManifest(
	manifest: BuildManifest,
	outDir: string,
): string {
	const manifestPath = join(outDir, "build-manifest.json");
	writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
	return manifestPath;
}

/** Reads and parses a BuildManifest from <outDir>/build-manifest.json. */
export function readBuildManifest(outDir: string): BuildManifest | null {
	try {
		const manifestPath = join(outDir, "build-manifest.json");
		if (!existsSync(manifestPath)) return null;
		const raw = readFileSync(manifestPath, "utf-8");
		return JSON.parse(raw) as BuildManifest;
	} catch {
		return null;
	}
}

/** Creates a BuildManifest value from the given input. */
