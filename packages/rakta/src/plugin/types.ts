import type { RaktaPlugin } from "../kernel";

export type RaktaPluginCapability =
	| "react"
	| "mdx"
	| "pwa"
	| "deployment"
	| "runtime"
	| "build"
	| "docs"
	| "testing";

export interface RaktaPluginManifest {
	readonly name: string;
	readonly version: string;
	readonly description?: string;
	readonly capabilities: readonly RaktaPluginCapability[];
	readonly entry?: string;
}

export interface RaktaPluginTemplate {
	readonly packageName: string;
	readonly files: Readonly<Record<string, string>>;
}

export interface RaktaOfficialPlugin {
	readonly manifest: RaktaPluginManifest;
	readonly plugin: RaktaPlugin;
}
