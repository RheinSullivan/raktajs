/// <reference types="bun" />

import { describe, expect, test } from "bun:test";
import { generateProjectFiles } from "./generator";
import type { ProjectConfig } from "./types";

const fullstackConfig: ProjectConfig = {
	projectName: "rakta-fullstack",
	projectMode: "fullstack",
	language: "typescript",
	useTypeScript: true,
	autoImport: true,
	cssFramework: "none",
	renderMode: "hybrid",
	backendFramework: "gaman",
	database: "sqlite",
};

describe("create-rakta fullstack generator", () => {
	test("generates auto-import frontend and auth-ready backend", () => {
		const files = generateProjectFiles(fullstackConfig);
		const fileByPath = new Map(
			files.map((file) => [
				file.path,
				typeof file.content === "string" ? file.content : "",
			]),
		);

		expect(fileByPath.has("frontend/rakta-env.d.ts")).toBe(true);
		expect(fileByPath.has("backend/tsconfig.json")).toBe(true);
		expect(fileByPath.has("backend/src/app.ts")).toBe(true);
		expect(fileByPath.has("backend/src/auth/auth.service.ts")).toBe(true);
		expect(fileByPath.has("backend/src/security/jwt.ts")).toBe(true);
		expect(fileByPath.has("backend/src/controllers/user.controller.ts")).toBe(
			true,
		);
		expect(fileByPath.has("backend/src/controllers/cms.controller.ts")).toBe(
			true,
		);
		expect(fileByPath.get("backend/package.json")).toContain('"gaman"');
		expect(fileByPath.get("backend/src/app.ts")).toContain(
			'import { Gaman, type HTTP } from "gaman"',
		);
		expect(fileByPath.get("backend/src/app.ts")).toContain("Gaman<HTTP>()");
		expect(fileByPath.get("backend/src/app.ts")).toContain(
			"/api/auth/register",
		);
		expect(fileByPath.get("backend/src/app.ts")).toContain("/api/auth/login");
		expect(fileByPath.get("backend/src/app.ts")).toContain("/api/auth/me");
		expect(fileByPath.get("backend/src/app.ts")).toContain(
			"/api/auth/forgot-password",
		);
		expect(fileByPath.get("backend/src/app.ts")).toContain(
			"/api/auth/reset-password",
		);
		expect(fileByPath.get("backend/src/app.ts")).toContain("/api/users");
		expect(fileByPath.get("backend/src/app.ts")).toContain("/api/cms/posts");

		for (const [path, content] of fileByPath) {
			if (path.startsWith("frontend/app/") && path.endsWith(".tsx")) {
				expect(content).not.toContain('import React from "react"');
				expect(content).not.toContain('href="/"');
				expect(content).not.toContain('href="/about"');
				expect(content).not.toContain('href="/blog"');
			}
		}
	});

	test("uses Rakta hook imports when auto import is disabled", () => {
		const files = generateProjectFiles({
			...fullstackConfig,
			projectMode: "frontend-only",
			autoImport: false,
		});
		const page = files.find((file) => file.path === "app/page.tsx");
		const config = files.find((file) => file.path === "rakta.config.ts");

		expect(typeof page?.content).toBe("string");
		expect(page?.content).toContain('from "raktajs/hooks"');
		expect(page?.content).toContain("raktaState");
		expect(page?.content).toContain("raktaEffect");
		expect(page?.content).toContain("raktaRef");
		expect(page?.content).not.toContain('from "react"');
		expect(config?.content).toContain("enabled: false");
	});
});
