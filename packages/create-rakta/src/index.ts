#!/usr/bin/env bun

import * as clack from "@clack/prompts";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import pc from "picocolors";
import { printBanner } from "./ascii";
import {
  promptProjectName,
  runPrompts,
} from "./prompts";
import { generateProjectFiles } from "./generator";
import { writeProjectFiles } from "./file-system";
import {
  BACKEND_DISPLAY,
  CSS_DISPLAY,
  DATABASE_DISPLAY,
  PROJECT_MODE_DISPLAY,
  RENDER_MODE_DISPLAY,
} from "./types";
import type { ProjectConfig } from "./types";

function getProjectNameFromArgs(args: ReadonlyArray<string>): string | undefined {
  const nameArg = args.find((arg) => !arg.startsWith("--"));

  if (nameArg && nameArg.trim().length > 0) {
    return nameArg.trim();
  }

  return undefined;
}

function formatFullstackCommands(): string {
  return [
    `${pc.dim("# Terminal 1")}`,
    "cd frontend",
    "bun install",
    "bun run dev",
    "",
    `${pc.dim("# Terminal 2")}`,
    "cd backend",
    "bun install",
    "bun run dev",
  ].join("\n  ");
}

function formatFrontendOnlyCommands(projectName: string): string {
  return [
    `cd ${projectName}`,
    "bun install",
    "bun run dev",
  ].join("\n  ");
}

function printSuccessMessage(
  config: ProjectConfig
): void {
  const modeLabel = PROJECT_MODE_DISPLAY[config.projectMode];
  const cssLabel = CSS_DISPLAY[config.cssFramework];
  const renderLabel = RENDER_MODE_DISPLAY[config.renderMode];
  const isFullstack = config.projectMode === "fullstack";

  const backendLine = isFullstack
    ? `${pc.dim("Backend:")} ${BACKEND_DISPLAY[config.backendFramework]}`
    : "";

  const databaseLine = isFullstack
    ? `${pc.dim("DB:")}      ${DATABASE_DISPLAY[config.database]}`
    : "";

  const nextSteps = isFullstack
    ? formatFullstackCommands()
    : formatFrontendOnlyCommands(config.projectName);

  console.log(`
${pc.bold(pc.green("Project created!"))}

${pc.dim("Mode:")}    ${modeLabel}
${pc.dim("CSS:")}     ${cssLabel}
${pc.dim("Render:")}  ${renderLabel}
${backendLine}
${databaseLine}

${pc.bold("Next steps:")}

  ${nextSteps}

${pc.bold("Frontend:")} ${pc.cyan("http://localhost:3000")}
${isFullstack ? `${pc.bold("Backend:")}  ${pc.cyan("http://localhost:4000")}` : ""}
`);
}

async function main(): Promise<void> {
  const rawArgs = process.argv.slice(2);

  printBanner();

  const projectNameFromArgs = getProjectNameFromArgs(rawArgs);
  const projectName = projectNameFromArgs ?? await promptProjectName("my-rakta-app");

  const targetPath = resolve(
    process.cwd(),
    projectName
  );

  if (existsSync(targetPath)) {
    clack.cancel(
      `Directory ${pc.bold(pc.yellow(projectName))} already exists. Choose a different name.`
    );
    process.exit(1);
  }

  const config = await runPrompts(projectName);

  const spinner = clack.spinner();

  spinner.start("Generating project files...");

  const files = generateProjectFiles(config);

  try {
    writeProjectFiles(targetPath, files);
    spinner.stop(pc.green("Project files generated."));
  } catch (error) {
    spinner.stop(pc.red("File generation failed."));

    if (error instanceof Error) {
      console.error(pc.red(error.message));
    }

    process.exit(1);
  }

  printSuccessMessage(config);
}

main().catch((error: unknown) => {
  const message = error instanceof Error
    ? error.message
    : String(error);

  console.error(pc.red(`\nError: ${message}\n`));
  process.exit(1);
});