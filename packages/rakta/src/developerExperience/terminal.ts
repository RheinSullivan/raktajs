import { existsSync } from "node:fs";
import { networkInterfaces } from "node:os";

// Vyagra Nexus Terminal Identity
//
// The Vyagra Nexus logo is a red shield/trident form: a central diamond point
// at the top, two curved hooks on the sides, and a downward point at the base.
// This shape cannot be reproduced as a portable terminal character using a
// single Unicode glyph without Nerd Font.
//
// Closest portable representation of the shield-diamond geometry:
//   ◈  (U+25C8 WHITE DIAMOND CONTAINING BLACK SMALL DIAMOND)
// This captures the diamond-inside-diamond motif from the logo's top element,
// works in Windows Terminal, PowerShell, CMD (Win10+), Git Bash, Linux, macOS.
//
// If the Vyagra Nexus team provides an official terminal glyph, replace GLYPH.
// Fallback is safe: standard geometric Unicode, no Nerd Font dependency.
//
// MANUAL ACTION: If a dedicated 1–3 char terminal glyph is defined by
// Vyagra Nexus, update RAKTA_TERMINAL_GLYPH and remove this comment block.

export const RAKTA_TERMINAL_GLYPH = "⩛";

// Color helper

function supportsColor(): boolean {
	// Respect NO_COLOR (https://no-color.org)
	if (process.env.NO_COLOR !== undefined) return false;
	if (process.env.FORCE_COLOR === "0") return false;
	if (process.env.FORCE_COLOR) return true;
	// Windows Terminal / CI environments
	if (process.env.WT_SESSION) return true;
	if (process.env.CI) return true;
	return process.stdout.isTTY === true;
}

const USE_COLOR = supportsColor();

function red(text: string): string {
	return USE_COLOR ? `\x1b[31m${text}\x1b[0m` : text;
}
function green(text: string): string {
	return USE_COLOR ? `\x1b[32m${text}\x1b[0m` : text;
}
function yellow(text: string): string {
	return USE_COLOR ? `\x1b[33m${text}\x1b[0m` : text;
}
function cyan(text: string): string {
	return USE_COLOR ? `\x1b[36m${text}\x1b[0m` : text;
}
function dim(text: string): string {
	return USE_COLOR ? `\x1b[2m${text}\x1b[0m` : text;
}
function bold(text: string): string {
	return USE_COLOR ? `\x1b[1m${text}\x1b[0m` : text;
}

// Network detection

/**
 * Returns the first private LAN IPv4 address, excluding loopback and
 * virtual adapters commonly created by Docker, WSL, or VPNs.
 *
 * The heuristic skips addresses in 172.17–172.31 (Docker default bridge)
 * and virtual adapter names containing "docker", "veth", "wsl", "vmware".
 */
export function detectLanAddress(): string | undefined {
	const ifaces = networkInterfaces();

	for (const [name, addresses] of Object.entries(ifaces)) {
		// Skip virtual/docker adapters
		const lowerName = name.toLowerCase();
		if (
			lowerName.includes("docker") ||
			lowerName.includes("veth") ||
			lowerName.includes("wsl") ||
			lowerName.includes("vmware") ||
			lowerName.includes("vbox")
		) {
			continue;
		}

		for (const addr of addresses ?? []) {
			if (addr.family !== "IPv4" || addr.internal) continue;

			// Skip Docker default bridge range 172.17.x.x–172.31.x.x
			const parts = addr.address.split(".").map(Number);
			if (
				parts[0] === 172 &&
				parts[1] !== undefined &&
				parts[1] >= 17 &&
				parts[1] <= 31
			) {
				continue;
			}

			return addr.address;
		}
	}

	return undefined;
}

// Environment file detection

const ENV_FILE_CANDIDATES = [
	".env.development.local",
	".env.local",
	".env.development",
	".env",
] as const;

/**
 * Returns the names of env files that exist in the project root.
 * NEVER exposes values - only filenames.
 */
export function detectEnvFiles(projectRoot: string): readonly string[] {
	return ENV_FILE_CANDIDATES.filter((file) =>
		existsSync(`${projectRoot}/${file}`),
	);
}

// Status line helpers

function statusSymbol(code: number): string {
	if (code < 300) return green("✓");
	if (code < 400) return cyan("→");
	if (code < 500) return yellow("⚠");
	return red("✗");
}

function colorStatus(code: number): string {
	const s = String(code);
	if (code < 300) return green(s);
	if (code < 400) return cyan(s);
	if (code < 500) return yellow(s);
	return red(s);
}

// RaktaDevTerminal

export interface DevTerminalOptions {
	readonly version: string;
	readonly projectRoot: string;
	/**
	 * Threshold in ms above which a request is flagged as [slow].
	 * Default: 1000
	 */
	readonly slowRequestThresholdMs?: number;
	/**
	 * When true, shows per-category breakdown for each request.
	 * Default: false
	 */
	readonly detailedTiming?: boolean;
}

export interface RequestLogEntry {
	readonly method: string;
	readonly pathname: string;
	readonly status: number;
	readonly totalMs: number;
	readonly kind?: "api" | "page" | "asset";
	/** Time spent in Rakta framework layer (router + middleware) */
	readonly frameworkMs?: number;
	/** Time spent in application handler */
	readonly applicationMs?: number;
}

export class RaktaDevTerminal {
	readonly #opts: Required<DevTerminalOptions>;
	#startedAt: number = 0;

