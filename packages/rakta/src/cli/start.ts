import { join } from "node:path";
import { loadConfig } from "../config/loadConfig";
import { createBunAdapter } from "../tide/adapter";

export async function startCommand(cwd: string = process.cwd()): Promise<void> {
	const projectConfig = await loadConfig(cwd);
	const outputDirectory = projectConfig.build.outDir ?? "dist";

	console.log("\n Starting Rakta.js production server...\n");

	const serverAdapter = createBunAdapter(
		{
			kind: "bun",
			port: projectConfig.port,
			host: projectConfig.server.hostname ?? "0.0.0.0",
			appName: projectConfig.appName,
			seo: projectConfig.seo,
			appDir: join(cwd, projectConfig.appDir),
			publicDir: join(cwd, projectConfig.publicDir),
			outDir: join(cwd, outputDirectory),
		},
		projectConfig.render,
	);

	await serverAdapter.start();
}
