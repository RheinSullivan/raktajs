#!/usr/bin/env bun

import { join } from "node:path";
import { loadConfig } from "../config/loadConfig";
import { inspectBuild, printInspectReport } from "../forge/inspect";
import { buildCommand } from "./build";
import { deployCommand } from "./deploy";
import { devCommand } from "./dev";
import { doctorCommand } from "./doctor";
import { importsGenerateCommand } from "./imports";
import { makeCommand } from "./make";
import { routesCommand } from "./routes";
import { rpcTypesCommand } from "./rpcTypes";
import { seoGenerateCommand } from "./seo";
import { startCommand } from "./start";
import {
	analyzeCommand,
	benchmarkCommand,
	checkCommand,
	formatCommand,
	generateCommand,
	inspectCommand,
	lintCommand,
	pluginCommand,
	telemetryCommand,
	upgradeCommand,
} from "./system";

const RED = "\x1b[31m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";

const cliArgs = process.argv.slice(2);
const selectedCommand = cliArgs[0] ?? "help";
const firstArgument = cliArgs[1];
const currentWorkingDirectory = process.cwd();

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
	console.log("  rakta build --mode csr|spa|ssg|csg|ssr|hybrid|isr|edge");
	console.log("  rakta build --analyze");
	console.log("  rakta start");
	console.log("  rakta routes");
	console.log("");
	console.log(
		"  rakta deploy --platform vercel|netlify|cloudflare|railway|render|fly|docker",
	);
	console.log("");
	console.log("  rakta create <page|layout|component|api> <name>");
	console.log("  rakta add <page|layout|component|api> <name>");
	console.log("  rakta make:page <name>");
	console.log("  rakta make:layout <name>");
	console.log("  rakta make:component <name>");
	console.log("  rakta make:api <name>");
	console.log("");
	console.log("  rakta analyze");
	console.log("  rakta benchmark");
	console.log("  rakta upgrade [version]");
	console.log("  rakta check");
	console.log("  rakta lint");
	console.log("  rakta format");
	console.log("  rakta generate deployment <target>");
	console.log("  rakta inspect");
	console.log("  rakta plugin list");
	console.log("  rakta plugin create <name>");
	console.log("  rakta telemetry on|off");
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
	const projectConfig = await loadConfig(currentWorkingDirectory);
	const outputDirectory = projectConfig.build.outDir ?? "dist";

	const inspectReport = inspectBuild({
		outDir: join(currentWorkingDirectory, outputDirectory),
		renderConfig: projectConfig.render,
	});

	printInspectReport(inspectReport);
}

async function main(): Promise<void> {
	const secondArgument = cliArgs[2];

	switch (selectedCommand) {
		case "help":
		case "--help":
		case "-h":
			printHelp();
			break;

		case "dev":
			await devCommand(currentWorkingDirectory);
			break;

		case "build":
			await buildCommand(currentWorkingDirectory, cliArgs.slice(1));
			if (cliArgs.includes("--analyze")) {
				await analyzeCommand(currentWorkingDirectory);
			}
			break;

		case "start":
			await startCommand(currentWorkingDirectory);
			break;

		case "routes":
			await routesCommand(currentWorkingDirectory);
			break;

		case "create":
		case "add": {
			const target = firstArgument;
			if (
				target === "page" ||
				target === "layout" ||
				target === "component" ||
				target === "api"
			) {
				await makeCommand(
					target,
					getRequiredArgument(`${selectedCommand} ${target}`, secondArgument),
					currentWorkingDirectory,
				);
				break;
			}

			console.error(
				`${BOLD}${RED}Rakta.js${RESET} ${DIM}unknown generator target:${RESET} ${target ?? ""}`,
			);
			console.error(
				`${DIM}Usage: rakta ${selectedCommand} <page|layout|component|api> <name>${RESET}`,
			);
			process.exit(1);
			return;
		}

		case "make:page":
			await makeCommand(
				"page",
				getRequiredArgument("make:page", firstArgument),
				currentWorkingDirectory,
			);
			break;

		case "make:layout":
			await makeCommand(
				"layout",
				getRequiredArgument("make:layout", firstArgument),
				currentWorkingDirectory,
			);
			break;

		case "make:component":
			await makeCommand(
				"component",
				getRequiredArgument("make:component", firstArgument),
				currentWorkingDirectory,
			);
			break;

		case "make:api":
			await makeCommand(
				"api",
				getRequiredArgument("make:api", firstArgument),
				currentWorkingDirectory,
			);
			break;

		case "seo:generate":
			await seoGenerateCommand(currentWorkingDirectory);
			break;

		case "imports:generate":
			await importsGenerateCommand(currentWorkingDirectory);
			break;

		case "rpc:types":
			await rpcTypesCommand(currentWorkingDirectory);
			break;

		case "forge:inspect":
			await runForgeInspect();
			break;

		case "analyze":
			await analyzeCommand(currentWorkingDirectory);
			break;

		case "benchmark":
			await benchmarkCommand(currentWorkingDirectory);
			break;

		case "upgrade":
			await upgradeCommand(firstArgument, currentWorkingDirectory);
			break;

		case "check":
			await checkCommand();
			break;

		case "lint":
			await lintCommand();
			break;

		case "format":
			await formatCommand();
			break;

		case "generate":
			await generateCommand(
				firstArgument,
				secondArgument,
				currentWorkingDirectory,
			);
			break;

		case "inspect":
			await inspectCommand(currentWorkingDirectory);
			break;

		case "plugin":
			await pluginCommand(
				firstArgument,
				secondArgument,
				currentWorkingDirectory,
			);
			break;

		case "telemetry":
			await telemetryCommand(firstArgument, currentWorkingDirectory);
			break;

		case "deploy":
			await deployCommand(currentWorkingDirectory, cliArgs.slice(1));
			break;

		case "tide:render":
			console.log(
				`${BOLD}${RED}Rakta.js${RESET} ${DIM}tide:render is planned for v1.0.5.${RESET}`,
			);
			break;

		case "doctor":
			await doctorCommand(currentWorkingDirectory);
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
