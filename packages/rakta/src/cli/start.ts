import { existsSync } from "node:fs";
import { join } from "node:path";
import { loadConfig } from "../config/loadConfig";
import { readBuildManifest } from "../forge/buildManifest";
import { requiresServer } from "../render/modes";
import { startProductionServer } from "../runtime/server";

export async function startCommand(
	currentWorkingDirectory: string = process.cwd(),
): Promise<void> {
	const projectConfig = await loadConfig(currentWorkingDirectory);
	const outputDirectory = projectConfig.build.outDir ?? "dist";
	const outDir = join(currentWorkingDirectory, outputDirectory);

	// Check if a build exists
	if (!existsSync(outDir)) {
		process.stderr.write(
			`\n  Rakta.js start error: build output directory not found.\n` +
				`\n  Directory: ${outDir}` +
				`\n  Run "bun run build" first.\n\n`,
		);
		process.exit(1);
	}

	// Read the build manifest to understand what was built
	const buildManifest = readBuildManifest(outDir);
	const effectiveMode =
		buildManifest?.rendering ?? projectConfig.render.defaultMode;
	const needsServer = requiresServer(effectiveMode);

	// For SSR: check if the server entry exists
	if (needsServer) {
		const serverEntry =
			buildManifest?.server?.entry ?? join(outDir, "server", "index.js");

		if (existsSync(serverEntry)) {
			// Use the generated server entry directly (it is self-contained)
			console.log(
				`\n  ⩛ Rakta.js production server (${effectiveMode.toUpperCase()})\n`,
			);
			console.log(`    Loading: ${serverEntry}\n`);

			// Dynamically import and run the self-contained server entry
			await import(serverEntry);
			return;
		}

		process.stderr.write(
			`\n  Rakta.js start error: SSR server entry not found.\n` +
				`\n  Expected: ${serverEntry}` +
				`\n  Rendering mode: ${effectiveMode.toUpperCase()}` +
				`\n` +
				`\n  This usually means the build did not produce a server artifact.` +
				`\n  Run "bun run build" to regenerate the build.\n\n`,
		);
		process.exit(1);
	}

	// CSR / SSG / SPA: use the Rakta runtime server to serve static files
	console.log(
		`\n  ⩛ Rakta.js production server (${effectiveMode.toUpperCase()})\n`,
	);

	const { url } = await startProductionServer({
		projectRoot: currentWorkingDirectory,
		appDir: join(currentWorkingDirectory, projectConfig.appDir),
		publicDir: join(currentWorkingDirectory, projectConfig.publicDir),
		outDir,
		appName: projectConfig.appName,
		seo: projectConfig.seo,
		renderConfig: projectConfig.render,
		port: projectConfig.port,
		host: projectConfig.server.hostname ?? "0.0.0.0",
	});

	console.log(`    Local:  ${url}`);
	console.log(`    Mode:   production (${effectiveMode.toUpperCase()})\n`);
}
