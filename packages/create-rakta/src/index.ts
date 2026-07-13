#!/usr/bin/env bun

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
	BACKEND_DISPLAY,
	CSS_DISPLAY,
	DATABASE_DISPLAY,
	PROJECT_LANGUAGE_DISPLAY,
	PROJECT_MODE_DISPLAY,
	RENDER_MODE_DISPLAY,
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

function formatFullstackCommands(): string {
	return [
		pc.dim("# Terminal 1"),
		pc.cyan("cd frontend"),
		pc.cyan("bun install"),
		pc.cyan("bun run dev"),
		"",
		pc.dim("# Terminal 2"),
		pc.cyan("cd backend"),
		pc.cyan("bun install"),
		pc.cyan("bun run dev"),
	]
		.map((line) => (line.length === 0 ? "" : `        ${line}`))
		.join("\n");
}

function formatFrontendOnlyCommands(projectName: string): string {
	return [`cd ${projectName}`, "bun install", "bun run dev"]
		.map((command) => `        ${pc.cyan(command)}`)
		.join("\n");
}

function printSuccessMessage(projectConfig: ProjectConfig): void {
	const modeLabel = PROJECT_MODE_DISPLAY[projectConfig.projectMode];
	const languageLabel = PROJECT_LANGUAGE_DISPLAY[projectConfig.language];
	const cssLabel = CSS_DISPLAY[projectConfig.cssFramework];
	const renderLabel = RENDER_MODE_DISPLAY[projectConfig.renderMode];
	const isFullstack = projectConfig.projectMode === "fullstack";

	const backendLine = isFullstack
		? `${pc.dim("Backend:")} ${BACKEND_DISPLAY[projectConfig.backendFramework]}`
		: "";

	const databaseLine = isFullstack
		? `${pc.dim("DB:")} ${DATABASE_DISPLAY[projectConfig.database]}`
		: "";

	const nextSteps = isFullstack
		? formatFullstackCommands()
		: formatFrontendOnlyCommands(projectConfig.projectName);

	console.log(`
      ${pc.bold(pc.green("Project created!"))}

      ${pc.dim("Mode:")}    ${modeLabel}
      ${pc.dim("Lang:")}    ${languageLabel}
      ${pc.dim("CSS:")}     ${cssLabel}
      ${pc.dim("Render:")}  ${renderLabel}
      ${backendLine}
      ${databaseLine}

      ${pc.bold("Next steps:")}

${nextSteps}

      ${pc.bold("Frontend:")} ${pc.cyan("http://localhost:3000")}
      ${
				isFullstack
					? `${pc.bold("Backend:")}  ${pc.cyan("http://localhost:4000")}`
					: ""
			}
    `);
}

async function main(): Promise<void> {
	const rawArgs = process.argv.slice(2);

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

	printSuccessMessage(projectConfig);
}

main().catch((caughtError: unknown) => {
	const errorMessage =
		caughtError instanceof Error ? caughtError.message : String(caughtError);

	console.error(pc.red(`\nError: ${errorMessage}\n`));
	process.exit(1);
});
