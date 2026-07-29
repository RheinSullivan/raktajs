/// <reference types="bun" />

import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
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
		expect(fileByPath.has("shared/package.json")).toBe(true);
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
			'import { Gaman, composeRouter } from "gaman"',
		);
		expect(fileByPath.get("backend/src/app.ts")).toContain("new Gaman()");
		expect(fileByPath.get("backend/src/app.ts")).toContain("composeRouter");
		expect(fileByPath.get("backend/src/app.ts")).toContain(
			"await app.mount(router)",
		);
		expect(fileByPath.get("frontend/package.json")).toContain('"gsap"');
		expect(fileByPath.get("frontend/package.json")).toContain('"react-icons"');
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
		expect(page?.content).toContain("lengkoState");
		expect(page?.content).toContain("empalEffect");
		expect(page?.content).toContain("megamendungRef");
		expect(page?.content).not.toContain('from "react"');
		expect(config?.content).toContain("enabled: false");
	});

	test("generates refresh endpoint and logout-all route in fullstack app", () => {
		const files = generateProjectFiles(fullstackConfig);
		const fileByPath = new Map(
			files.map((file) => [
				file.path,
				typeof file.content === "string" ? file.content : "",
			]),
		);

		const appTs = fileByPath.get("backend/src/app.ts") ?? "";
		expect(appTs).toContain("/api/auth/refresh");
		expect(appTs).toContain("/api/auth/logout");

		const authService =
			fileByPath.get("backend/src/auth/auth.service.ts") ?? "";
		expect(authService).toContain("refreshTokens");
		expect(authService).toContain("logoutAll");

		const jwt = fileByPath.get("backend/src/security/jwt.ts") ?? "";
		expect(jwt).toContain("signAccessToken");
		expect(jwt).toContain("signRefreshToken");
		expect(jwt).toContain("rotateRefreshToken");
	});

	test("generates OAuth config when providers are selected", () => {
		const configWithOAuth: ProjectConfig = {
			...fullstackConfig,
			oauthProviders: ["google", "github"],
		};
		const files = generateProjectFiles(configWithOAuth);
		const fileByPath = new Map(
			files.map((file) => [
				file.path,
				typeof file.content === "string" ? file.content : "",
			]),
		);

		const oauthConfig =
			fileByPath.get("backend/src/auth/oauth.config.ts") ?? "";
		expect(oauthConfig).toContain("google");
		expect(oauthConfig).toContain("github");
		expect(oauthConfig).toContain("buildOAuthUrl");

		const envExample = fileByPath.get("backend/.env.example") ?? "";
		expect(envExample).toContain("GOOGLE_CLIENT_ID");
		expect(envExample).toContain("GITHUB_CLIENT_ID");
	});

	test("ships the Gaman.js backend template in the built package", () => {
		const distPath =
			"packages/create-rakta/dist/templates/fullStack/backend/src/app.ts";
		// This test requires the package to be built first.
		// In CI, build runs before test (ci.yml step order: build → test).
		// Locally: run `bun run build` before `bun run test`.
		if (!existsSync("packages/create-rakta/dist/index.js")) {
			// dist not built yet - skip gracefully
			console.warn(
				"[skip] create-rakta dist not found - run bun run build first",
			);
			return;
		}
		expect(existsSync(distPath)).toBe(true);
	});
});
