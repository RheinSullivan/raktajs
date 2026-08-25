import { join } from "node:path";
import { loadConfig } from "../config/loadConfig";
import { startDevServer } from "../forge/devServer";

export async function devCommand(cwd: string = process.cwd()): Promise<void> {
	const configStart = Date.now();
	const config = await loadConfig(cwd);
	const configMs = Date.now() - configStart;

	const devToolsEnabled =
		typeof config.devTools === "boolean"
			? config.devTools
			: config.devTools.enabled;

	await startDevServer({
		projectRoot: cwd,
		port: config.port,
		host: config.server.hostname ?? "0.0.0.0",
		appDir: join(cwd, config.appDir),
		publicDir: join(cwd, config.publicDir),
		appName: config.appName,
		seo: config.seo,
		renderConfig: config.render,
		devTools: devToolsEnabled,
		configMs,
	});
}
