import { describe, expect, test } from "bun:test";
/// <reference types="bun" />

import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createVitePressConfig, scanMarkdownDocs } from "./index";

describe("Rakta docs", () => {
	test("generates markdown manifest, sidebar, search, and VitePress config", () => {
		const rootDir = join(process.cwd(), ".tmp", "rakta-docs-test");

		rmSync(rootDir, { recursive: true, force: true });
		mkdirSync(rootDir, { recursive: true });
		writeFileSync(
			join(rootDir, "index.md"),
			"# Guide\n\nWelcome to Rakta docs.\n\n## Install\n\nUse Bun.",
		);

		const manifest = scanMarkdownDocs({
			rootDir,
			locale: "en",
			basePath: "/docs",
		});
		const config = createVitePressConfig(manifest, {
			title: "Rakta.js",
			description: "Framework docs",
		});

		expect(manifest.pages).toHaveLength(1);
		expect(manifest.pages[0]?.title).toBe("Guide");
		expect(manifest.search[0]?.headings).toEqual(["Install"]);
		expect(config.themeConfig.search.provider).toBe("local");
		expect(config.themeConfig.sidebar[0]?.link).toBe("/docs/index");

		rmSync(rootDir, { recursive: true, force: true });
	});
});
