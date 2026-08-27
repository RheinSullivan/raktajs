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
function normalizePlatform(value: string): DeploymentTarget {
	if (value === "cloudflare") return "cloudflare-pages";
	if (value === "github") return "github-pages";
	return value as DeploymentTarget;
}

function parsePlatformFlag(args: string[]): string | undefined {
	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		if (arg === "--platform" && i + 1 < args.length) {
			return args[i + 1];
		}
		if (arg?.startsWith("--platform=")) {
			return arg.slice("--platform=".length);
		}
	}
	return undefined;
}

export async function deployCommand(
	cwd: string = process.cwd(),
	args: string[] = process.argv.slice(2),
): Promise<void> {
	const platformArg = parsePlatformFlag(args);

	if (platformArg === undefined || platformArg.trim().length === 0) {
		process.stderr.write(
			`\n  Rakta.js deploy error: --platform is required.\n` +
				`\n  Usage: rakta deploy --platform <target>` +
				`\n  Targets: ${[...VALID_PLATFORMS].join(", ")}\n\n`,
		);
		process.exit(1);
	}

	if (!VALID_PLATFORMS.has(platformArg)) {
		process.stderr.write(
			`\n  Rakta.js deploy error: unknown platform "${platformArg}".\n` +
				`\n  Valid platforms: ${[...VALID_PLATFORMS].join(", ")}\n\n`,
		);
		process.exit(1);
	}

	const projectConfig = await loadConfig(cwd);
	const outDir = join(cwd, projectConfig.build.outDir ?? "dist");
	const buildManifest = readBuildManifest(outDir);
	const rendering =
		buildManifest?.rendering ?? projectConfig.render.defaultMode;
	const target = normalizePlatform(platformArg);

	console.log(`\n  ⩛ Rakta.js deploy adapter`);
	console.log(`    Platform:  ${target}`);
	console.log(`    Rendering: ${rendering.toUpperCase()}`);
	console.log(`    Output:    ${outDir}\n`);

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

	const written: string[] = [];

	for (const file of adapter.files) {
		const absolutePath = join(cwd, file.path);
		mkdirSync(dirname(absolutePath), { recursive: true });
		writeFileSync(absolutePath, file.content, "utf-8");
		written.push(file.path);
	}

	console.log(`  ✓ Generated ${written.length} deployment file(s):`);
	for (const filePath of written) {
		console.log(`    ${filePath}`);
	}
	console.log(``);

	if (adapter.startCommand !== undefined) {
		console.log(`  Start: ${adapter.startCommand}`);
	}
	console.log(`  Build: ${adapter.buildCommand}`);
	console.log(``);
}
