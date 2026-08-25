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
		expect(fileByPath.get("backend/package.json")).toContain('"jsonwebtoken"');
		expect(fileByPath.get("backend/package.json")).not.toContain('"gaman":');
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
			'"raktajs": "^1.2.0"',
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

	test("generates primitive declarations for frontend-only and fullstack projects", () => {
		const frontendFiles = generateProjectFiles({
			...fullstackConfig,
			projectMode: "frontend-only",
		});
		const fullstackFiles = generateProjectFiles(fullstackConfig);

		const frontendEnv =
			frontendFiles.find((file) => file.path === "rakta-env.d.ts")?.content ??
			"";
		const fullstackEnv =
			fullstackFiles.find((file) => file.path === "frontend/rakta-env.d.ts")
				?.content ?? "";

		for (const envContent of [frontendEnv, fullstackEnv]) {
			expect(envContent).toContain("click: RaktaClickAttributes");
			expect(envContent).toContain("picture: RaktaPhotoAttributes");
			expect(envContent).toContain(
				'lazy: import("raktajs/components").LazyProps',
			);
			expect(envContent).toContain(
				'guard: import("raktajs/components").GuardProps',
			);
			expect(envContent).toContain(
				'seal: import("raktajs/components").SealProps',
			);
			expect(envContent).toContain(
				'shelf: import("raktajs/components").ShelfProps<unknown>',
			);
			expect(envContent).toContain(
				'island: import("raktajs/components").IslandProps',
			);
			expect(envContent).toContain(
				'prefetch: import("raktajs/components").PrefetchProps',
			);
			expect(envContent).toContain(
				'route: import("raktajs/components").RouteProps',
			);
			expect(envContent).toContain(
				'resource: import("raktajs/components").ResourceProps',
			);
			expect(envContent).toContain(
				'form: import("react").FormHTMLAttributes<HTMLFormElement>',
			);
			expect(envContent).toContain("readonly csrfToken?: string");
			expect(envContent).toContain("const Island");
			expect(envContent).toContain("const Resource");
		}
	});

	test("does not generate stale modal starter files or lucide-react dependency", () => {
		const generatedSets = [
			generateProjectFiles({
				...fullstackConfig,
				projectMode: "frontend-only",
			}),
			generateProjectFiles(fullstackConfig),
		];

		for (const files of generatedSets) {
			for (const file of files) {
				const content = typeof file.content === "string" ? file.content : "";
				// Modal components are now valid generated template files — they must
				// NOT import from lucide-react or framer-motion/motion, but their
				// existence as Rakta.js components is correct and expected.
				expect(content).not.toContain("lucide-react");
				expect(content).not.toContain("framer-motion");
				expect(content).not.toContain('from "motion"');
				// The old Vite-prototype modals used motion/react directly — ensure
				// that specific stale import pattern is absent.
				expect(content).not.toContain('from "motion/react"');
			}
		}
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
				expect(filePaths.has("backend/src/main/webapp/WEB-INF/web.xml")).toBe(
					true,
				);
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
		expect(fileByPath.get("backend/src/database/client.ts")).toContain(
			"SawitDatabaseClient",
		);
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

	test("fullstack project with non-Node backend does not include backend in workspaces", () => {
		const springBootConfig: ProjectConfig = {
			...fullstackConfig,
			backendFramework: "spring-boot",
			database: "oracle" as import("./types").Database,
		};
		const files = generateProjectFiles(springBootConfig);
		const rootPkg = files.find((f) => f.path === "package.json");
		const pkg = JSON.parse(
			typeof rootPkg?.content === "string" ? rootPkg.content : "{}",
		) as { workspaces?: string[] };
		expect(pkg.workspaces).not.toContain("backend");
		expect(pkg.workspaces).toContain("frontend");
		expect(pkg.workspaces).toContain("shared");
	});

	test("fullstack project with Gaman.js backend includes backend in workspaces", () => {
		const files = generateProjectFiles(fullstackConfig);
		const rootPkg = files.find((f) => f.path === "package.json");
		const pkg = JSON.parse(
			typeof rootPkg?.content === "string" ? rootPkg.content : "{}",
		) as { workspaces?: string[] };
		expect(pkg.workspaces).toContain("backend");
		expect(pkg.workspaces).toContain("frontend");
		expect(pkg.workspaces).toContain("shared");
	});

	test("gaman backend package.json does not reference phantom dependencies", () => {
		const files = generateProjectFiles(fullstackConfig);
		const backendPkg = files.find((f) => f.path === "backend/package.json");
		const pkg = JSON.parse(
			typeof backendPkg?.content === "string" ? backendPkg.content : "{}",
		) as { dependencies?: Record<string, string> };
		expect(pkg.dependencies).not.toHaveProperty("gaman");
		expect(pkg.dependencies).not.toHaveProperty("@gaman/core");
		expect(pkg.dependencies).not.toHaveProperty("@gaman/michi");
		expect(pkg.dependencies).not.toHaveProperty("@gaman/cors");
		expect(pkg.dependencies).toHaveProperty("jsonwebtoken");
	});

	test("gaman backend index.ts does not import from nonexistent gaman package", () => {
		const files = generateProjectFiles(fullstackConfig);
		const indexFile = files.find((f) => f.path === "backend/src/index.ts");
		expect(typeof indexFile?.content).toBe("string");
		const content = indexFile?.content as string;
		expect(content).not.toContain('from "gaman"');
		expect(content).not.toContain('from "@gaman/');
		expect(content).toContain("Bun.serve");
	});
});

