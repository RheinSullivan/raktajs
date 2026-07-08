import { join } from "node:path";
import { loadConfig } from "../config/loadConfig";
import { startDevServer } from "../forge/devServer";

export async function devCommand(cwd: string = process.cwd()): Promise<void> {
	const config = await loadConfig(cwd);

	console.log(`\n  Starting Rakta.js dev server...\n`);

	const server = await startDevServer({
		projectRoot: cwd,
		port: config.port,
		host: config.server.hostname ?? "0.0.0.0",
		appDir: join(cwd, config.appDir),
		publicDir: join(cwd, config.publicDir),
		appName: config.appName,
		renderConfig: config.render,
	});

	console.log(`  Ready at ${server.url}\n`);
}
