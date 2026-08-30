/**
 * rakta deploy --platform <target>
 *
 * Generates platform-specific deployment artifacts by:
 * 1. Reading the build manifest from the output directory.
 * 2. Creating the deployment adapter for the target platform.
 * 3. Writing the adapter's files into the project root.
 *
 * This does NOT perform the actual deployment. It produces the config and
 * wrapper files that the target platform's CLI or CI pipeline uses.
 *
 * Examples:
 *   rakta deploy --platform vercel     → writes .vercel/output/config.json etc.
 *   rakta deploy --platform netlify    → writes netlify.toml, _redirects
 *   rakta deploy --platform cloudflare → writes wrangler.toml, worker.js
 *   rakta deploy --platform docker     → writes Dockerfile, .dockerignore
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { loadConfig } from "../config/loadConfig";
import { createDeploymentAdapter } from "../deployment/adapters";
import type { DeploymentTarget } from "../deployment/types";
import { readBuildManifest } from "../forge/buildManifest";

const VALID_PLATFORMS: ReadonlySet<string> = new Set([
	"vercel",
	"netlify",
	"cloudflare",
	"cloudflare-workers",
	"cloudflare-pages",
	"railway",
	"render",
	"fly",
	"docker",
	"node",
	"bun",
	"github-pages",
	"static",
	"aws-lambda",
]);

// Normalize shorthand aliases to canonical DeploymentTarget values
function normalizePlatform(platformValue: string): DeploymentTarget {
	if (platformValue === "cloudflare") return "cloudflare-pages";
	if (platformValue === "github") return "github-pages";
	return platformValue as DeploymentTarget;
}

function parsePlatformFlag(argumentList: string[]): string | undefined {
	for (let index = 0; index < argumentList.length; index++) {
		const argument = argumentList[index];
		if (argument === "--platform" && index + 1 < argumentList.length) {
			return argumentList[index + 1];
		}
		if (argument?.startsWith("--platform=")) {
			return argument.slice("--platform=".length);
		}
	}
	return undefined;
}

export async function deployCommand(
	currentWorkingDirectory: string = process.cwd(),
	commandArguments: string[] = process.argv.slice(2),
): Promise<void> {
	const platformArgument = parsePlatformFlag(commandArguments);

	if (platformArgument === undefined || platformArgument.trim().length === 0) {
		process.stderr.write(
			`\n  Rakta.js deploy error: --platform is required.\n` +
				`\n  Usage: rakta deploy --platform <target>` +
				`\n  Targets: ${[...VALID_PLATFORMS].join(", ")}\n\n`,
		);
		process.exit(1);
	}

	if (!VALID_PLATFORMS.has(platformArgument)) {
		process.stderr.write(
			`\n  Rakta.js deploy error: unknown platform "${platformArgument}".\n` +
				`\n  Valid platforms: ${[...VALID_PLATFORMS].join(", ")}\n\n`,
		);
		process.exit(1);
	}

	const projectConfig = await loadConfig(currentWorkingDirectory);
	const outputDirectory = join(
		currentWorkingDirectory,
		projectConfig.build.outDir ?? "dist",
	);
	const buildManifest = readBuildManifest(outputDirectory);
	const rendering =
		buildManifest?.rendering ?? projectConfig.render.defaultMode;
	const target = normalizePlatform(platformArgument);

	console.log(`\n  ⩛ Rakta.js deploy adapter`);
	console.log(`    Platform:  ${target}`);
	console.log(`    Rendering: ${rendering.toUpperCase()}`);
	console.log(`    Output:    ${outputDirectory}\n`);

	const adapter = createDeploymentAdapter(target, {
		appName: projectConfig.appName,
		outDir: projectConfig.build.outDir ?? "dist",
		serverEntry: `${projectConfig.build.outDir ?? "dist"}/server/index.js`,
		staticDir: projectConfig.build.outDir ?? "dist",
		port: projectConfig.port ?? 3000,
		rendering,
	});

	if (adapter.files.length === 0) {
		console.log(`  ✓ No platform files needed for ${adapter.label}.`);
		console.log(
			`    Start command: ${adapter.startCommand ?? adapter.buildCommand}`,
		);
		console.log(``);
		return;
	}

	const writtenFiles: string[] = [];

	for (const file of adapter.files) {
		const absolutePath = join(currentWorkingDirectory, file.path);
		mkdirSync(dirname(absolutePath), { recursive: true });
		writeFileSync(absolutePath, file.content, "utf-8");
		writtenFiles.push(file.path);
	}

	console.log(`  ✓ Generated ${writtenFiles.length} deployment files:`);
	for (const filePath of writtenFiles) {
		console.log(`    ${filePath}`);
	}
	console.log(``);

	if (adapter.startCommand !== undefined) {
		console.log(`  Start: ${adapter.startCommand}`);
	}
	console.log(`  Build: ${adapter.buildCommand}`);
	console.log(``);
}
