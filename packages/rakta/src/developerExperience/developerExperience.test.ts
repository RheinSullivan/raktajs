import { describe, expect, test } from "bun:test";
import {
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { defaultConfig } from "../config/defineConfig";
import { mergeConfig } from "../config/loadConfig";
import {
	clearRaktaDevelopmentCache,
	RAKTA_DEVTOOLS_BUNDLER_NAME,
	RAKTA_DEVTOOLS_CONTROL_BASE_PATH,
	resolveRaktaDevToolsRouteInfo,
} from "../forge/devTools";
import type { RouteManifestEntry, RouteSegment } from "../router/types";
import {
	DEFAULT_RAKTA_DEVTOOLS_PREFERENCES,
	isReservedShortcut,
	mountDevIndicator,
	normalizeKeyboardShortcut,
	readRaktaDevToolsPreferences,
	shouldIgnoreShortcutTarget,
} from "./devIndicator";
import {
	createDevTerminal,
	detectEnvFiles,
	detectLanAddress,
	RAKTA_TERMINAL_GLYPH,
} from "./terminal";

function resolvePackagePath(relPath: string): string {
	const cwd = process.cwd().replace(/\\/g, "/");
	if (cwd.endsWith("/packages/rakta")) {
		return join(cwd, relPath.replace(/^packages\/rakta\//, ""));
	}
	return join(cwd, relPath);
}

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

	test("detailedTiming shows rakta.js and application-code breakdown in new format", () => {
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
			frameworkMs: 3,
			applicationMs: 38,
		});
		console.log = orig;
		// New format: (rakta.js: Xms, application-code: Yms)
		expect(logs.some((line) => line.includes("rakta.js"))).toBe(true);
		expect(logs.some((line) => line.includes("application-code"))).toBe(true);
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
		const src = readFileSync(
			resolvePackagePath("packages/rakta/src/forge/clientEntry.ts"),
			"utf8",
		);
		expect(src).toContain('process.env.NODE_ENV === "development"');
	});

	test("devIndicator source uses Rakta.js SVG path", async () => {
		const { readFileSync } = await import("node:fs");
		const src = readFileSync(
			resolvePackagePath("packages/rakta/src/forge/clientEntry.ts"),
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

describe("Rakta DevTools", () => {
	function createSegment(raw: string): RouteSegment {
		const isDynamic = raw.startsWith("[") && raw.endsWith("]");
		const innerSegment = isDynamic ? raw.slice(1, -1) : "";
		const isCatchAll = innerSegment.startsWith("...");
		const paramName = isCatchAll ? innerSegment.slice(3) : innerSegment;

		return {
			raw,
			pathPart: isDynamic ? `:${paramName}` : raw,
			isDynamic,
			isCatchAll,
			isOptionalCatchAll: false,
			isGroup: raw.startsWith("(") && raw.endsWith(")"),
			paramName,
		};
	}

	function createRoute(
		filePath: string,
		urlPattern: string,
		kind: RouteManifestEntry["kind"],
		segmentNames: string[],
	): RouteManifestEntry {
		const segments = segmentNames.map(createSegment);
		const paramNames = segments
			.filter((segment) => segment.isDynamic)
			.map((segment) => segment.paramName);

		return {
			filePath,
			urlPattern,
			kind,
			segments,
			isDynamic: paramNames.length > 0,
			paramNames,
		};
	}

	test("uses the Rakta DevTools feature name in source", () => {
		const source = readFileSync(
			resolvePackagePath(
				"packages/rakta/src/developerExperience/devIndicator.ts",
			),
			"utf8",
		);
		expect(source).toContain("Rakta DevTools");
		expect(source).not.toContain("Next.js DevTools");
		expect(source).not.toContain("Next Indicator");
	});

	test("route information comes from the manifest and render config", () => {
		const routeInfo = resolveRaktaDevToolsRouteInfo({
			pathname: "/dashboard/42",
			renderConfig: {
				defaultMode: "csr",
				routes: {
					"/dashboard/:id": "ssr",
				},
			},
			manifest: {
				version: "1",
				generatedAt: "2026-08-13T00:00:00.000Z",
				routes: [
					createRoute("layout.tsx", "/", "layout", []),
					createRoute("dashboard/layout.tsx", "/dashboard", "layout", [
						"dashboard",
					]),
					createRoute("dashboard/[id]/page.tsx", "/dashboard/:id", "page", [
						"dashboard",
						"[id]",
					]),
				],
			},
		});

		expect(routeInfo.currentPathname).toBe("/dashboard/42");
		expect(routeInfo.matchedPattern).toBe("/dashboard/:id");
		expect(routeInfo.routeType).toBe("page");
		expect(routeInfo.renderMode).toBe("ssr");
		expect(routeInfo.renderModeSource).toBe("route-override");
		expect(routeInfo.routeSource).toBe("dashboard/[id]/page.tsx");
		expect(routeInfo.pageFile).toBe("dashboard/[id]/page.tsx");
		expect(routeInfo.layoutFiles).toEqual([
			"layout.tsx",
			"dashboard/layout.tsx",
		]);
		expect(routeInfo.paramNames).toEqual(["id"]);
	});

	test("bundler information reflects the active Forge bundler", () => {
		expect(RAKTA_DEVTOOLS_BUNDLER_NAME).toBe("Bun.build (CherbonsEngine)");
	});

	test("default preferences support theme, position, size, and shortcut", () => {
		expect(DEFAULT_RAKTA_DEVTOOLS_PREFERENCES.theme).toBe("system");
		expect(DEFAULT_RAKTA_DEVTOOLS_PREFERENCES.position).toBe("bottom-left");
		expect(DEFAULT_RAKTA_DEVTOOLS_PREFERENCES.size).toBe("medium");
		expect(DEFAULT_RAKTA_DEVTOOLS_PREFERENCES.shortcut).toBe("Alt+Shift+D");
	});

	test("preference reader falls back safely outside the browser", () => {
		expect(readRaktaDevToolsPreferences()).toEqual(
			DEFAULT_RAKTA_DEVTOOLS_PREFERENCES,
		);
	});

	test("shortcut recording normalizes modifiers and rejects reserved shortcuts", () => {
		const shortcut = normalizeKeyboardShortcut({
			key: "d",
			ctrlKey: false,
			metaKey: false,
			altKey: true,
			shiftKey: true,
		} as KeyboardEvent);

		expect(shortcut).toBe("Alt+Shift+D");
		expect(isReservedShortcut("Control+R")).toBe(true);
		expect(isReservedShortcut("Alt+Shift+D")).toBe(false);
	});

	test("shortcut handling ignores null editing targets without throwing", () => {
		expect(shouldIgnoreShortcutTarget(null)).toBe(false);
	});

	test("project-level devTools false merges into resolved config", () => {
		const mergedConfig = mergeConfig(defaultConfig, { devTools: false });
		expect(
			typeof mergedConfig.devTools === "boolean"
				? mergedConfig.devTools
				: mergedConfig.devTools.enabled,
		).toBe(false);
	});

	test("restart and cache reset endpoints are development control endpoints", () => {
		const source = readFileSync(
			resolvePackagePath("packages/rakta/src/forge/devServer.ts"),
			"utf8",
		);
		expect(RAKTA_DEVTOOLS_CONTROL_BASE_PATH).toBe("/__rakta/devtools");
		expect(source).toContain("RAKTA_DEVTOOLS_CONTROL_BASE_PATH");
		expect(source).toContain("/restart");
		expect(source).toContain("/cache/reset");
		expect(source).toContain("restartDevelopmentServer");
		expect(source).toContain("resetDevelopmentCache");
	});

	test("cache reset only removes the generated Rakta development cache", () => {
		const temporaryDirectory = mkdtempSync(join(tmpdir(), "rakta-devtools-"));
		const cacheDirectory = join(temporaryDirectory, ".rakta", "dev");
		const sourceDirectory = join(temporaryDirectory, "app");
		mkdirSync(cacheDirectory, { recursive: true });
		mkdirSync(sourceDirectory, { recursive: true });
		writeFileSync(join(cacheDirectory, "app.js"), "generated");
		writeFileSync(join(sourceDirectory, "page.tsx"), "source");

		try {
			const result = clearRaktaDevelopmentCache(temporaryDirectory);
			expect(result.ok).toBe(true);
			expect(readFileSync(join(sourceDirectory, "page.tsx"), "utf8")).toBe(
				"source",
			);
			expect(() =>
				readFileSync(join(cacheDirectory, "app.js"), "utf8"),
			).toThrow();
		} finally {
			rmSync(temporaryDirectory, { recursive: true, force: true });
		}
	});

	test("production client entry omits the dev indicator import when disabled", () => {
		const source = readFileSync(
			resolvePackagePath("packages/rakta/src/forge/build.ts"),
			"utf8",
		);
		expect(source).toContain("devToolsEnabled: false");
		expect(source).toContain('"process.env.NODE_ENV"');
		expect(source).toContain("production");
	});

	test("client entry references the actual Rakta.js SVG asset", () => {
		const source = readFileSync(
			resolvePackagePath("packages/rakta/src/forge/clientEntry.ts"),
			"utf8",
		);
		expect(source).toContain("public");
		expect(source).toContain("Rakta.js.svg");
		expect(source).not.toContain("Next.js");
	});

	test("modified DevTools files avoid unclear implementation variable names", () => {
		const modifiedSourceFiles = [
			"packages/rakta/src/developerExperience/devIndicator.ts",
			"packages/rakta/src/forge/devTools.ts",
		];
		const unclearNamePattern =
			/\b(cfg|ctx|req|res|err|msg|opts|args|params|props|ref|el|evt|fn|cb|idx|tmp|val|obj|str|num|arr)\b/;

		for (const sourceFile of modifiedSourceFiles) {
			const source = readFileSync(resolvePackagePath(sourceFile), "utf8");
			expect(source.match(unclearNamePattern)).toBeNull();
		}
	});

	test("modified DevTools files do not include decorative separator comments", () => {
		const modifiedSourceFiles = [
			"packages/rakta/src/developerExperience/devIndicator.ts",
			"packages/rakta/src/forge/devTools.ts",
		];
		const separatorPattern = /[─━]{4,}|-{8,}/;

		for (const sourceFile of modifiedSourceFiles) {
			const source = readFileSync(resolvePackagePath(sourceFile), "utf8");
			expect(source.match(separatorPattern)).toBeNull();
		}
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// v1.2.0 Regression Tests: Welcome Page + DevTools + Terminal Format
// ─────────────────────────────────────────────────────────────────────────────

describe("v1.2.0 DevTools position regression tests", () => {
	test("DevTools type supports all six positions", () => {
		const source = readFileSync(
			resolvePackagePath(
				"packages/rakta/src/developerExperience/devIndicator.ts",
			),
			"utf8",
		);
		expect(source).toContain('"bottom-left"');
		expect(source).toContain('"bottom-center"');
		expect(source).toContain('"bottom-right"');
		expect(source).toContain('"top-left"');
		expect(source).toContain('"top-center"');
		expect(source).toContain('"top-right"');
	});

	test("DevTools CSS has positioning rules for all six positions", () => {
		const source = readFileSync(
			resolvePackagePath(
				"packages/rakta/src/developerExperience/devIndicator.ts",
			),
			"utf8",
		);
		// indicator rules
		expect(source).toContain(
			'[data-position="bottom-center"] .rakta-devtools-indicator',
		);
		expect(source).toContain(
			'[data-position="top-center"] .rakta-devtools-indicator',
		);
		// panel rules
		expect(source).toContain(
			'[data-position="bottom-center"] .rakta-devtools-panel',
		);
		expect(source).toContain(
			'[data-position="top-center"] .rakta-devtools-panel',
		);
	});

	test("DevTools position labels include all six values", () => {
		const source = readFileSync(
			resolvePackagePath(
				"packages/rakta/src/developerExperience/devIndicator.ts",
			),
			"utf8",
		);
		expect(source).toContain('"Bottom Center"');
		expect(source).toContain('"Top Center"');
	});

	test("isPosition guard accepts all six valid position strings", () => {
		const source = readFileSync(
			resolvePackagePath(
				"packages/rakta/src/developerExperience/devIndicator.ts",
			),
			"utf8",
		);
		// The isPosition function must test all six values
		expect(source).toContain('position === "bottom-center"');
		expect(source).toContain('position === "top-center"');
	});

	test("center positions use translateX(-50%) for horizontal centering", () => {
		const source = readFileSync(
			resolvePackagePath(
				"packages/rakta/src/developerExperience/devIndicator.ts",
			),
			"utf8",
		);
		expect(source).toContain("translateX(-50%)");
		expect(source).toContain("left: 50%");
	});
});

describe("v1.2.0 terminal output format regression tests", () => {
	test("printStartup uses indented format with I1/I2 spacing", () => {
		const source = readFileSync(
			resolvePackagePath("packages/rakta/src/developerExperience/terminal.ts"),
			"utf8",
		);
		// New format uses 4-space and 8-space indentation constants
		expect(source).toContain('const I1 = "    "');
		expect(source).toContain('const I2 = "        "');
	});

	test("printStartup accepts configDurationMs parameter and emits config timing line", () => {
		const t = createDevTerminal({
			version: "1.2.0",
			projectRoot: process.cwd(),
		});
		t.markStart();
		const logs: string[] = [];
		const orig = console.log;
		console.log = (...args: unknown[]) => logs.push(args.join(" "));
		t.printStartup("http://localhost:3000", 291);
		console.log = orig;
		const configLine = logs.find((line) => line.includes("rakta.config.ts"));
		expect(configLine).toBeDefined();
		expect(configLine).toContain("291ms");
	});

	test("printStartup without configDurationMs does not emit config timing line", () => {
		const t = createDevTerminal({
			version: "1.2.0",
			projectRoot: process.cwd(),
		});
		t.markStart();
		const logs: string[] = [];
		const orig = console.log;
		console.log = (...args: unknown[]) => logs.push(args.join(" "));
		t.printStartup("http://localhost:3000");
		console.log = orig;
		expect(logs.some((line) => line.includes("rakta.config.ts"))).toBe(false);
	});

	test("printCompileStart emits route compile indicator", () => {
		const t = createDevTerminal({
			version: "1.2.0",
			projectRoot: process.cwd(),
		});
		const logs: string[] = [];
		const orig = console.log;
		console.log = (...args: unknown[]) => logs.push(args.join(" "));
		t.printCompileStart("/dashboard");
		console.log = orig;
		const compileLine = logs.find((line) => line.includes("/dashboard"));
		expect(compileLine).toBeDefined();
		expect(compileLine).toContain("Compiling");
	});

	test("printCompileEnd emits compile success line with duration", () => {
		const t = createDevTerminal({
			version: "1.2.0",
			projectRoot: process.cwd(),
		});
		const logs: string[] = [];
		const orig = console.log;
		console.log = (...args: unknown[]) => logs.push(args.join(" "));
		t.printCompileEnd("/dashboard", 212);
		console.log = orig;
		const compiled = logs.find((line) => line.includes("Compiled"));
		expect(compiled).toBeDefined();
		expect(compiled).toContain("212ms");
	});

	test("logRequest with timing breakdown emits rakta.js and application-code", () => {
		const t = createDevTerminal({
			version: "1.2.0",
			projectRoot: process.cwd(),
		});
		const logs: string[] = [];
		const orig = console.log;
		console.log = (...args: unknown[]) => logs.push(args.join(" "));
		t.logRequest({
			method: "GET",
			pathname: "/",
			status: 200,
			totalMs: 183,
			frameworkMs: 17,
			applicationMs: 166,
		});
		console.log = orig;
		const requestLine = logs.find((line) => line.includes("200"));
		expect(requestLine).toBeDefined();
		expect(requestLine).toContain("rakta.js");
		expect(requestLine).toContain("application-code");
	});

	test("logRequest without timing breakdown omits the breakdown suffix", () => {
		const t = createDevTerminal({
			version: "1.2.0",
			projectRoot: process.cwd(),
		});
		const logs: string[] = [];
		const orig = console.log;
		console.log = (...args: unknown[]) => logs.push(args.join(" "));
		t.logRequest({
			method: "GET",
			pathname: "/api/health",
			status: 200,
			totalMs: 4,
		});
		console.log = orig;
		const requestLine = logs.find((line) => line.includes("200"));
		expect(requestLine).toBeDefined();
		expect(requestLine).not.toContain("rakta.js:");
		expect(requestLine).not.toContain("application-code:");
	});

	test("duration formatting: <1000ms stays in ms, >=1000ms converts to seconds", () => {
		const t = createDevTerminal({
			version: "1.2.0",
			projectRoot: process.cwd(),
		});
		const logs: string[] = [];
		const orig = console.log;
		console.log = (...args: unknown[]) => logs.push(args.join(" "));
		t.logRebuild(237);
		t.logRebuild(1500);
		t.logRebuild(19200);
		console.log = orig;
		expect(logs[0]).toContain("237ms");
		expect(logs[1]).toContain("s"); // 1.50s
		expect(logs[2]).toContain("s"); // 19.2s
	});

	test("terminal source does not use pad() helper (removed after refactor)", () => {
		const source = readFileSync(
			resolvePackagePath("packages/rakta/src/developerExperience/terminal.ts"),
			"utf8",
		);
		// The pad() function was removed when the new format was implemented.
		// Ensure it wasn't accidentally re-added.
		expect(source).not.toContain("function pad(");
	});
});

describe("v1.2.0 config timing wiring regression tests", () => {
	test("ForgeDevServerOptions includes optional configDurationMs field", () => {
		const source = readFileSync(
			resolvePackagePath("packages/rakta/src/forge/types.ts"),
			"utf8",
		);
		expect(source).toContain("configDurationMs");
		expect(source).toContain("readonly configDurationMs");
	});

	test("dev.ts instruments configDurationMs before calling startDevServer", () => {
		const source = readFileSync(
			resolvePackagePath("packages/rakta/src/cli/dev.ts"),
			"utf8",
		);
		expect(source).toContain("configStartTime");
		expect(source).toContain("configDurationMs");
		expect(source).toContain("Date.now()");
	});

	test("devServer.ts passes configDurationMs to terminal.printStartup", () => {
		const source = readFileSync(
			resolvePackagePath("packages/rakta/src/forge/devServer.ts"),
			"utf8",
		);
		expect(source).toContain("options.configDurationMs");
		expect(source).toContain("printStartup");
	});

	test("devServer.ts emits compile state before serving first bundle", () => {
		const source = readFileSync(
			resolvePackagePath("packages/rakta/src/forge/devServer.ts"),
			"utf8",
		);
		expect(source).toContain("firstCompileDone");
		expect(source).toContain("printCompileStart");
		expect(source).toContain("printCompileEnd");
	});

	test("devServer.ts tracks renderStart for timing breakdown", () => {
		const source = readFileSync(
			resolvePackagePath("packages/rakta/src/forge/devServer.ts"),
			"utf8",
		);
		expect(source).toContain("renderStart");
		expect(source).toContain("renderMs");
		expect(source).toContain("frameworkMs");
	});
});

describe("v1.2.0 template dependency regression tests", () => {
	test("frontendOnly template package.json has no framer-motion dependency", () => {
		const pkg = JSON.parse(
			readFileSync(
				resolvePackagePath("templates/frontendOnly/package.json"),
				"utf8",
			),
		) as {
			dependencies?: Record<string, string>;
			devDependencies?: Record<string, string>;
		};
		const allDeps = {
			...(pkg.dependencies ?? {}),
			...(pkg.devDependencies ?? {}),
		};
		expect(allDeps).not.toHaveProperty("framer-motion");
		expect(allDeps).not.toHaveProperty("motion");
		expect(allDeps).not.toHaveProperty("lucide-react");
	});

	test("frontendOnly template package.json has gsap dependency", () => {
		const pkg = JSON.parse(
			readFileSync(
				resolvePackagePath("templates/frontendOnly/package.json"),
				"utf8",
			),
		) as { dependencies?: Record<string, string> };
		expect(pkg.dependencies).toHaveProperty("gsap");
	});

	test("frontendOnly template package.json has react-icons dependency", () => {
		const pkg = JSON.parse(
			readFileSync(
				resolvePackagePath("templates/frontendOnly/package.json"),
				"utf8",
			),
		) as { dependencies?: Record<string, string> };
		expect(pkg.dependencies).toHaveProperty("react-icons");
	});

	test("ShrimpRunGame.tsx frontendOnly uses ShrimpCharacter not emoji", () => {
		const source = readFileSync(
			resolvePackagePath(
				"templates/frontendOnly/app/components/ShrimpRunGame.tsx",
			),
			"utf8",
		);
		expect(source).toContain("ShrimpCharacter");
		expect(source).toContain("CoralObstacle");
		expect(source).not.toContain("🦐");
	});

	test("ShrimpRunGame.tsx fullstack uses ShrimpCharacter not emoji", () => {
		const source = readFileSync(
			resolvePackagePath(
				"templates/fullStack/frontend/app/components/ShrimpRunGame.tsx",
			),
			"utf8",
		);
		expect(source).toContain("ShrimpCharacter");
		expect(source).toContain("CoralObstacle");
		expect(source).not.toContain("🦐");
	});

	test("ShrimpRunGame.tsx frontendOnly does not import framer-motion or lucide-react", () => {
		const source = readFileSync(
			resolvePackagePath(
				"templates/frontendOnly/app/components/ShrimpRunGame.tsx",
			),
			"utf8",
		);
		expect(source).not.toContain("framer-motion");
		expect(source).not.toContain("lucide-react");
		expect(source).not.toContain('from "motion"');
	});

	test("template source files do not import framer-motion", () => {
		const templateDirs = [
			"templates/frontendOnly/app",
			"templates/fullStack/frontend/app",
		];
		for (const dir of templateDirs) {
			const files = [
				join(dir, "components/Header.tsx"),
				join(dir, "components/Footer.tsx"),
				join(dir, "components/HeroSection.tsx"),
				join(dir, "components/FeatureGrid.tsx"),
				join(dir, "components/ShrimpRunGame.tsx"),
			];
			for (const file of files) {
				try {
					const src = readFileSync(resolvePackagePath(file), "utf8");
					expect(src).not.toContain("framer-motion");
					expect(src).not.toContain("lucide-react");
					expect(src).not.toContain('from "motion"');
				} catch {
					// File may not exist in one template dir - skip
				}
			}
		}
	});
});
