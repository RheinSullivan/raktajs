#!/usr/bin/env bun

import * as clack from "@clack/prompts";
import pc from "picocolors";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { printBanner } from "./ascii.js";
import { runPrompts, promptProjectName } from "./prompts.js";
import { generateProjectFiles } from "./generator.js";
import { writeProjectFiles } from "./file-system.js";
import { CSS_DISPLAY, BACKEND_DISPLAY, DATABASE_DISPLAY } from "./types.js";

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const nameFromArgs = args[0]?.startsWith("--") ? undefined : args[0];

  printBanner();

  const projectName = nameFromArgs
    ? nameFromArgs.trim()
    : await promptProjectName("my-rakta-app");

  const targetPath = resolve(
    process.cwd(),
    projectName
  );

  if (existsSync(targetPath)) {
    clack.cancel(
      `A directory named ${pc.bold(pc.yellow(projectName))} already exists. Choose a different name.`
    );
    
    process.exit(1);
  }

  const config = await runPrompts(projectName);

  const spinner = clack.spinner();
  spinner.start("Generating project files...");

  const files = generateProjectFiles({
    ...config,
    projectName
  });

  try {
    writeProjectFiles(targetPath, files);
    spinner.stop(pc.green("Project files generated."));
  } catch (error) {
    spinner.stop(pc.red("Failed to generate project files."));

    if (error instanceof Error) {
      console.error(pc.red(error.message));
    }

    process.exit(1);
  }

  console.log(`
${pc.bold(pc.green("Project created successfully!"))}

${pc.dim("Stack:")}
  CSS:      ${CSS_DISPLAY[config.cssFramework]}
  Backend:  ${BACKEND_DISPLAY[config.backendFramework]}
  Database: ${DATABASE_DISPLAY[config.database]}

${pc.bold("Project structure:")}
  ${pc.cyan(projectName + "/frontend/")}   Rakta.js frontend
  ${pc.cyan(projectName + "/backend/")}    ${BACKEND_DISPLAY[config.backendFramework]} backend
  ${pc.cyan(projectName + "/shared/")}     Shared TypeScript types
  ${pc.cyan(projectName + "/docs/")}       Project documentation

${pc.bold("Next steps:")}

  ${pc.dim("# Set up environment")}
  cp ${projectName}/backend/.env.example ${projectName}/backend/.env

  ${pc.dim("# Bun")}
  cd ${projectName}
  bun install
  ${pc.dim("cd frontend && bun run dev   # Terminal 1")}
  ${pc.dim("cd backend  && bun run dev   # Terminal 2")}

  ${pc.dim("# npm")}
  cd ${projectName}
  npm install
  ${pc.dim("cd frontend && npm run dev")}
  ${pc.dim("cd backend  && npm run dev")}

  ${pc.dim("# pnpm")}
  cd ${projectName}
  pnpm install
  ${pc.dim("cd frontend && pnpm dev")}
  ${pc.dim("cd backend  && pnpm dev")}

  ${pc.dim("# yarn")}
  cd ${projectName}
  yarn install
  ${pc.dim("cd frontend && yarn dev")}
  ${pc.dim("cd backend  && yarn dev")}

${pc.bold("Frontend:")} ${pc.cyan("http://localhost:3000")}
${pc.bold("Backend:")}  ${pc.cyan("http://localhost:4000")}

${pc.dim("Read the docs: " + projectName + "/docs/getting-started.md")}
`);
}

main().catch((error: unknown) => {
  if (error instanceof Error) {
    console.error(pc.red(`\nError: ${error.message}\n`));
  } else {
    console.error(pc.red("\nAn unexpected error occurred.\n"));
  }
  process.exit(1);
});