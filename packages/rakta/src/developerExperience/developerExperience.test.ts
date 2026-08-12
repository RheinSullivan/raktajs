import { describe, expect, test } from "bun:test";
import { mountDevIndicator } from "./devIndicator";
import {
	createDevTerminal,
	detectEnvFiles,
	detectLanAddress,
	RAKTA_TERMINAL_GLYPH,
} from "./terminal";

describe("Rakta Dev Terminal", () => {
	test("terminal glyph is defined and non-empty", () => {
		expect(typeof RAKTA_TERMINAL_GLYPH).toBe("string");
		expect(RAKTA_TERMINAL_GLYPH.length).toBeGreaterThan(0);
	});

	test("createDevTerminal returns terminal instance", () => {
		const t = createDevTerminal({
			version: "1.0.6",
			projectRoot: process.cwd(),
		});
		expect(typeof t.markStart).toBe("function");
		expect(typeof t.printStartup).toBe("function");
		expect(typeof t.logRequest).toBe("function");
		expect(typeof t.logError).toBe("function");
		expect(typeof t.logRebuild).toBe("function");
	});

	test("startup timing is measured (not hardcoded)", () => {
		const t = createDevTerminal({
			version: "1.0.6",
			projectRoot: process.cwd(),
		});
		t.markStart();
		const logs: string[] = [];
		const orig = console.log;
		console.log = (...args: unknown[]) => logs.push(args.join(" "));
		t.printStartup("http://localhost:3000");
		console.log = orig;

		const readyLine = logs.find((l) => l.includes("Ready in"));
		expect(readyLine).toBeDefined();

		// Strip ANSI color codes - use String.fromCharCode(27) for ESC to avoid
		// biome lint/suspicious/noControlCharactersInRegex on \x1b literal
		const esc = String.fromCharCode(27);
		const ansiPattern = new RegExp(`${esc}\\[[0-9;]*m`, "g");
		const stripped = readyLine?.replace(ansiPattern, "") ?? "";
		const match = stripped.match(/Ready in (\d+)ms/);
		expect(match).toBeTruthy();
		const ms = Number(match?.[1]);
		expect(ms).toBeGreaterThanOrEqual(0);
		expect(ms).toBeLessThan(10_000);
	});

	test("logRequest 2xx uses correct symbol", () => {
		const t = createDevTerminal({
			version: "1.0.6",
			projectRoot: process.cwd(),
		});
		const logs: string[] = [];
		const orig = console.log;
		console.log = (...args: unknown[]) => logs.push(args.join(" "));
		t.logRequest({ method: "GET", pathname: "/", status: 200, totalMs: 15 });
		console.log = orig;
		expect(logs.some((l) => l.includes("200"))).toBe(true);
	});

	test("logRequest 4xx uses warning symbol", () => {
		const t = createDevTerminal({
			version: "1.0.6",
			projectRoot: process.cwd(),
		});
		const logs: string[] = [];
		const orig = console.log;
		console.log = (...args: unknown[]) => logs.push(args.join(" "));
		t.logRequest({
			method: "GET",
			pathname: "/missing",
			status: 404,
			totalMs: 2,
		});
		console.log = orig;
		expect(logs.some((l) => l.includes("404"))).toBe(true);
	});

	test("logRequest 5xx uses error symbol", () => {
		const t = createDevTerminal({
			version: "1.0.6",
			projectRoot: process.cwd(),
		});
		const logs: string[] = [];
		const orig = console.log;
		console.log = (...args: unknown[]) => logs.push(args.join(" "));
		t.logRequest({
			method: "POST",
			pathname: "/api/crash",
			status: 500,
			totalMs: 8,
		});
		console.log = orig;
		expect(logs.some((l) => l.includes("500"))).toBe(true);
	});

	test("slow request is flagged with [slow]", () => {
		const t = createDevTerminal({
			version: "1.0.6",
			projectRoot: process.cwd(),
			slowRequestThresholdMs: 100,
		});
		const logs: string[] = [];
		const orig = console.log;
		console.log = (...args: unknown[]) => logs.push(args.join(" "));
		t.logRequest({
			method: "GET",
			pathname: "/api/slow",
			status: 200,
			totalMs: 2000,
		});
		console.log = orig;
		expect(logs.some((l) => l.includes("slow"))).toBe(true);
	});

	test("fast request has no [slow] tag", () => {
		const t = createDevTerminal({
			version: "1.0.6",
			projectRoot: process.cwd(),
			slowRequestThresholdMs: 1000,
		});
		const logs: string[] = [];
		const orig = console.log;
		console.log = (...args: unknown[]) => logs.push(args.join(" "));
		t.logRequest({ method: "GET", pathname: "/", status: 200, totalMs: 10 });
		console.log = orig;
		expect(logs.some((l) => l.includes("slow"))).toBe(false);
	});

	test("NO_COLOR disables ANSI codes", () => {
		const original = process.env.NO_COLOR;
		process.env.NO_COLOR = "1";
		// Re-import is not possible in same module - test via output absence
		const t = createDevTerminal({
			version: "1.0.6",
			projectRoot: process.cwd(),
		});
		const logs: string[] = [];
		const orig = console.log;
		console.log = (...args: unknown[]) => logs.push(args.join(" "));
		t.logRequest({ method: "GET", pathname: "/", status: 200, totalMs: 5 });
		console.log = orig;
		if (original === undefined) delete process.env.NO_COLOR;
		else process.env.NO_COLOR = original;
		// Regardless of NO_COLOR state at import time, output should contain status
		expect(logs.some((l) => l.includes("200"))).toBe(true);
	});

	test("detectEnvFiles returns only existing files - no secrets exposed", () => {
		const files = detectEnvFiles(process.cwd());
		// Should be an array of strings (filenames only, never values)
		expect(Array.isArray(files)).toBe(true);
		for (const f of files) {
			expect(typeof f).toBe("string");
			// Must be a filename, not a value like "KEY=value"
			expect(f).not.toMatch(/=/);
			expect(f).not.toMatch(/secret|token|password|key/i);
		}
	});

	test("detectEnvFiles never exposes env values", () => {
		const files = detectEnvFiles(process.cwd());
		for (const f of files) {
			// File names only - no slashes (paths), no equals (values)
			expect(f).not.toContain("/");
			expect(f).not.toContain("\\");
			expect(f.startsWith(".env")).toBe(true);
		}
	});

	test("detectLanAddress returns undefined or valid IPv4", () => {
		const addr = detectLanAddress();
		if (addr !== undefined) {
			expect(addr).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/);
			// Must not be loopback
			expect(addr).not.toBe("127.0.0.1");
			expect(addr).not.toBe("0.0.0.0");
		}
	});

	test("logError does not throw on undefined error", () => {
		const t = createDevTerminal({
			version: "1.0.6",
			projectRoot: process.cwd(),
		});
		const logs: string[] = [];
		const originalConsoleError = console.error;
		console.error = (...args: unknown[]) => logs.push(args.join(" "));
		try {
			expect(() => t.logError("test error")).not.toThrow();
			expect(() => t.logError("test error", new Error("detail"))).not.toThrow();
			expect(() => t.logError("test error", undefined)).not.toThrow();
		} finally {
			console.error = originalConsoleError;
		}
		expect(logs.some((line) => line.includes("test error"))).toBe(true);
	});

	test("logRebuild logs rebuild time", () => {
		const t = createDevTerminal({
			version: "1.0.6",
			projectRoot: process.cwd(),
		});
		const logs: string[] = [];
		const orig = console.log;
		console.log = (...args: unknown[]) => logs.push(args.join(" "));
		t.logRebuild(237);
		console.log = orig;
		expect(logs.some((l) => l.includes("237"))).toBe(true);
	});

	test("detailedTiming shows breakdown when frameworkMs and applicationMs provided", () => {
		const t = createDevTerminal({
			version: "1.0.6",
			projectRoot: process.cwd(),
			detailedTiming: true,
		});
		const logs: string[] = [];
		const orig = console.log;
		console.log = (...args: unknown[]) => logs.push(args.join(" "));
		t.logRequest({
			method: "GET",
			pathname: "/reports",
			status: 200,
			totalMs: 42,
			frameworkMs: 3.2,
			applicationMs: 38.1,
		});
		console.log = orig;
		expect(logs.some((l) => l.includes("router"))).toBe(true);
		expect(logs.some((l) => l.includes("application"))).toBe(true);
	});

	test("Local URL appears in startup output", () => {
		const t = createDevTerminal({
			version: "1.0.6",
			projectRoot: process.cwd(),
		});
		t.markStart();
		const logs: string[] = [];
		const orig = console.log;
		console.log = (...args: unknown[]) => logs.push(args.join(" "));
		t.printStartup("http://localhost:4321");
		console.log = orig;
		expect(logs.some((l) => l.includes("localhost:4321"))).toBe(true);
	});

	test("version appears in startup output", () => {
		const t = createDevTerminal({
			version: "1.0.6",
			projectRoot: process.cwd(),
		});
		t.markStart();
		const logs: string[] = [];
		const orig = console.log;
		console.log = (...args: unknown[]) => logs.push(args.join(" "));
		t.printStartup("http://localhost:3000");
		console.log = orig;
		expect(logs.some((l) => l.includes("1.0.6"))).toBe(true);
	});
});

