import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { loadConfig } from "../config/loadConfig";
import {
	createDeploymentAdapter,
	type DeploymentTarget,
	listDeploymentTargets,
} from "../deployment";
import { inspectBuild, printInspectReport } from "../forge/inspect";
import { generateManifest } from "../router/manifest";

const TELEMETRY_FILE = ".rakta/telemetry.json";

function writeIfNew(filePath: string, content: string): void {
	if (existsSync(filePath)) {
		console.log(`  Exists: ${filePath}`);
		return;
	}

	mkdirSync(dirname(filePath), { recursive: true });
	writeFileSync(filePath, content, "utf-8");
	console.log(`  Created: ${filePath}`);
}

function isDeploymentTarget(value: string): value is DeploymentTarget {
	return listDeploymentTargets().includes(value as DeploymentTarget);
}

async function runProcess(command: string, args: string[]): Promise<number> {
	const child = Bun.spawn([command, ...args], {
		stdout: "inherit",
		stderr: "inherit",
		stdin: "inherit",
	});

	return child.exited;
}

export async function analyzeCommand(cwd: string): Promise<void> {
	const config = await loadConfig(cwd);
	const outDir = join(cwd, config.build.outDir ?? "dist");
	const report = inspectBuild({
		outDir,
		renderConfig: config.render,
	});

	printInspectReport(report);
}

export async function benchmarkCommand(cwd: string): Promise<void> {
	const config = await loadConfig(cwd);
	const iterations = 1_000;
	const started = performance.now();

	for (let index = 0; index < iterations; index += 1) {
		generateManifest(join(cwd, config.appDir));
	}

	const elapsedMs = performance.now() - started;
	const perRunMs = elapsedMs / iterations;

	console.log("\n  Rakta.js Benchmark");
	console.log("  ------------------------------------------------");
	console.log(`  Route manifest scans: ${iterations}`);
	console.log(`  Total: ${elapsedMs.toFixed(2)}ms`);
	console.log(`  Average: ${perRunMs.toFixed(4)}ms`);
	console.log("  ------------------------------------------------\n");
}

export async function checkCommand(): Promise<void> {
	const typecheckExitCode = await runProcess("bun", ["run", "typecheck"]);

	if (typecheckExitCode !== 0) {
		process.exit(typecheckExitCode);
	}

	const lintExitCode = await runProcess("bun", ["run", "lint"]);

	if (lintExitCode !== 0) {
		process.exit(lintExitCode);
	}
}

export async function lintCommand(): Promise<void> {
	const exitCode = await runProcess("bunx", ["biome", "check", "."]);

	if (exitCode !== 0) {
		process.exit(exitCode);
	}
}

export async function formatCommand(): Promise<void> {
	const exitCode = await runProcess("bunx", [
		"biome",
		"format",
		"--write",
		".",
	]);

	if (exitCode !== 0) {
		process.exit(exitCode);
	}
}

export async function telemetryCommand(
	mode: string | undefined,
	cwd: string,
): Promise<void> {
	const telemetryPath = join(cwd, TELEMETRY_FILE);
	const current = existsSync(telemetryPath)
		? (JSON.parse(readFileSync(telemetryPath, "utf-8")) as {
				enabled?: boolean;
			})
		: { enabled: false };

	if (mode === "on" || mode === "enable") {
		mkdirSync(dirname(telemetryPath), { recursive: true });
		writeFileSync(
			telemetryPath,
			JSON.stringify(
				{ enabled: true, updatedAt: new Date().toISOString() },
				null,
				2,
			),
			"utf-8",
		);
		console.log("  Rakta telemetry enabled locally.");
		return;
	}

	if (mode === "off" || mode === "disable") {
		mkdirSync(dirname(telemetryPath), { recursive: true });
		writeFileSync(
			telemetryPath,
			JSON.stringify(
				{ enabled: false, updatedAt: new Date().toISOString() },
				null,
				2,
			),
			"utf-8",
		);
		console.log("  Rakta telemetry disabled locally.");
		return;
	}

	console.log(
		`  Rakta telemetry: ${current.enabled === true ? "enabled" : "disabled"}`,
	);
	console.log("  Usage: rakta telemetry on|off");
}

