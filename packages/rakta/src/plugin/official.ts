import type { RaktaOfficialPlugin, RaktaPluginCapability } from "./types";

const OFFICIAL_PLUGIN_DEFINITIONS: readonly {
	readonly name: string;
	readonly capabilities: readonly RaktaPluginCapability[];
}[] = [
	{ name: "@rakta/react", capabilities: ["react", "runtime"] },
	{ name: "@rakta/mdx", capabilities: ["mdx", "docs"] },
	{ name: "@rakta/pwa", capabilities: ["pwa", "build"] },
	{ name: "@rakta/vercel", capabilities: ["deployment"] },
	{ name: "@rakta/netlify", capabilities: ["deployment"] },
	{ name: "@rakta/cloudflare", capabilities: ["deployment", "runtime"] },
	{ name: "@rakta/node", capabilities: ["deployment", "runtime"] },
	{ name: "@rakta/bun", capabilities: ["deployment", "runtime"] },
	{ name: "@rakta/docker", capabilities: ["deployment"] },
];

export function createOfficialPlugins(): readonly RaktaOfficialPlugin[] {
	return OFFICIAL_PLUGIN_DEFINITIONS.map((definition) => ({
		manifest: {
			name: definition.name,
			version: "1.0.0",
			capabilities: definition.capabilities,
		},
		plugin: {
			name: definition.name,
		},
	}));
}
