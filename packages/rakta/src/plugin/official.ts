import type { RaktaOfficialPlugin, RaktaPluginCapability } from "./types";

const OFFICIAL_PLUGIN_DEFINITIONS: readonly {
	readonly name: string;
	readonly version: string;
	readonly description: string;
	readonly capabilities: readonly RaktaPluginCapability[];
}[] = [
	{
		name: "@rakta/react",
		version: "1.0.9",
		description:
			"React 19 runtime support with Fast Refresh and JSX transform.",
		capabilities: ["react", "runtime"],
	},
	{
		name: "@rakta/tailwind",
		version: "1.0.9",
		description: "Tailwind CSS v4 integration with PostCSS pipeline.",
		capabilities: ["build"],
	},
	{
		name: "@rakta/vue",
		version: "1.0.9",
		description: "Vue 3 rendering runtime support.",
		capabilities: ["react", "runtime"],
	},
	{
		name: "@rakta/svelte",
		version: "1.0.9",
		description: "Svelte 5 rendering runtime support.",
		capabilities: ["react", "runtime"],
	},
	{
		name: "@rakta/mdx",
		version: "1.0.9",
		description: "MDX file support with React integration.",
		capabilities: ["mdx", "docs"],
	},
	{
		name: "@rakta/pwa",
		version: "1.0.9",
		description:
			"Progressive Web App - service worker, web manifest, install prompt.",
		capabilities: ["pwa", "build"],
	},
	{
		name: "@rakta/vercel",
		version: "1.0.9",
		description:
			"First-class Vercel deployment adapter with Edge Functions support.",
		capabilities: ["deployment"],
	},
	{
		name: "@rakta/netlify",
		version: "1.0.9",
		description: "Netlify deployment adapter with Functions and Edge support.",
		capabilities: ["deployment"],
	},
	{
		name: "@rakta/cloudflare",
		version: "1.0.9",
		description: "Cloudflare Workers + Pages deployment adapter.",
		capabilities: ["deployment", "runtime"],
	},
	{
		name: "@rakta/node",
		version: "1.0.9",
		description: "Node.js production server adapter.",
		capabilities: ["deployment", "runtime"],
	},
	{
		name: "@rakta/bun",
		version: "1.0.9",
		description: "Bun native server adapter - fastest cold start.",
		capabilities: ["deployment", "runtime"],
	},
	{
		name: "@rakta/docker",
		version: "1.0.9",
		description:
			"Dockerfile and docker-compose generator for containerized deployments.",
		capabilities: ["deployment"],
	},
];

export function createOfficialPlugins(): readonly RaktaOfficialPlugin[] {
	return OFFICIAL_PLUGIN_DEFINITIONS.map((definition) => ({
		manifest: {
			name: definition.name,
			version: definition.version,
			description: definition.description,
			capabilities: definition.capabilities,
		},
		plugin: {
			name: definition.name,
			async configure(context) {
				context.registerFeature({
					name: definition.name,
					options: { version: definition.version },
				});
			},
		},
	}));
}
