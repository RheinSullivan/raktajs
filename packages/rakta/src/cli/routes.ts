import { join } from "node:path";
import { loadConfig } from "../config/loadConfig";
import { generateManifest, printManifest } from "../router/manifest";

export async function routesCommand(
	currentWorkingDirectory: string = process.cwd(),
): Promise<void> {
	const config = await loadConfig(currentWorkingDirectory);
	const appDir = join(currentWorkingDirectory, config.appDir);
	const manifest = generateManifest(appDir);
	printManifest(manifest);
}
