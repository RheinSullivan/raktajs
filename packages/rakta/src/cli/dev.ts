import { join } from "node:path";
import { loadConfig } from "../config/loadConfig";
import { startDevServer } from "../forge/devServer";

export async function devCommand(
	currentWorkingDirectory: string = process.cwd(),
): Promise<void> {
	const configStartTime = Date.now();
	const config = await loadConfig(currentWorkingDirectory);
	const configDurationMilliseconds = Date.now() - configStartTime;

	const devToolsEnabled =
		typeof config.devTools === "boolean"
			? config.devTools
			: config.devTools.enabled;

	await startDevServer({
		projectRoot: currentWorkingDirectory,
		port: config.port,
		host: config.server.hostname ?? "0.0.0.0",
		appDir: join(currentWorkingDirectory, config.appDir),
		publicDir: join(currentWorkingDirectory, config.publicDir),
		appName: config.appName,
		seo: config.seo,
		renderConfig: config.render,
		devTools: devToolsEnabled,
		configDurationMs: configDurationMilliseconds,
	});
}
