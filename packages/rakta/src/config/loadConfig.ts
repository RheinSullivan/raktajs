import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import type { RaktaConfig } from "./defineConfig";
import { defaultConfig } from "./defineConfig";

const CONFIG_FILENAMES: ReadonlyArray<string> = [
	"rakta.config.ts",
	"rakta.config.js",
	"rakta.config.mts",
	"rakta.config.mjs",
];

export async function loadConfig(
	cwd: string = process.cwd(),
): Promise<Required<RaktaConfig>> {
	const resolvedCwd = resolve(cwd);

	for (const filename of CONFIG_FILENAMES) {
		const configPath = join(resolvedCwd, filename);

		if (!existsSync(configPath)) {
			continue;
		}

		const configModule = (await import(configPath)) as {
			default?: RaktaConfig;
		};
		const userConfig: RaktaConfig = configModule.default ?? {};

		return mergeConfig(defaultConfig, userConfig);
	}

	return defaultConfig;
}

export function mergeConfig(
	baseConfig: Required<RaktaConfig>,
	overrideConfig: RaktaConfig,
): Required<RaktaConfig> {
	return {
		appName: overrideConfig.appName ?? baseConfig.appName,
		appDir: overrideConfig.appDir ?? baseConfig.appDir,
		publicDir: overrideConfig.publicDir ?? baseConfig.publicDir,
		port: overrideConfig.port ?? baseConfig.port,
		css:
			overrideConfig.css !== undefined
				? { ...baseConfig.css, ...overrideConfig.css }
				: baseConfig.css,
		seo:
			overrideConfig.seo !== undefined
				? { ...baseConfig.seo, ...overrideConfig.seo }
				: baseConfig.seo,
		server:
			overrideConfig.server !== undefined
				? { ...baseConfig.server, ...overrideConfig.server }
				: baseConfig.server,
		build:
			overrideConfig.build !== undefined
				? { ...baseConfig.build, ...overrideConfig.build }
				: baseConfig.build,
		autoImport:
			overrideConfig.autoImport !== undefined
				? { ...baseConfig.autoImport, ...overrideConfig.autoImport }
				: baseConfig.autoImport,
		rpc:
			overrideConfig.rpc !== undefined
				? { ...baseConfig.rpc, ...overrideConfig.rpc }
				: baseConfig.rpc,
		render:
			overrideConfig.render !== undefined
				? {
						defaultMode:
							overrideConfig.render.defaultMode ??
							baseConfig.render.defaultMode,
						routes: {
							...baseConfig.render.routes,
							...overrideConfig.render.routes,
						},
					}
				: baseConfig.render,
	};
}
