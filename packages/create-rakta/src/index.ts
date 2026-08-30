#!/usr/bin/env node

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import * as clack from "@clack/prompts";
import pc from "picocolors";
import { printBanner } from "./ascii";
import { writeProjectFiles } from "./fileSystem";
import { generateProjectFiles } from "./generator";
import { promptProjectName, runPrompts } from "./prompts";
import type { ProjectConfig } from "./types";
import {
	AUTH_STRATEGY_DISPLAY,
	BACKEND_DISPLAY,
	CSS_DISPLAY,
	DATABASE_DISPLAY,
	PROJECT_LANGUAGE_DISPLAY,
	PROJECT_MODE_DISPLAY,
	RENDER_MODE_DISPLAY,
	SESSION_POLICY_DISPLAY,
} from "./types";

function getProjectNameFromArgs(
	cliArgs: ReadonlyArray<string>,
): string | undefined {
	const nameArg = cliArgs.find((arg) => !arg.startsWith("--"));
	if (nameArg !== undefined && nameArg.trim().length > 0) {
		return nameArg.trim();
	}
	return undefined;
}

function shouldInstallDependencies(cliArgs: ReadonlyArray<string>): boolean {
	return (
		!cliArgs.includes("--no-install") && !cliArgs.includes("--skip-install")
	);
}

function formatInstallCommand(projectName: string): string {
	return pc.cyan(`cd ${projectName} && bun install`);
}

function formatFullstackCommands(projectName: string): string {
	return [
		pc.dim(`# Option A: start both with one command`),
		pc.cyan(`cd ${projectName}`),
		pc.cyan("bun run dev"),
		"",
		pc.dim("# Option B: start separately"),
		pc.cyan(`cd ${projectName}/frontend && bun run dev`),
		pc.cyan(`cd ${projectName}/backend  && bun run dev`),
	]
		.map((line) => (line.length === 0 ? "" : `        ${line}`))
		.join("\n");
}

function formatFrontendOnlyCommands(projectName: string): string {
	return [`cd ${projectName}`, "bun run dev"]
		.map((command) => `        ${pc.cyan(command)}`)
		.join("\n");
}

/**
 * Resolve the bun executable for the current platform.
 *
 * Windows + Git Bash quirk:
 *   spawn("bun", ..., { shell: false }) fails with EINVAL when the process
 *   is launched from Git Bash or any MSYS2 shell because the Windows native
 *   Bun executable (bun.exe) is not on the POSIX-style PATH that Git Bash
 *   exposes to Node/Bun child_process.spawn. Using shell:true routes the
 *   command through cmd.exe which can locate bun.exe via PATHEXT/PATH
 *   normally. On Unix systems shell:false is preferred for security and
 *   avoids the Node.js DEP0190 warning.
 */
function resolveBunSpawnOptions(_cwd: string): {
	command: string;
	args: string[];
	shell: boolean | string;
} {
	const isWindows = process.platform === "win32";

	if (isWindows) {
		// On Windows route through cmd.exe so bun.exe is found regardless of
		// whether the caller is PowerShell, cmd.exe, or Git Bash (MSYS2).
		return {
			command: "cmd.exe",
			args: ["/d", "/s", "/c", "bun install"],
			shell: false,
		};
	}

	// macOS / Linux: spawn bun directly, no shell indirection needed.
	return {
		command: "bun",
		args: ["install"],
		shell: false,
	};
}

async function installDependencies(projectDirectory: string): Promise<void> {
	const { command, args, shell } = resolveBunSpawnOptions(projectDirectory);

	await new Promise<void>((resolveInstall, rejectInstall) => {
		const installProcess = spawn(command, args, {
			cwd: projectDirectory,
			stdio: "inherit",
			shell,
		});

		installProcess.on("error", (error) => {
			const errnoError = error as NodeJS.ErrnoException;
			rejectInstall(
				new Error(
					`Failed to spawn bun install (${errnoError.code ?? "unknown"}: ${errnoError.message}). ` +
						`Platform: ${process.platform}. ` +
						`Command: ${command} ${args.join(" ")}. ` +
						`Ensure bun is installed and available on PATH. See https://bun.sh/docs/installation`,
				),
			);
		});

		installProcess.on("exit", (exitCode) => {
			if (exitCode === 0) {
				resolveInstall();
				return;
			}

			rejectInstall(
				new Error(
					`bun install failed with exit code ${exitCode ?? "unknown"}.`,
				),
			);
		});
	});
}