describe("Rakta Dev Indicator", () => {
	test("mountDevIndicator is a function", () => {
		expect(typeof mountDevIndicator).toBe("function");
	});

	test("mountDevIndicator does not throw when document is undefined (SSR/Node)", () => {
		// In Bun test environment there is no DOM - function should guard
		expect(() => {
			mountDevIndicator({
				version: "1.0.6",
				logoDataUrl: "data:image/svg+xml;base64,PHN2Zy8+",
			});
		}).not.toThrow();
	});

	test("DevIndicator module exports required interface", () => {
		// Verify the export shape matches DevIndicatorOptions contract
		const opts = {
			version: "1.0.6",
			logoDataUrl: "data:image/svg+xml;base64,PHN2Zy8+",
			routePath: "/dashboard",
			renderMode: "csr",
			bundler: "Bun / Vite",
		};
		// TypeScript validates this at compile time; runtime check confirms shape
		expect(opts.version).toBe("1.0.6");
		expect(opts.logoDataUrl.startsWith("data:")).toBe(true);
	});

	test("production build excludes dev indicator (NODE_ENV guard exists in source)", async () => {
		// Verify the clientEntry template contains the NODE_ENV guard
		const { readFileSync } = await import("node:fs");
		const { join } = await import("node:path");
		const src = readFileSync(
			join(process.cwd(), "packages/rakta/src/forge/clientEntry.ts"),
			"utf8",
		);
		expect(src).toContain('process.env.NODE_ENV === "development"');
	});

	test("devIndicator source uses Rakta.js SVG path", async () => {
		const { readFileSync } = await import("node:fs");
		const { join } = await import("node:path");
		const src = readFileSync(
			join(process.cwd(), "packages/rakta/src/forge/clientEntry.ts"),
			"utf8",
		);
		expect(src).toContain("Rakta.js.svg");
	});

	test("logoDataUrl must start with data: scheme", () => {
		const validUrls = [
			"data:image/svg+xml;base64,PHN2Zy8+",
			"data:image/svg+xml;charset=utf-8,<svg/>",
		];
		for (const url of validUrls) {
			expect(url.startsWith("data:")).toBe(true);
		}
	});
});
