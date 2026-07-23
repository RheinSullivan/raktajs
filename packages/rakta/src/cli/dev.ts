import { networkInterfaces } from "node:os";
import { join } from "node:path";
import { loadConfig } from "../config/loadConfig";
import { startDevServer } from "../forge/devServer";

function getLocalIpAddress(): string {
	const interfaces = networkInterfaces();
	for (const name of Object.keys(interfaces)) {
		for (const iface of interfaces[name] ?? []) {
			if (iface.family === "IPv4" && !iface.internal) {
				return iface.address;
			}
		}
	}
	return "127.0.0.1";
}

export async function devCommand(cwd: string = process.cwd()): Promise<void> {
	const startTime = Date.now();
	const config = await loadConfig(cwd);

	const server = await startDevServer({
		projectRoot: cwd,
		port: config.port,
		host: config.server.hostname ?? "0.0.0.0",
		appDir: join(cwd, config.appDir),
		publicDir: join(cwd, config.publicDir),
		appName: config.appName,
		seo: config.seo,
		renderConfig: config.render,
	});

	const durationMs = Date.now() - startTime;
	const localIp = getLocalIpAddress();
	const port = server.port ?? config.port;

	console.log(
		`\n  \x1b[31m</>\x1b[0m \x1b[1mRakta.js 1.0.2\x1b[0m \x1b[2m(CherbonsEngine)\x1b[0m`,
	);
	console.log(
		`  \x1b[2m-\x1b[0m Local:         \x1b[36mhttp://localhost:${port}\x1b[0m`,
	);
	console.log(
		`  \x1b[2m-\x1b[0m Network:       \x1b[36mhttp://${localIp}:${port}\x1b[0m`,
	);
	console.log(`  \x1b[2m-\x1b[0m Environments: \x1b[2m.env.local\x1b[0m`);
	console.log(`  \x1b[32m✓\x1b[0m Ready in ${durationMs}ms\n`);
}
