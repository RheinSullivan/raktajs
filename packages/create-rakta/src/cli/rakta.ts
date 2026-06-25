#!/usr/bin/env bun

const RED = "\x1b[31m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";

const command = process.argv[2] ?? "help";

const banner = [
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
  console.log(banner);
  console.log(`${BOLD}${RED} Rakta.js CLI${RESET}`);
  console.log(`${DIM} Small in size. Fierce in speed. Alive in every route.${RESET}`);
  console.log("");
  console.log(`${BOLD} Commands:${RESET}`);
  console.log("  rakta dev");
  console.log("  rakta build");
  console.log("  rakta start");
  console.log("  rakta routes");
  console.log("  rakta make:page <name>");
  console.log("  rakta make:component <name>");
  console.log("  rakta make:api <name>");
  console.log("  rakta make:layout <name>");
  console.log("  rakta seo:generate");
  console.log("  rakta imports:generate");
  console.log("  rakta rpc:types");
  console.log("  rakta forge:inspect");
  console.log("  rakta tide:render");
  console.log("  rakta doctor");
  console.log("");
}

function runCommand(selectedCommand: string): void {
  if (selectedCommand === "help" || selectedCommand === "--help" || selectedCommand === "-h") {
    printHelp();
    return;
  }

  console.log(`${BOLD}${RED}Rakta.js${RESET} ${DIM}running command:${RESET} ${selectedCommand}`);

  if (selectedCommand === "dev") {
    console.log(`${DIM}Starting Rakta.js development server...${RESET}`);
    return;
  }

  if (selectedCommand === "build") {
    console.log(`${DIM}Building Rakta.js application...${RESET}`);
    return;
  }

  if (selectedCommand === "start") {
    console.log(`${DIM}Starting Rakta.js production server...${RESET}`);
    return;
  }

  if (selectedCommand === "doctor") {
    console.log(`${DIM}Checking Rakta.js project health...${RESET}`);
    return;
  }

  console.log(`${DIM}Command registered: ${selectedCommand}${RESET}`);
}

runCommand(command);