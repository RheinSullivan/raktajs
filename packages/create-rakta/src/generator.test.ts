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
		expect(fileByPath.has("backend/src/index.ts")).toBe(true);
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
		expect(fileByPath.get("backend/src/index.ts")).toContain("Bun.serve");
		expect(fileByPath.get("backend/src/index.ts")).toContain(
			"appRouter.handle",
		);
		expect(fileByPath.get("frontend/package.json")).toContain('"gsap"');
		expect(fileByPath.get("frontend/package.json")).toContain('"react-icons"');
		expect(fileByPath.get("backend/src/routes/api.ts")).toContain(
			"/api/auth/register",
		);
		expect(fileByPath.get("backend/src/routes/api.ts")).toContain(
			"/api/auth/login",
		);
		expect(fileByPath.get("backend/src/routes/api.ts")).toContain(
			"/api/auth/me",
		);
		expect(fileByPath.get("backend/src/routes/api.ts")).toContain(
			"/api/auth/forgot-password",
		);
		expect(fileByPath.get("backend/src/routes/api.ts")).toContain(
			"/api/auth/reset-password",
		);
		expect(fileByPath.get("backend/src/modules/user/UserRouter.ts")).toContain(
			"/api/users",
		);
		expect(fileByPath.get("backend/src/routes/api.ts")).toContain(
			"/api/cms/posts",
		);

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
		const page = files.find(
			(file) =>
				file.path === "app/(root)/page.tsx" || file.path === "app/page.tsx",
		);
		const config = files.find((file) => file.path === "rakta.config.ts");

		expect(typeof page?.content).toBe("string");
		expect(page?.content).toContain('from "raktajs/hooks"');
		expect(page?.content).toContain("lengkoState");
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

		const apiTs = fileByPath.get("backend/src/routes/api.ts") ?? "";
		expect(apiTs).toContain("/api/auth/refresh");
		expect(apiTs).toContain("/api/auth/logout");

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

	test("generates unified rendering and current Rakta.js dependency", () => {
		const files = generateProjectFiles(fullstackConfig);
		const fileByPath = new Map(
			files.map((file) => [
				file.path,
				typeof file.content === "string" ? file.content : "",
			]),
		);

		expect(fileByPath.get("frontend/package.json")).toContain(
			'"raktajs": "^1.1.8"',
		);
		expect(fileByPath.get("frontend/rakta.config.ts")).toContain(
			'defaultMode: "hybrid"',
		);
		expect(fileByPath.get("frontend/rakta.config.ts")).toContain('"/": "csr"');
		expect(fileByPath.get("README.md")).toContain("bun run dev");
		expect(fileByPath.get("README.md")).toContain(
			"Dependencies are installed automatically",
		);
	});

	test("generates structural Laravel + MySQL backend when selected", () => {
		const laravelConfig: ProjectConfig = {
			...fullstackConfig,
			projectName: "rakta-laravel-app",
			backendFramework: "laravel",
			database: "mysql",
		};
		const files = generateProjectFiles(laravelConfig);
		const fileByPath = new Map(
			files.map((file) => [
				file.path,
				typeof file.content === "string" ? file.content : "",
			]),
		);

		expect(fileByPath.has("backend/composer.json")).toBe(true);
		expect(fileByPath.has("backend/artisan")).toBe(true);
		expect(fileByPath.has("backend/routes/api.php")).toBe(true);
		expect(fileByPath.has("backend/config/database.php")).toBe(true);
		expect(
			fileByPath.has("backend/app/Http/Controllers/AuthController.php"),
		).toBe(true);
		expect(
			fileByPath.has("backend/app/Http/Controllers/UserController.php"),
		).toBe(true);
		expect(fileByPath.has("backend/app/Models/User.php")).toBe(true);
		expect(
			fileByPath.has(
				"backend/database/migrations/2026_01_01_000000_create_users_table.php",
			),
		).toBe(true);

		expect(fileByPath.get("backend/composer.json")).toContain(
			"laravel/framework",
		);
		expect(fileByPath.get("backend/.env.example")).toContain(
			"DB_CONNECTION=mysql",
		);
		expect(fileByPath.get("backend/routes/api.php")).toContain(
			"/auth/register",
		);
		expect(fileByPath.get("backend/routes/api.php")).toContain("/auth/login");
	});

	test("generates structural backends for all backend options", () => {
		const backendFrameworks: ReadonlyArray<import("./types").BackendFramework> =
			[
				"gaman",
				"nestjs",
				"express",
				"adonis",
				"hono",
				"laravel",
				"codeigniter",
				"flask",
				"django",
				"prabogo",
				"beego",
				"rails",
				"hanami",
				"spring-boot",
				"jakarta-ee",
			];

		for (const backendFramework of backendFrameworks) {
			const projectFiles = generateProjectFiles({
				...fullstackConfig,
				projectName: `test-${backendFramework}-app`,
				backendFramework,
			});
			const filePaths = new Set(projectFiles.map((file) => file.path));

			expect(filePaths.has("backend/README.md")).toBe(true);

			if (backendFramework === "gaman") {
				expect(filePaths.has("backend/package.json")).toBe(true);
				expect(filePaths.has("backend/src/index.ts")).toBe(true);
			} else if (backendFramework === "nestjs") {
				expect(filePaths.has("backend/src/main.ts")).toBe(true);
				expect(filePaths.has("backend/src/app.module.ts")).toBe(true);
			} else if (backendFramework === "express") {
				expect(filePaths.has("backend/src/index.ts")).toBe(true);
			} else if (backendFramework === "adonis") {
				expect(filePaths.has("backend/bin/server.ts")).toBe(true);
			} else if (backendFramework === "hono") {
				expect(filePaths.has("backend/src/index.ts")).toBe(true);
			} else if (backendFramework === "laravel") {
				expect(filePaths.has("backend/composer.json")).toBe(true);
				expect(filePaths.has("backend/artisan")).toBe(true);
			} else if (backendFramework === "codeigniter") {
				expect(filePaths.has("backend/composer.json")).toBe(true);
				expect(filePaths.has("backend/spark")).toBe(true);
			} else if (backendFramework === "flask") {
				expect(filePaths.has("backend/app.py")).toBe(true);
			} else if (backendFramework === "django") {
				expect(filePaths.has("backend/manage.py")).toBe(true);
				expect(filePaths.has("backend/core/settings.py")).toBe(true);
			} else if (backendFramework === "prabogo") {
				expect(filePaths.has("backend/main.go")).toBe(true);
				expect(filePaths.has("backend/go.mod")).toBe(true);
			} else if (backendFramework === "beego") {
				expect(filePaths.has("backend/main.go")).toBe(true);
				expect(filePaths.has("backend/conf/app.conf")).toBe(true);
			} else if (backendFramework === "rails") {
				expect(filePaths.has("backend/Gemfile")).toBe(true);
			} else if (backendFramework === "hanami") {
				expect(filePaths.has("backend/Gemfile")).toBe(true);
				expect(filePaths.has("backend/config/app.rb")).toBe(true);
			} else if (backendFramework === "spring-boot") {
				expect(filePaths.has("backend/pom.xml")).toBe(true);
			} else if (backendFramework === "jakarta-ee") {
				expect(filePaths.has("backend/pom.xml")).toBe(true);
				expect(filePaths.has("backend/src/main/webapp/WEB-INF/web.xml")).toBe(true);
			}
		}
	});

	test("generates SawitDB database integration when selected", () => {
		const sawitConfig: ProjectConfig = {
			...fullstackConfig,
			projectName: "rakta-sawit-app",
			backendFramework: "gaman",
			database: "sawitdb",
		};
		const files = generateProjectFiles(sawitConfig);
		const fileByPath = new Map(
			files.map((file) => [
				file.path,
				typeof file.content === "string" ? file.content : "",
			]),
		);

		expect(fileByPath.get("backend/package.json")).toContain('"sawitdb"');
		expect(fileByPath.get("backend/src/database/client.ts")).toContain("SawitDatabaseClient");
	});

	test("does not prompt for a separate render mode", async () => {
		const { readFileSync, existsSync } = await import("node:fs");
		const promptsPath = existsSync("src/prompts.ts")
			? "src/prompts.ts"
			: "packages/create-rakta/src/prompts.ts";
		const promptSource = readFileSync(promptsPath, "utf8");

		expect(promptSource).not.toContain("Choose a render mode");
		expect(promptSource).not.toContain("promptRenderMode");
	});

	test("ships the Gaman.js backend template in the built package", () => {
		const distPath =
			"packages/create-rakta/dist/templates/fullStack/backend/src/index.ts";
		const frontendDistPath =
			"packages/create-rakta/dist/templates/frontendOnly/app/components/Header.tsx";
		if (!existsSync("packages/create-rakta/dist/index.js")) {
			console.warn(
				"[skip] create-rakta dist not found - run bun run build first",
			);
			return;
		}
		expect(existsSync(distPath)).toBe(true);
		expect(existsSync(frontendDistPath)).toBe(true);
	});
});
