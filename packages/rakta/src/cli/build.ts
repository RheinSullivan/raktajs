import { isAbsolute, join } from "node:path";
import { loadConfig } from "../config/loadConfig";
import { buildProject } from "../forge/build";

function resolveProjectPath(cwd: string, pathValue: string): string {
	if (isAbsolute(pathValue)) {
		return pathValue;
	}

	return join(cwd, pathValue);
}

export async function buildCommand(cwd: string = process.cwd()): Promise<void> {
	const projectConfig = await loadConfig(cwd);

	const appDirectory = projectConfig.appDir ?? "app";
	const publicDirectory = projectConfig.publicDir ?? "public";
	const outputDirectory = projectConfig.build.outDir ?? "dist";
	const entryFile = projectConfig.build.entryPoint ?? "entry.client.tsx";

	const entryPoint = resolveProjectPath(join(cwd, appDirectory), entryFile);
	const outDir = resolveProjectPath(cwd, outputDirectory);

	console.log("\n  Building Rakta.js application...\n");

	const buildResult = await buildProject({
		entryPoint,
		outDir,
		appDir: join(cwd, appDirectory),
		publicDir: join(cwd, publicDirectory),
		appName: projectConfig.appName,
		sourcemap: projectConfig.build.sourcemap ?? false,
		minify: projectConfig.build.minify ?? true,
		splitting: projectConfig.build.splitting ?? false,
		target: projectConfig.build.target ?? "browser",
		renderConfig: projectConfig.render,
	});

	if (!buildResult.success) {
		console.error("Build failed:");

		for (const buildError of buildResult.errors) {
			console.error(`${buildError}`);
		}

		process.exit(1);
	}

	console.log(`Build complete in ${buildResult.buildMs}ms`);
	console.log(`Output: ${outDir}`);
	console.log(`Artifacts: ${buildResult.artifacts.length}\n`);
}