function printSuccessMessage(
	projectConfig: ProjectConfig,
	dependenciesInstalled: boolean,
): void {
	const modeLabel = PROJECT_MODE_DISPLAY[projectConfig.projectMode];
	const languageLabel = PROJECT_LANGUAGE_DISPLAY[projectConfig.language];
	const cssLabel = CSS_DISPLAY[projectConfig.cssFramework];
	const renderLabel = RENDER_MODE_DISPLAY[projectConfig.renderMode];
	const autoImportLabel = projectConfig.autoImport ? "Enabled" : "Disabled";
	const isFullstack = projectConfig.projectMode === "fullstack";

	const authStrategy = projectConfig.authStrategy ?? "none";
	const sessionPolicy = projectConfig.sessionPolicy ?? "none";

	const backendLine = isFullstack
		? `\n      ${pc.dim("Backend:")} ${BACKEND_DISPLAY[projectConfig.backendFramework]}`
		: "";

	const databaseLine = isFullstack
		? `\n      ${pc.dim("DB:")} ${DATABASE_DISPLAY[projectConfig.database]}`
		: "";

	const authLine =
		isFullstack && authStrategy !== "none"
			? `\n      ${pc.dim("Auth:")} ${AUTH_STRATEGY_DISPLAY[authStrategy]}${sessionPolicy !== "none" ? ` · ${SESSION_POLICY_DISPLAY[sessionPolicy]}` : ""}`
			: "";

	const nextSteps = isFullstack
		? formatFullstackCommands(projectConfig.projectName)
		: formatFrontendOnlyCommands(projectConfig.projectName);

	console.log(`
      ${pc.bold(pc.green("Project created!"))}

      ${pc.dim("Mode:")}       ${modeLabel}
      ${pc.dim("Lang:")}       ${languageLabel}
      ${pc.dim("CSS:")}        ${cssLabel}
      ${pc.dim("Render:")}     ${renderLabel}
      ${pc.dim("AutoImport:")} ${autoImportLabel}${backendLine}${databaseLine}${authLine}

      ${pc.bold("Next steps:")}

        ${pc.dim(dependenciesInstalled ? "Dependencies are already installed." : "Run bun install once before starting.")}
${nextSteps}

      ${pc.bold("Frontend:")} ${pc.cyan("http://localhost:3000")}${isFullstack ? `\n      ${pc.bold("Backend:")}  ${pc.cyan("http://localhost:4000")}` : ""}
    `);
}

async function main(): Promise<void> {
	const rawArgs = process.argv.slice(2);
	const installAfterGeneration = shouldInstallDependencies(rawArgs);

	printBanner();

	const projectNameFromArgs = getProjectNameFromArgs(rawArgs);
	const projectName =
		projectNameFromArgs ?? (await promptProjectName("my-rakta-app"));

	const targetPath = resolve(process.cwd(), projectName);

	if (existsSync(targetPath)) {
		clack.cancel(
			`Directory ${pc.bold(pc.yellow(projectName))} already exists. Choose a different name.`,
		);
		process.exit(1);
	}

	const projectConfig = await runPrompts(projectName);

	const loadingSpinner = clack.spinner();
	loadingSpinner.start("Generating project files...");

	const generatedFiles = generateProjectFiles(projectConfig);

	try {
		writeProjectFiles(targetPath, generatedFiles);
		loadingSpinner.stop(pc.green("Project files generated."));
	} catch (caughtError) {
		loadingSpinner.stop(pc.red("File generation failed."));
		if (caughtError instanceof Error) {
			console.error(pc.red(caughtError.message));
		}
		process.exit(1);
	}

	if (installAfterGeneration) {
		const installSpinner = clack.spinner();
		installSpinner.start("Installing dependencies with Bun...");
		try {
			await installDependencies(targetPath);
			installSpinner.stop(pc.green("Dependencies installed."));
		} catch (caughtError) {
			installSpinner.stop(pc.red("Dependency installation failed."));
			if (caughtError instanceof Error) {
				console.error(pc.red(caughtError.message));
			}
			console.error(
				pc.dim(
					`Run ${formatInstallCommand(projectName)} after fixing the install error.`,
				),
			);
			process.exit(1);
		}
	}

	printSuccessMessage(projectConfig, installAfterGeneration);
}

main().catch((caughtError: unknown) => {
	const errorMessage =
		caughtError instanceof Error ? caughtError.message : String(caughtError);
	console.error(pc.red(`\nError: ${errorMessage}\n`));
	process.exit(1);
});
