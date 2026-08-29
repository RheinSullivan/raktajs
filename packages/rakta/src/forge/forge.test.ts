/// <reference types="bun" />

import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
	BUILD_MANIFEST_VERSION,
	createBuildManifest,
	readBuildManifest,
	writeBuildManifest,
} from "./buildManifest";
import {
	formatValidationDiagnostics,
	validateBuildManifest,
} from "./buildValidator";
import {
	generateStaticPages,
	toManifestRoutes,
	writeCsrIndexHtml,
} from "./ssg";

const TEST_DIR = join(
	import.meta.dir,
	"..",
	"..",
	"..",
	"..",
	".tmp",
	"forge-test",
);

beforeAll(() => {
	mkdirSync(TEST_DIR, { recursive: true });
});

afterAll(() => {
	try {
		rmSync(TEST_DIR, { recursive: true, force: true });
	} catch {
		// ignore cleanup errors
	}
});

// ── BuildManifest ─────────────────────────────────────────────────────────────

describe("BuildManifest", () => {
	test("createBuildManifest sets correct version and timestamp", () => {
		const manifest = createBuildManifest({
			rendering: "csr",
			production: true,
			buildMs: 1234,
			client: { entry: "dist/app.js", css: ["dist/app.css"], assets: [] },
			routes: [],
		});

		expect(manifest.version).toBe(BUILD_MANIFEST_VERSION);
		expect(manifest.rendering).toBe("csr");
		expect(manifest.production).toBe(true);
		expect(manifest.buildMs).toBe(1234);
		expect(manifest.client.entry).toBe("dist/app.js");
		expect(typeof manifest.builtAt).toBe("string");
		expect(manifest.builtAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
	});

	test("writeBuildManifest and readBuildManifest round-trip correctly", () => {
		const outDir = join(TEST_DIR, "manifest-roundtrip");
		mkdirSync(outDir, { recursive: true });

		const manifest = createBuildManifest({
			rendering: "ssg",
			production: true,
			buildMs: 999,
			client: {
				entry: join(outDir, "app.js"),
				css: [join(outDir, "app.css")],
				assets: [],
			},
			routes: [
				{
					pattern: "/",
					filePath: "(root)/page.tsx",
					mode: "ssg",
					htmlPath: join(outDir, "index.html"),
				},
				{
					pattern: "/about",
					filePath: "about/page.tsx",
					mode: "ssg",
					htmlPath: join(outDir, "about", "index.html"),
				},
			],
		});

		const manifestPath = writeBuildManifest(manifest, outDir);
		expect(manifestPath).toContain("build-manifest.json");

		const read = readBuildManifest(outDir);
		expect(read).not.toBeNull();
		expect(read?.version).toBe(BUILD_MANIFEST_VERSION);
		expect(read?.rendering).toBe("ssg");
		expect(read?.routes.length).toBe(2);
		expect(read?.routes[0]?.pattern).toBe("/");
	});

	test("readBuildManifest returns null when no manifest exists", () => {
		const noManifestDir = join(TEST_DIR, "no-manifest");
		mkdirSync(noManifestDir, { recursive: true });
		const result = readBuildManifest(noManifestDir);
		expect(result).toBeNull();
	});

	test("SSR manifest includes server entry", () => {
		const manifest = createBuildManifest({
			rendering: "ssr",
			production: true,
			buildMs: 500,
			client: { entry: "dist/client/app.js", css: [], assets: [] },
			server: { entry: "dist/server/index.js", runtime: "bun" },
			routes: [],
		});

		expect(manifest.server).toBeDefined();
		expect(manifest.server?.entry).toBe("dist/server/index.js");
		expect(manifest.server?.runtime).toBe("bun");
	});
});

// ── BuildValidator ─────────────────────────────────────────────────────────────

describe("BuildValidator", () => {
	test("CSR build with missing client entry fails validation", () => {
		const manifest = createBuildManifest({
			rendering: "csr",
			production: true,
			buildMs: 100,
			client: {
				entry: "/nonexistent/app.js",
				css: [],
				assets: [],
			},
			routes: [],
		});

		const result = validateBuildManifest(manifest);
		expect(result.valid).toBe(false);
		expect(result.issues.some((i) => i.kind === "error")).toBe(true);
		expect(
			result.issues.some((i) => i.message.includes("Missing client entry")),
		).toBe(true);
	});

	test("SSR build with missing server entry fails validation", () => {
		const outDir = join(TEST_DIR, "ssr-validation");
		mkdirSync(outDir, { recursive: true });

		// Create a fake client entry file
		const fakeClientEntry = join(outDir, "client", "app.js");
		mkdirSync(join(outDir, "client"), { recursive: true });
		writeFileSync(fakeClientEntry, "// fake bundle", "utf-8");

		const manifest = createBuildManifest({
			rendering: "ssr",
			production: true,
			buildMs: 100,
			client: {
				entry: fakeClientEntry,
				css: [],
				assets: [],
			},
			server: {
				// This file doesn't exist
				entry: join(outDir, "server", "index.js"),
				runtime: "bun",
			},
			routes: [],
		});

		const result = validateBuildManifest(manifest);
		expect(result.valid).toBe(false);
		expect(
			result.issues.some((i) => i.message.includes("Missing server entry")),
		).toBe(true);
	});

	test("SSR build with missing server bundle (no server field) fails", () => {
		const outDir = join(TEST_DIR, "ssr-no-server");
		mkdirSync(outDir, { recursive: true });
		const fakeClientEntry = join(outDir, "app.js");
		writeFileSync(fakeClientEntry, "// bundle", "utf-8");

		const manifest = createBuildManifest({
			rendering: "ssr",
			production: true,
			buildMs: 100,
			client: { entry: fakeClientEntry, css: [], assets: [] },
			routes: [],
			// no server field
		});

		const result = validateBuildManifest(manifest);
		expect(result.valid).toBe(false);
		expect(
			result.issues.some((i) => i.message.includes("missing a server bundle")),
		).toBe(true);
	});

	test("CSR build with all files present passes validation", () => {
		const outDir = join(TEST_DIR, "csr-valid");
		mkdirSync(outDir, { recursive: true });
		const fakeClientEntry = join(outDir, "app.js");
		writeFileSync(fakeClientEntry, "// bundle", "utf-8");

		const manifest = createBuildManifest({
			rendering: "csr",
			production: true,
			buildMs: 100,
			client: { entry: fakeClientEntry, css: [], assets: [] },
			routes: [],
		});

		const result = validateBuildManifest(manifest);
		expect(result.valid).toBe(true);
		expect(result.issues.filter((i) => i.kind === "error")).toHaveLength(0);
	});

	test("SSG build with missing HTML file for route fails validation", () => {
		const outDir = join(TEST_DIR, "ssg-missing-html");
		mkdirSync(outDir, { recursive: true });
		const fakeClientEntry = join(outDir, "app.js");
		writeFileSync(fakeClientEntry, "// bundle", "utf-8");

		const manifest = createBuildManifest({
			rendering: "ssg",
			production: true,
			buildMs: 100,
			client: { entry: fakeClientEntry, css: [], assets: [] },
			routes: [
				{
					pattern: "/",
					filePath: "(root)/page.tsx",
					mode: "ssg",
					// htmlPath references a file that doesn't exist
					htmlPath: join(outDir, "index.html"),
				},
			],
		});

		const result = validateBuildManifest(manifest);
		expect(result.valid).toBe(false);
		expect(
			result.issues.some((i) => i.message.includes("HTML file not found")),
		).toBe(true);
	});

	test("formatValidationDiagnostics includes mode and hints", () => {
		const manifest = createBuildManifest({
			rendering: "ssr",
			production: true,
			buildMs: 100,
			client: { entry: "/missing/app.js", css: [], assets: [] },
			routes: [],
		});

		const result = validateBuildManifest(manifest);
		const output = formatValidationDiagnostics(result, "ssr");

		expect(output).toContain("SSR");
		expect(output).toContain("Rakta.js build validation failed");
		expect(output).toContain("Errors");
	});
});

// ── SSG Pipeline ──────────────────────────────────────────────────────────────

describe("SSG Pipeline", () => {
	test("generateStaticPages writes HTML files for static routes", async () => {
		const outDir = join(TEST_DIR, "ssg-pages");
		mkdirSync(outDir, { recursive: true });

		const result = await generateStaticPages({
			outDir,
			routes: [
				{
					entry: {
						filePath: "(root)/page.tsx",
						urlPattern: "/",
						kind: "page",
						segments: [],
						isDynamic: false,
						paramNames: [],
					},
					mode: "ssg",
				},
				{
					entry: {
						filePath: "about/page.tsx",
						urlPattern: "/about",
						kind: "page",
						segments: [],
						isDynamic: false,
						paramNames: [],
					},
					mode: "ssg",
				},
			],
			renderer: {
				appName: "Test App",
				title: "Test App",
				scriptPath: "/app.js",
				cssPath: "/app.css",
				lang: "en",
			},
		});

		expect(result.success).toBe(true);
		expect(result.errors).toHaveLength(0);
		expect(result.routes).toHaveLength(2);

		const rootRoute = result.routes.find((r) => r.pattern === "/");
		expect(rootRoute?.success).toBe(true);
		expect(rootRoute?.htmlPath).toContain("index.html");
		expect(rootRoute?.sizeBytes).toBeGreaterThan(100);

		const aboutRoute = result.routes.find((r) => r.pattern === "/about");
		expect(aboutRoute?.success).toBe(true);
		expect(aboutRoute?.htmlPath).toContain(join("about", "index.html"));
	});

	test("generateStaticPages skips dynamic routes without generateStaticPaths", async () => {
		const outDir = join(TEST_DIR, "ssg-dynamic");
		mkdirSync(outDir, { recursive: true });

		const result = await generateStaticPages({
			outDir,
			routes: [
				{
					entry: {
						filePath: "blog/[slug]/page.tsx",
						urlPattern: "/blog/:slug",
						kind: "page",
						segments: [],
						isDynamic: true,
						paramNames: ["slug"],
					},
					mode: "ssg",
				},
			],
			renderer: {
				appName: "Test App",
				scriptPath: "/app.js",
				cssPath: "/app.css",
				lang: "en",
			},
		});

		expect(result.success).toBe(true);
		const route = result.routes.find((r) => r.pattern === "/blog/:slug");
		expect(route?.success).toBe(false);
		expect(route?.error).toContain("Dynamic route skipped");
	});

	test("writeCsrIndexHtml creates index.html with correct content", () => {
		const outDir = join(TEST_DIR, "csr-index");
		mkdirSync(outDir, { recursive: true });

		const indexPath = writeCsrIndexHtml(outDir, {
			appName: "My App",
			title: "My App",
			scriptPath: "/app.abc123.js",
			cssPath: "/app.abc123.css",
			lang: "en",
		});

		const { readFileSync } = require("node:fs") as typeof import("node:fs");
		const content = readFileSync(indexPath, "utf-8");

		expect(content).toContain("<!DOCTYPE html>");
		expect(content).toContain("rakta-root");
		expect(content).toContain("/app.abc123.js");
		expect(content).toContain("/app.abc123.css");
		expect(content).toContain('rel="preload"');
		expect(content).toContain('rel="modulepreload"');
	});

	test("writeCsrIndexHtml does not overwrite existing file", () => {
		const outDir = join(TEST_DIR, "csr-no-overwrite");
		mkdirSync(outDir, { recursive: true });

		const { writeFileSync, readFileSync } =
			require("node:fs") as typeof import("node:fs");

		const indexPath = join(outDir, "index.html");
		writeFileSync(indexPath, "ORIGINAL", "utf-8");

		writeCsrIndexHtml(outDir, {
			appName: "My App",
			scriptPath: "/app.js",
			cssPath: "/app.css",
			lang: "en",
		});

		// Original file must be preserved
		const content = readFileSync(indexPath, "utf-8");
		expect(content).toBe("ORIGINAL");
	});

	test("generateStaticPages skips non-SSG routes", async () => {
		const outDir = join(TEST_DIR, "ssg-skip-csr");
		mkdirSync(outDir, { recursive: true });

		const result = await generateStaticPages({
			outDir,
			routes: [
				{
					entry: {
						filePath: "(root)/page.tsx",
						urlPattern: "/",
						kind: "page",
						segments: [],
						isDynamic: false,
						paramNames: [],
					},
					// CSR mode - should be skipped by SSG pipeline
					mode: "csr",
				},
			],
			renderer: {
				appName: "Test",
				scriptPath: "/app.js",
				cssPath: "/app.css",
				lang: "en",
			},
		});

		expect(result.routes).toHaveLength(0);
		expect(result.success).toBe(true);
	});

	test("toManifestRoutes maps SSG results to BuildManifestRoute[]", () => {
		const ssgResults = [
			{
				pattern: "/",
				filePath: "(root)/page.tsx",
				mode: "ssg" as const,
				htmlPath: "/dist/index.html",
				sizeBytes: 1024,
				success: true,
			},
		];

		const allEntries = [
			{
				filePath: "(root)/page.tsx",
				urlPattern: "/",
				kind: "page" as const,
				segments: [],
				isDynamic: false,
				paramNames: [],
			},
			{
				filePath: "about/page.tsx",
				urlPattern: "/about",
				kind: "page" as const,
				segments: [],
				isDynamic: false,
				paramNames: [],
			},
		];

		const routes = toManifestRoutes(ssgResults, "ssg", allEntries);

		expect(routes).toHaveLength(2);

		const root = routes.find((r) => r.pattern === "/");
		expect(root?.htmlPath).toBe("/dist/index.html");
		expect(root?.mode).toBe("ssg");

		const about = routes.find((r) => r.pattern === "/about");
		// /about was not in ssgResults, so htmlPath should be undefined
		expect(about?.htmlPath).toBeUndefined();
		expect(about?.mode).toBe("ssg");
	});
});