	constructor(opts: DevTerminalOptions) {
		this.#opts = {
			slowRequestThresholdMs: 1000,
			detailedTiming: false,
			...opts,
		};
	}

	/**
	 * Call when the dev server is about to start.
	 */
	markStart(): void {
		this.#startedAt = Date.now();
	}

	/**
	 * Prints the startup header once the server is ready.
	 *
	 * Required output format:
	 *
	 *     $ rakta dev
	 *         ⩛ Rakta.js 1.2.0 (CherbonsEngine)
	 *             Local        : http://localhost:3000
	 *             Network      : http://192.168.1.8:3000
	 *         ✓ Ready in 421ms
	 *         ✓ Running rakta.config.ts took 291ms
	 */
	printStartup(localUrl: string, configMs?: number): void {
		const readyMs = Date.now() - this.#startedAt;
		const glyph = bold(red(RAKTA_TERMINAL_GLYPH));
		const version = bold(`Rakta.js ${this.#opts.version}`);
		const engine = dim("(CherbonsEngine)");

		const I1 = "    ";
		const I2 = "        ";

		console.log();
		console.log(`${I1}${glyph} ${version} ${engine}`);

		console.log(`${I2}${dim("Local        :")} ${cyan(localUrl)}`);

		const lan = detectLanAddress();
		if (lan) {
			const networkUrl = localUrl.replace(/localhost|127\.0\.0\.1/, lan);
			console.log(`${I2}${dim("Network      :")} ${cyan(networkUrl)}`);
		}

		const envFiles = detectEnvFiles(this.#opts.projectRoot);
		if (envFiles.length > 0) {
			console.log(`${I2}${dim("Environments :")} ${dim(envFiles.join(", "))}`);
		}

		console.log();
		console.log(
			`${I1}${green("✓")} Ready in ${bold(this.#formatDuration(readyMs))}`,
		);

		if (configMs !== undefined && configMs >= 0) {
			console.log(
				`${I1}${green("✓")} Running ${dim("rakta.config.ts")} took ${bold(this.#formatDuration(configMs))}`,
			);
		}

		console.log();
	}

	/**
	 * Prints the "compiling route" indicator when a route bundle starts building.
	 *
	 *     ○ Compiling /dashboard ...
	 */
	printCompileStart(routePath: string): void {
		const I1 = "    ";
		console.log(`\n${I1}${dim("○")} Compiling ${cyan(routePath)} ...`);
	}

	/**
	 * Prints the compile completion line.
	 *
	 *     ✓ Compiled /dashboard in 212ms
	 */
	printCompileEnd(routePath: string, durationMs: number): void {
		const I1 = "    ";
		console.log(
			`${I1}${green("✓")} Compiled ${cyan(routePath)} in ${bold(this.#formatDuration(durationMs))}`,
		);
	}

	#formatDuration(ms: number): string {
		if (ms >= 10_000) return `${(ms / 1000).toFixed(1)}s`;
		if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`;
		return `${ms}ms`;
	}

	/**
	 * Logs a single request in the new structured format.
	 *
	 * Normal:
	 *     GET / 200 in 42ms (rakta.js: 4ms, application-code: 38ms)
	 *
	 * Slow:
	 *     GET / 200 in 1.4s  [slow]  (rakta.js: 17ms, application-code: 1.4s)
	 */
	logRequest(entry: RequestLogEntry): void {
		const I1 = "    ";
		const method = entry.method.toUpperCase();
		const status = colorStatus(entry.status);
		const sym = statusSymbol(entry.status);

		const ms = entry.totalMs;
		const totalStr = this.#colorDuration(ms);

		const isSlow = ms >= this.#opts.slowRequestThresholdMs;
		const slowTag = isSlow ? ` ${yellow("[slow]")}` : "";

		let timingDetail = "";
		if (entry.frameworkMs !== undefined && entry.applicationMs !== undefined) {
			timingDetail = ` ${dim(`(rakta.js: ${this.#formatDuration(entry.frameworkMs)}, application-code: ${this.#formatDuration(entry.applicationMs)})`)}`;
		}

		console.log(
			`${I1}${sym} ${dim(method)} ${entry.pathname} ${status} ${dim("in")} ${totalStr}${slowTag}${timingDetail}`,
		);
	}

	#colorDuration(ms: number): string {
		const str = this.#formatDuration(ms);
		if (ms >= 1000) return yellow(str);
		if (ms >= 500) return yellow(str);
		return dim(str);
	}

	/**
	 * Logs a dev-server error.
	 *
	 *     ✗ Bundle failed: Cannot resolve "missing-module"
	 */
	logError(message: string, error?: unknown): void {
		const I1 = "    ";
		const detail = error instanceof Error ? error.message : String(error ?? "");
		console.error(
			`${I1}${red("✗")} ${message}${detail ? `: ${dim(detail)}` : ""}`,
		);
	}

	/**
	 * Logs an HMR/rebuild event.
	 *
	 *     ↺ Rebuilt in 237ms
	 */
	logRebuild(durationMs: number): void {
		const I1 = "    ";
		console.log(
			`${I1}${cyan("↺")} Rebuilt in ${bold(this.#formatDuration(durationMs))}`,
		);
	}
}

/**
 * Creates a RaktaDevTerminal instance.
 */
export function createDevTerminal(opts: DevTerminalOptions): RaktaDevTerminal {
	return new RaktaDevTerminal(opts);
}
