import type { SeoConfig } from "../config/defineConfig.js";
import type { RenderConfig, RenderMode } from "../render/types.js";
import type { RouteManifest } from "../router/types.js";
import type { BuildManifest } from "./buildManifest.js";

export interface ForgeDevServerOptions {
	readonly projectRoot: string;
	readonly port: number;
	readonly host: string;
	readonly appDir: string;
	readonly publicDir: string;
	readonly appName: string;
	readonly seo: SeoConfig;
	readonly renderConfig: RenderConfig;
	readonly devTools: boolean;
	/**
	 * How long the config file took to load and execute, in milliseconds.
	 * Reported in the startup banner as:
	 *   ✓ Running rakta.config.ts took <configMs>
	 */
	readonly configMs?: number;
}

export interface ForgeBuildOptions {
	readonly projectRoot: string;
	readonly entryPoint: string;
	readonly outDir: string;
	readonly appDir: string;
	readonly publicDir: string;
	readonly appName: string;
	readonly seo?: SeoConfig;
	readonly sourcemap: boolean;
	readonly minify: boolean;
	readonly splitting: boolean;
	readonly target: "browser" | "bun" | "node";
	readonly renderConfig: RenderConfig;
	/** Optional server port for SSR server entry generation. */
	readonly port?: number;
}

export type ArtifactKind = "script" | "stylesheet" | "asset" | "manifest";

export interface ForgeBuildArtifact {
	readonly outputPath: string;
	readonly sizeBytes: number;
	readonly kind: ArtifactKind;
}

export interface ForgeBuildResult {
	readonly success: boolean;
	readonly artifacts: ReadonlyArray<ForgeBuildArtifact>;
	readonly manifest: RouteManifest;
	readonly buildMs: number;
	readonly errors: ReadonlyArray<string>;
	/** Machine-readable build manifest. Present on successful builds. */
	readonly buildManifest?: BuildManifest;
	/** The effective render mode used for the build (hybrid resolves to csr). */
	readonly effectiveMode?: RenderMode;
}

export interface ForgeRouteModeEntry {
	readonly pattern: string;
	readonly mode: RenderMode;
	readonly source: "route-override" | "default";
}

export interface ForgeInspectReport {
	readonly buildDir: string;
	readonly artifacts: ReadonlyArray<ForgeBuildArtifact>;
	readonly manifest: RouteManifest;
	readonly routeModes: ReadonlyArray<ForgeRouteModeEntry>;
	readonly totalSizeBytes: number;
	readonly inspectedAt: string;
}

export interface ForgeDevServerHandle {
	readonly port: number;
	readonly host: string;
	readonly url: string;
	readonly stop: () => void;
}
