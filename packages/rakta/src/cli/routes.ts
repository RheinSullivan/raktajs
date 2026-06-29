import { join } from "node:path";
import { loadConfig } from "../config/loadConfig";
import { generateManifest, printManifest } from "../router/manifest";

export async function routesCommand(
	cwd: string = process.cwd(),
): Promise<void> {
	const config = await loadConfig(cwd);
	const appDir = join(cwd, config.appDir);
	const manifest = generateManifest(appDir);
	printManifest(manifest);
}
