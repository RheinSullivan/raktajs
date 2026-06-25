const RED = "\x1b[31m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

export const BANNER = [
  "",
  `${BOLD}${RED} ██████╗   █████╗  ██╗  ██╗ ████████╗  █████╗          ██╗ ███████╗${RESET}`,
  `${BOLD}${RED} ██╔══██╗ ██╔══██╗ ██║ ██╔╝ ╚══██╔══╝ ██╔══██╗         ██║ ██╔════╝${RESET}`,
  `${BOLD}${RED} ██████╔╝ ███████║ █████╔╝     ██║    ███████║         ██║ ███████╗${RESET}`,
  `${BOLD}${RED} ██╔══██╗ ██╔══██║ ██╔═██╗     ██║    ██╔══██║    ██   ██║ ╚════██║${RESET}`,
  `${BOLD}${RED} ██║  ██║ ██║  ██║ ██║  ██╗    ██║    ██║  ██║ ██╗╚█████╔╝ ███████║${RESET}`,
  `${BOLD}${RED} ╚═╝  ╚═╝ ╚═╝  ╚═╝ ╚═╝  ╚═╝    ╚═╝    ╚═╝  ╚═╝ ╚═╝ ╚════╝  ╚══════╝${RESET}`,
  "",
  `${BOLD}${RED} ─────────────────────────────────────────────────────────────────────${RESET}`,
  `${BOLD}${RED} Rakta.js — React, Bun, TypeScript, App Router, and Fullstack Generator${RESET}`,
  `${BOLD}${RED} Small in size. Fierce in speed. Alive in every route.${RESET}`,
  `${BOLD}${RED} ─────────────────────────────────────────────────────────────────────${RESET}`,
  "",
].join("\n");

export function printBanner(): void {
  console.log(BANNER);
}