export async function pluginCommand(
	action: string | undefined,
	name: string | undefined,
	cwd: string,
): Promise<void> {
	if (action === "list") {
		const config = await loadConfig(cwd);
		console.log("\n  Rakta plugin-capable features");
		console.log("  ------------------------------------------------");
		console.log(
			`  Auto Import: ${config.autoImport.enabled ? "enabled" : "disabled"}`,
		);
		console.log(`  RPC: ${config.rpc.enabled ? "enabled" : "disabled"}`);
		console.log(`  Render default: ${config.render.defaultMode}`);
		console.log("  ------------------------------------------------\n");
		return;
	}

	if (action === "create" && name !== undefined) {
		const pluginName = name.replace(/^@/, "").replaceAll("/", "-");
		writeIfNew(
			join(cwd, "plugins", `${pluginName}.ts`),
			`import type { RaktaPlugin } from "raktajs/kernel";

export const ${pluginName.replaceAll("-", "")}Plugin: RaktaPlugin = {
  name: "${name}",
  configure(context) {
    context.registerFeature({
      name: "${name}",
      enabled: true,
    });
  },
};
`,
		);
		return;
	}

	console.log("  Usage: rakta plugin list | rakta plugin create <name>");
}

export async function upgradeCommand(
	targetVersion: string | undefined,
	cwd: string,
): Promise<void> {
	const packageJsonPath = join(cwd, "package.json");

	if (!existsSync(packageJsonPath)) {
		console.error("  Cannot find package.json in the current project.");
		process.exit(1);
	}

	const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8")) as {
		dependencies?: Record<string, string>;
		devDependencies?: Record<string, string>;
	};
	const version = targetVersion ?? "latest";
	let changed = false;

	for (const sectionName of ["dependencies", "devDependencies"] as const) {
		const section = packageJson[sectionName];

		if (section?.raktajs !== undefined) {
			section.raktajs = version;
			changed = true;
		}

		if (section?.["create-rakta-app"] !== undefined) {
			section["create-rakta-app"] = version;
			changed = true;
		}
	}

	if (!changed) {
		console.log("  No raktajs dependency found in package.json.");
		return;
	}

	writeFileSync(
		packageJsonPath,
		`${JSON.stringify(packageJson, null, 2)}\n`,
		"utf-8",
	);
	console.log(`  Updated Rakta.js dependencies to ${version}.`);
	console.log("  Run bun install to refresh the lockfile.");
}

export async function generateCommand(
	target: string | undefined,
	name: string | undefined,
	cwd: string,
): Promise<void> {
	if (target === "deployment") {
		const selectedTarget = name ?? "static";

		if (!isDeploymentTarget(selectedTarget)) {
			console.error(`  Unknown deployment target: ${selectedTarget}`);
			console.error(`  Available: ${listDeploymentTargets().join(", ")}`);
			process.exit(1);
		}

		const config = await loadConfig(cwd);
		const adapterOptions = {
			appName: config.appName,
			port: config.port,
			...(config.build.outDir === undefined
				? {}
				: { outDir: config.build.outDir }),
		};
		const adapter = createDeploymentAdapter(selectedTarget, adapterOptions);

		for (const file of adapter.files) {
			writeIfNew(join(cwd, file.path), file.content);
		}

		console.log(`  Deployment target: ${adapter.label}`);
		console.log(`  Build command: ${adapter.buildCommand}`);
		if (adapter.startCommand !== undefined) {
			console.log(`  Start command: ${adapter.startCommand}`);
		}
		return;
	}

	console.log("  Usage: rakta generate deployment <target>");
}

export async function inspectCommand(cwd: string): Promise<void> {
	await analyzeCommand(cwd);
}