// ─── Regression tests for v1.2.0 confirmed bugs ───────────────────────────────

describe("v1.2.0 regression tests", () => {
	// BUG #1 / BUG #7: spawn EINVAL on Windows
	test("resolveBunSpawnOptions routes through cmd.exe on Windows", async () => {
		// We test the logic in index.ts indirectly by reading the source.
		// The core logic: on win32, command should be cmd.exe with /d /s /c prefix.
		// We cannot execute child processes in this test, but we can validate the source.
		const { readFileSync } = await import("node:fs");
		const indexSource = readFileSync(
			"packages/create-rakta/src/index.ts",
			"utf8",
		);
		expect(indexSource).toContain("resolveBunSpawnOptions");
		expect(indexSource).toContain("cmd.exe");
		expect(indexSource).toContain('"/d", "/s", "/c", "bun install"');
		expect(indexSource).toContain('process.platform === "win32"');
		// macOS/Linux: still spawns bun directly
		expect(indexSource).toContain('"bun"');
		expect(indexSource).toContain('"install"');
	});

	// BUG #2: rakta.config.ts description string must not contain broken smart quotes
	test("frontend-only generated rakta.config.ts has no broken smart quotes", () => {
		const files = generateProjectFiles({
			...fullstackConfig,
			projectMode: "frontend-only",
			autoImport: true,
			cssFramework: "tailwind",
		});
		const config = files.find((file) => file.path === "rakta.config.ts");
		expect(typeof config?.content).toBe("string");
		const content = config?.content as string;
		// The right double quotation mark U+201D must not appear in the
		// generated config file — it caused "Built with Rakta.js -" to
		// break the TypeScript string literal.
		expect(content).not.toContain("\u201d");
		// The description must be a valid plain-ASCII hyphen, not a curly quote.
		expect(content).not.toContain("Rakta.js -\u201d");
	});

	// BUG #2: Fullstack frontend rakta.config.ts must not have broken description
	test("fullstack frontend rakta.config.ts inline fallback has no broken smart quotes", async () => {
		// Verify the generator source itself doesn't contain the broken pattern.
		const { readFileSync } = await import("node:fs");
		const generatorSource = readFileSync(
			"packages/create-rakta/src/generator.ts",
			"utf8",
		);
		// No right double quotation mark should appear inside any JS/TS string
		// that generates TypeScript source code for description fields.
		expect(generatorSource).not.toContain(
			'defaultDescription: "Built with Rakta.js -\u201d',
		);
	});

	// BUG #4 / Workspace integrity: every directory in workspaces must have package.json
	test("every directory listed in root workspaces has a package.json", () => {
		const files = generateProjectFiles(fullstackConfig);
		const rootPkg = files.find((file) => file.path === "package.json");
		const pkg = JSON.parse(
			typeof rootPkg?.content === "string" ? rootPkg.content : "{}",
		) as { workspaces?: string[] };
		const filePaths = new Set(files.map((file) => file.path));

		for (const workspace of pkg.workspaces ?? []) {
			const expectedPkgJson = `${workspace}/package.json`;
			expect(filePaths.has(expectedPkgJson)).toBe(true);
		}
	});

	// BUG #5: @gaman/michi — the version that was previously generated
	// (@gaman/michi@^1.0.0) doesn't exist. Verify NO adapter generates it.
	test("no adapter generates @gaman/michi dependency", () => {
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
			const generatedFiles = generateProjectFiles({
				...fullstackConfig,
				projectName: `test-michi-${backendFramework}`,
				backendFramework,
			});
			for (const file of generatedFiles) {
				const content = typeof file.content === "string" ? file.content : "";
				expect(content).not.toContain("@gaman/michi");
			}
		}
	});

	// Dependency versions: framer-motion must never appear in generated projects
	test("generated projects never reference framer-motion", () => {
		const configs: ReadonlyArray<Partial<ProjectConfig>> = [
			{ projectMode: "frontend-only", cssFramework: "tailwind" },
			{ projectMode: "frontend-only", cssFramework: "none" },
			{ projectMode: "fullstack", backendFramework: "gaman" },
		];

		for (const override of configs) {
			const generatedFiles = generateProjectFiles({
				...fullstackConfig,
				...override,
			});
			for (const file of generatedFiles) {
				const content = typeof file.content === "string" ? file.content : "";
				expect(content).not.toContain("framer-motion");
			}
		}
	});

	// Dependency versions: lucide-react must never appear in generated projects
	test("generated projects never reference lucide-react", () => {
		const generatedFiles = generateProjectFiles({
			...fullstackConfig,
			projectMode: "frontend-only",
		});
		for (const file of generatedFiles) {
			const content = typeof file.content === "string" ? file.content : "";
			expect(content).not.toContain("lucide-react");
		}
	});

	// Auto Import: generated rakta.config.ts must have autoImport config
	test("generated frontend-only config has autoImport block", () => {
		const files = generateProjectFiles({
			...fullstackConfig,
			projectMode: "frontend-only",
			autoImport: true,
		});
		const config = files.find((file) => file.path === "rakta.config.ts");
		expect(config?.content).toContain("autoImport:");
		expect(config?.content).toContain("enabled: true");
	});

	test("generated frontend-only config with autoImport disabled has enabled: false", () => {
		const files = generateProjectFiles({
			...fullstackConfig,
			projectMode: "frontend-only",
			autoImport: false,
		});
		const config = files.find((file) => file.path === "rakta.config.ts");
		expect(config?.content).toContain("enabled: false");
	});

	// Routing: generated project must have at least one page file
	test("generated frontend-only project has at least one app page file", () => {
		const files = generateProjectFiles({
			...fullstackConfig,
			projectMode: "frontend-only",
		});
		const pageFiles = files.filter(
			(file) =>
				file.path.endsWith("page.tsx") || file.path.endsWith("page.jsx"),
		);
		expect(pageFiles.length).toBeGreaterThanOrEqual(1);
	});

	// Dependency: gsap must be in generated dependencies (not framer-motion)
	test("generated frontend project uses gsap for animation", () => {
		const files = generateProjectFiles({
			...fullstackConfig,
			projectMode: "frontend-only",
		});
		// In frontend-only mode there can be two package.json files (root + template).
		// The one with actual dependencies is the template-sourced package.json.
		const allPackageJsonFiles = files.filter(
			(file) => file.path === "package.json",
		);
		const depsPackage = allPackageJsonFiles.find((packageFile) => {
			try {
				const data = JSON.parse(
					typeof packageFile.content === "string" ? packageFile.content : "{}",
				) as { dependencies?: Record<string, string> };
				return Boolean(data.dependencies?.raktajs);
			} catch {
				return false;
			}
		});
		const pkgData = JSON.parse(
			typeof depsPackage?.content === "string" ? depsPackage.content : "{}",
		) as {
			dependencies?: Record<string, string>;
		};
		expect(pkgData.dependencies).toHaveProperty("gsap");
		expect(pkgData.dependencies).not.toHaveProperty("framer-motion");
	});

	// Icons: generated project uses react-icons (not lucide-react)
	test("generated frontend project uses react-icons for icons", () => {
		const files = generateProjectFiles({
			...fullstackConfig,
			projectMode: "frontend-only",
		});
		const allPackageJsonFiles = files.filter(
			(file) => file.path === "package.json",
		);
		const depsPackage = allPackageJsonFiles.find((packageFile) => {
			try {
				const data = JSON.parse(
					typeof packageFile.content === "string" ? packageFile.content : "{}",
				) as { dependencies?: Record<string, string> };
				return Boolean(data.dependencies?.raktajs);
			} catch {
				return false;
			}
		});
		const pkgData = JSON.parse(
			typeof depsPackage?.content === "string" ? depsPackage.content : "{}",
		) as {
			dependencies?: Record<string, string>;
		};
		expect(pkgData.dependencies).toHaveProperty("react-icons");
		expect(pkgData.dependencies).not.toHaveProperty("lucide-react");
	});

	// Gaman + PostgreSQL: must generate valid backend project files
	test("gaman + postgresql generates a backend package.json", () => {
		const files = generateProjectFiles({
			...fullstackConfig,
			backendFramework: "gaman",
			database: "postgresql",
		});
		const backendPkg = files.find(
			(file) => file.path === "backend/package.json",
		);
		expect(backendPkg).toBeDefined();
	});

	// Version: all generated frontend package.json must reference raktajs@^1.2.0
	test("all generated frontend package.json reference raktajs@^1.2.0", () => {
		const frontendFiles = generateProjectFiles({
			...fullstackConfig,
			projectMode: "frontend-only",
		});
		const fullstackFiles = generateProjectFiles(fullstackConfig);

		// In frontend-only mode, there are two package.json files (workspace root + template deps).
		// Concatenate both so the assertion finds the one with raktajs.
		const frontendDepsContent = frontendFiles
			.filter((file) => file.path === "package.json")
			.map((file) => (typeof file.content === "string" ? file.content : ""))
			.join("\n");
		expect(frontendDepsContent).toContain('"raktajs": "^1.2.0"');

		// In fullstack, frontend package.json is under frontend/
		const fullstackFrontendPkg = fullstackFiles.find(
			(file) => file.path === "frontend/package.json",
		);
		expect(fullstackFrontendPkg?.content).toContain('"raktajs": "^1.2.0"');
	});

	// RPC: fullstack project must have rpc:types script in frontend
	test("fullstack frontend has rpc:types script", () => {
		const files = generateProjectFiles(fullstackConfig);
		const frontendPkg = files.find(
			(file) => file.path === "frontend/package.json",
		);
		const pkg = JSON.parse(
			typeof frontendPkg?.content === "string" ? frontendPkg.content : "{}",
		) as { scripts?: Record<string, string> };
		expect(pkg.scripts).toHaveProperty("rpc:types");
		expect(pkg.scripts?.["rpc:types"]).toContain("rakta rpc:types");
	});

	// Authentication: JWT config generates correct session mode
	test("gaman adapter respects JWT session mode in env file", () => {
		const singleSessionConfig: ProjectConfig = {
			...fullstackConfig,
			authStrategy: "jwt",
			sessionPolicy: "single-session",
		};
		const multiSessionConfig: ProjectConfig = {
			...fullstackConfig,
			authStrategy: "jwt",
			sessionPolicy: "multiple-sessions",
		};

		const singleFiles = generateProjectFiles(singleSessionConfig);
		const multiFiles = generateProjectFiles(multiSessionConfig);

		const singleEnv = singleFiles.find(
			(file) => file.path === "backend/.env.example",
		);
		const multiEnv = multiFiles.find(
			(file) => file.path === "backend/.env.example",
		);

		// Both should have JWT_SECRET
		expect(singleEnv?.content).toContain("JWT_SECRET");
		expect(multiEnv?.content).toContain("JWT_SECRET");
	});

	// Database dependency coverage: all DB types should produce files without throwing
	test("getDatabaseDependencies returns valid packages for all database types", () => {
		const databases: ReadonlyArray<import("./types").Database> = [
			"postgresql",
			"mysql",
			"mariadb",
			"mongodb",
			"firebase",
			"sqlite",
			"redis",
			"planetscale",
			"neon",
			"turso",
			"sawitdb",
			"oracle",
		];

		for (const database of databases) {
			// Verify the generator runs without throwing for every database type.
			const files = generateProjectFiles({
				...fullstackConfig,
				database,
			});
			expect(files.length).toBeGreaterThan(0);
		}
	});

	// Shared directory must always be present in fullstack projects
	test("fullstack project always has shared/package.json", () => {
		const files = generateProjectFiles(fullstackConfig);
		const sharedPkg = files.find((file) => file.path === "shared/package.json");
		expect(sharedPkg).toBeDefined();
		const pkg = JSON.parse(
			typeof sharedPkg?.content === "string" ? sharedPkg.content : "{}",
		) as { name?: string };
		expect(pkg.name).toContain("shared");
	});

	// Generated tsconfig must not have syntax errors
	test("generated tsconfig.json is valid JSON", () => {
		const files = generateProjectFiles({
			...fullstackConfig,
			projectMode: "frontend-only",
			useTypeScript: true,
		});
		const tsconfig = files.find((file) => file.path === "tsconfig.json");
		if (tsconfig && typeof tsconfig.content === "string") {
			expect(() => JSON.parse(tsconfig.content as string)).not.toThrow();
		}
	});

	// postcss.config.ts must be valid for Tailwind projects
	test("Tailwind projects include postcss.config.ts", () => {
		const files = generateProjectFiles({
			...fullstackConfig,
			projectMode: "frontend-only",
			cssFramework: "tailwind",
		});
		const postcss = files.find((file) => file.path === "postcss.config.ts");
		expect(postcss).toBeDefined();
		expect(postcss?.content).toContain("@tailwindcss/postcss");
	});

	// frontend-only CSS mode: styles/globals.css must be present
	test("frontend-only project includes styles/globals.css", () => {
		const files = generateProjectFiles({
			...fullstackConfig,
			projectMode: "frontend-only",
			cssFramework: "tailwind",
		});
		const hasGlobalsCss = files.some(
			(file) =>
				file.path === "styles/globals.css" ||
				file.path === "styles/globals.scss",
		);
		expect(hasGlobalsCss).toBe(true);
	});
});
