import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
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

		const configModule = (await import(pathToFileURL(configPath).href)) as {
			default?: RaktaConfig;
		};
		const userConfig: RaktaConfig = configModule.default ?? {};

		return mergeConfig(defaultConfig, userConfig);
	}

	return defaultConfig;
}

function parsePort(val: unknown): number | undefined {
	if (
		typeof val === "number" &&
		!Number.isNaN(val) &&
		val >= 1 &&
		val <= 65535
	) {
		return val;
	}
	if (typeof val === "string") {
		const parsed = Number.parseInt(val, 10);
		if (!Number.isNaN(parsed) && parsed >= 1 && parsed <= 65535) {
			return parsed;
		}
	}
	return undefined;
}

export function mergeConfig(
	baseConfig: Required<RaktaConfig>,
	overrideConfig: RaktaConfig,
): Required<RaktaConfig> {
	const envPort = parsePort(process.env.RAKTA_PORT ?? process.env.PORT);
	const userPort =
		parsePort(overrideConfig.port) ?? parsePort(overrideConfig.server?.port);
	const resolvedPort = envPort ?? userPort ?? baseConfig.port;

	const baseDevTools =
		typeof baseConfig.devTools === "boolean"
			? { enabled: baseConfig.devTools }
			: baseConfig.devTools;

	return {
		appName: overrideConfig.appName ?? baseConfig.appName,
		appDir: overrideConfig.appDir ?? baseConfig.appDir,
		publicDir: overrideConfig.publicDir ?? baseConfig.publicDir,
		port: resolvedPort,
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
				? { ...baseConfig.server, port: resolvedPort, ...overrideConfig.server }
				: { ...baseConfig.server, port: resolvedPort },
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
		devTools:
			overrideConfig.devTools !== undefined
				? typeof overrideConfig.devTools === "boolean"
					? { enabled: overrideConfig.devTools }
					: { ...baseDevTools, ...overrideConfig.devTools }
				: baseConfig.devTools,
	};
}
