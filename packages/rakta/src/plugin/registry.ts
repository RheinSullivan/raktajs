import type {
	RaktaOfficialPlugin,
	RaktaPluginCapability,
	RaktaPluginManifest,
	RaktaPluginTemplate,
} from "./types";

export class RaktaPluginRegistry {
	readonly #plugins = new Map<string, RaktaOfficialPlugin>();
	readonly #capabilities = new Map<RaktaPluginCapability, Set<string>>();

	register(plugin: RaktaOfficialPlugin): void {
		this.#plugins.set(plugin.manifest.name, plugin);

		for (const capability of plugin.manifest.capabilities) {
			const names = this.#capabilities.get(capability) ?? new Set<string>();
			names.add(plugin.manifest.name);
			this.#capabilities.set(capability, names);
		}
	}

	list(): readonly RaktaPluginManifest[] {
		return Array.from(this.#plugins.values()).map((entry) => entry.manifest);
	}

	withCapability(
		capability: RaktaPluginCapability,
	): readonly RaktaPluginManifest[] {
		const names = this.#capabilities.get(capability) ?? new Set<string>();
		return Array.from(names)
			.map((name) => this.#plugins.get(name)?.manifest)
			.filter(
				(manifest): manifest is RaktaPluginManifest => manifest !== undefined,
			);
	}
}

export function createPluginRegistry(
	plugins: readonly RaktaOfficialPlugin[] = [],
): RaktaPluginRegistry {
	const registry = new RaktaPluginRegistry();

	for (const plugin of plugins) {
		registry.register(plugin);
	}

	return registry;
}

export function createPluginTemplate(
	manifest: RaktaPluginManifest,
): RaktaPluginTemplate {
	return {
		packageName: manifest.name,
		files: {
			"package.json": `${JSON.stringify(
				{
					name: manifest.name,
					version: manifest.version,
					type: "module",
					main: manifest.entry ?? "src/index.ts",
				},
				undefined,
				2,
			)}\n`,
			"src/index.ts": `import type { RaktaPlugin } from "rakta/kernel";\n\nexport const plugin: RaktaPlugin = {\n\tname: "${manifest.name}",\n};\n`,
			"rakta.plugin.json": `${JSON.stringify(manifest, undefined, 2)}\n`,
		},
	};
}
