#!/usr/bin/env bun

import { join } from "node:path";
import { loadConfig } from "../config/loadConfig";
import { inspectBuild, printInspectReport } from "../forge/inspect";
import { buildCommand } from "./build";
import { devCommand } from "./dev";
import { doctorCommand } from "./doctor";
import { importsGenerateCommand } from "./imports";
import { makeCommand } from "./make";
import { routesCommand } from "./routes";
import { rpcTypesCommand } from "./rpc-types";
import { seoGenerateCommand } from "./seo";
import { startCommand } from "./start";

const RED = "\x1b[31m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";

const cliArgs = process.argv.slice(2);
const selectedCommand = cliArgs[0] ?? "help";
const firstArgument = cliArgs[1];
const cwd = process.cwd();

const BANNER = [
	"",
	`${BOLD}${RED} ██████╗   █████╗  ██╗  ██╗ ████████╗  █████╗          ██╗ ███████╗${RESET}`,
	`${BOLD}${RED} ██╔══██╗ ██╔══██╗ ██║ ██╔╝ ╚══██╔══╝ ██╔══██╗         ██║ ██╔════╝${RESET}`,
	`${BOLD}${RED} ██████╔╝ ███████║ █████╔╝     ██║    ███████║         ██║ ███████╗${RESET}`,
	`${BOLD}${RED} ██╔══██╗ ██╔══██║ ██╔═██╗     ██║    ██╔══██║    ██   ██║ ╚════██║${RESET}`,
	`${BOLD}${RED} ██║  ██║ ██║  ██║ ██║  ██╗    ██║    ██║  ██║ ██╗╚█████╔╝ ███████║${RESET}`,
	`${BOLD}${RED} ╚═╝  ╚═╝ ╚═╝  ╚═╝ ╚═╝  ╚═╝    ╚═╝    ╚═╝  ╚═╝ ╚═╝ ╚════╝  ╚══════╝${RESET}`,
	"",
].join("\n");

function printHelp(): void {
	console.log(BANNER);
	console.log(`${BOLD}${RED} Rakta.js CLI${RESET}`);
	console.log(
		`${DIM} Small in size. Fierce in speed. Alive in every route.${RESET}`,
	);
	console.log("");
	console.log(`${BOLD}Usage:${RESET}`);
	console.log("  bun rakta <command> [options]");
	console.log("");
	console.log(`${BOLD}Commands:${RESET}`);
	console.log("  rakta dev");
	console.log("  rakta build");
	console.log("  rakta start");
	console.log("  rakta routes");
	console.log("");
	console.log("  rakta make:page <name>");
	console.log("  rakta make:layout <name>");
	console.log("  rakta make:component <name>");
	console.log("  rakta make:api <name>");
	console.log("");
	console.log("  rakta seo:generate");
	console.log("  rakta imports:generate");
	console.log("  rakta rpc:types");
	console.log("");
	console.log("  rakta forge:inspect");
	console.log("  rakta tide:render");
	console.log("  rakta doctor");
	console.log("  rakta help");
	console.log("");
}

function getRequiredArgument(
	commandName: string,
	argumentValue: string | undefined,
): string {
	if (typeof argumentValue === "string" && argumentValue.trim().length > 0) {
		return argumentValue;
	}

	console.error(
		`${BOLD}${RED}Rakta.js${RESET} ${DIM}missing argument for:${RESET} ${commandName}`,
	);
	console.error(`${DIM}Usage: rakta ${commandName} <name>${RESET}`);
	process.exit(1);
}

async function runForgeInspect(): Promise<void> {
	const projectConfig = await loadConfig(cwd);
	const outputDirectory = projectConfig.build.outDir ?? "dist";

	const inspectReport = inspectBuild({
		outDir: join(cwd, outputDirectory),
		renderConfig: projectConfig.render,
	});

	printInspectReport(inspectReport);
}

async function main(): Promise<void> {
	switch (selectedCommand) {
		case "help":
		case "--help":
		case "-h":
			printHelp();
			break;

		case "dev":
			await devCommand(cwd);
			break;

		case "build":
			await buildCommand(cwd);
			break;

		case "start":
			await startCommand(cwd);
			break;

		case "routes":
			await routesCommand(cwd);
			break;

		case "make:page":
			await makeCommand(
				"page",
				getRequiredArgument("make:page", firstArgument),
				cwd,
			);
			break;

		case "make:layout":
			await makeCommand(
				"layout",
				getRequiredArgument("make:layout", firstArgument),
				cwd,
			);
			break;

		case "make:component":
			await makeCommand(
				"component",
				getRequiredArgument("make:component", firstArgument),
				cwd,
			);
			break;

		case "make:api":
			await makeCommand(
				"api",
				getRequiredArgument("make:api", firstArgument),
				cwd,
			);
			break;

		case "seo:generate":
			await seoGenerateCommand(cwd);
			break;

		case "imports:generate":
			await importsGenerateCommand(cwd);
			break;

		case "rpc:types":
			await rpcTypesCommand(cwd);
			break;

		case "forge:inspect":
			await runForgeInspect();
			break;

		case "tide:render":
			console.log(
				`${BOLD}${RED}Rakta.js${RESET} ${DIM}tide:render is planned for v0.2.0.${RESET}`,
			);
			break;

		case "doctor":
			await doctorCommand(cwd);
			break;

		default:
			console.error(
				`${BOLD}${RED}Rakta.js${RESET} ${DIM}unknown command:${RESET} ${selectedCommand}`,
			);
			printHelp();
			process.exit(1);
	}
}

main().catch((caughtError: unknown) => {
	const errorMessage =
		caughtError instanceof Error ? caughtError.message : String(caughtError);

	console.error(`\n${BOLD}${RED}Rakta.js error:${RESET} ${errorMessage}\n`);
	process.exit(1);
});
