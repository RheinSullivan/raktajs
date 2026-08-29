/// <reference types="bun" />

import { describe, expect, test } from "bun:test";
import { createDeploymentAdapter, listDeploymentTargets } from "./index";

describe("Rakta deployment adapters", () => {
	test("Vercel CSR adapter emits Build Output API v3 config", () => {
		const adapter = createDeploymentAdapter("vercel", {
			appName: "rakta-app",
			outDir: "dist",
			rendering: "csr",
		});

		// Must use the Build Output API v3 path, not vercel.json
		const configPath = adapter.files.find(
			(f) => f.path === ".vercel/output/config.json",
		);
		expect(configPath).toBeDefined();

		const configContent = JSON.parse(configPath?.content ?? "{}") as {
			version: number;
			routes?: unknown[];
		};
		expect(configContent.version).toBe(3);
		expect(Array.isArray(configContent.routes)).toBe(true);

		// Must have a project.json
		expect(adapter.files.map((f) => f.path)).toContain(".vercel/project.json");

		// CSR adapter uses static runtime
		expect(adapter.runtime).toBe("static");
		expect(adapter.outputDirectory).toBe(".vercel/output");
	});

	test("Vercel SSR adapter emits serverless function config", () => {
		const adapter = createDeploymentAdapter("vercel", {
			appName: "rakta-app",
			outDir: "dist",
			rendering: "ssr",
		});

		const vcConfig = adapter.files.find(
			(f) => f.path === ".vercel/output/functions/index.func/.vc-config.json",
		);
		expect(vcConfig).toBeDefined();

		const parsed = JSON.parse(vcConfig?.content ?? "{}") as {
			runtime: string;
		};
		expect(parsed.runtime).toContain("nodejs");

		// Must have function wrapper
		const funcIndex = adapter.files.find(
			(f) => f.path === ".vercel/output/functions/index.func/index.js",
		);
		expect(funcIndex).toBeDefined();

		// SSR adapter uses edge runtime
		expect(adapter.runtime).toBe("edge");
	});

	test("Netlify CSR adapter emits correct config", () => {
		const adapter = createDeploymentAdapter("netlify", {
			appName: "rakta-app",
			outDir: "dist",
			rendering: "csr",
		});

		const toml = adapter.files.find((f) => f.path === "netlify.toml");
		expect(toml).toBeDefined();
		expect(toml?.content).toContain("bun run build");
		expect(toml?.content).toContain('to = "/index.html"');

		// Must have _redirects for SPA fallback
		const redirects = adapter.files.find((f) => f.path.endsWith("_redirects"));
		expect(redirects).toBeDefined();
		expect(redirects?.content).toContain("/index.html");

		expect(adapter.runtime).toBe("static");
	});

	test("Netlify SSR adapter emits function wrapper", () => {
		const adapter = createDeploymentAdapter("netlify", {
			appName: "rakta-app",
			outDir: "dist",
			rendering: "ssr",
		});

		const toml = adapter.files.find((f) => f.path === "netlify.toml");
		expect(toml?.content).toContain("functions");

		const serverFunc = adapter.files.find((f) =>
			f.path.includes("netlify-functions"),
		);
		expect(serverFunc).toBeDefined();
		expect(serverFunc?.content).toContain("createRaktaRequestHandler");
	});

	test("Cloudflare Pages adapter emits static config", () => {
		const adapter = createDeploymentAdapter("cloudflare-pages", {
			appName: "rakta-app",
			outDir: "dist",
			rendering: "csr",
		});

		const headers = adapter.files.find((f) => f.path.endsWith("_headers"));
		expect(headers).toBeDefined();
		expect(headers?.content).toContain("immutable");

		const redirects = adapter.files.find((f) => f.path.endsWith("_redirects"));
		expect(redirects?.content).toContain("/index.html");

		expect(adapter.runtime).toBe("static");
	});

	test("Cloudflare Workers adapter emits Worker and wrangler config", () => {
		const adapter = createDeploymentAdapter("cloudflare-workers", {
			appName: "rakta-app",
			outDir: "dist",
			rendering: "ssr",
		});

		expect(adapter.files.map((f) => f.path)).toContain("wrangler.toml");

		const worker = adapter.files.find((f) => f.path.endsWith("worker.js"));
		expect(worker).toBeDefined();
		expect(worker?.content).toContain("export default");
		expect(worker?.content).toContain("fetch(request");

		expect(adapter.runtime).toBe("edge");
	});

	test("Docker adapter emits Dockerfile and .dockerignore", () => {
		const adapter = createDeploymentAdapter("docker", {
			appName: "rakta-app",
			port: 4000,
			outDir: "dist",
			rendering: "ssr",
		});

		expect(adapter.files.map((f) => f.path)).toContain("Dockerfile");
		expect(adapter.files.map((f) => f.path)).toContain(".dockerignore");

		const dockerfile = adapter.files.find((f) => f.path === "Dockerfile");
		expect(dockerfile?.content).toContain("FROM oven/bun");
		expect(dockerfile?.content).toContain("bun run build");
		expect(dockerfile?.content).toContain("EXPOSE 4000");

		expect(adapter.environment.PORT).toBe("4000");
	});

	test("Railway adapter is generic server (no platform files)", () => {
		const adapter = createDeploymentAdapter("railway", {
			appName: "rakta-app",
			outDir: "dist",
			rendering: "ssr",
		});

		expect(adapter.files.length).toBe(0);
		expect(adapter.runtime).toBe("bun");
		expect(adapter.startCommand).toContain("dist/server/index.js");
	});

	test("Render adapter is generic server", () => {
		const adapter = createDeploymentAdapter("render", {
			appName: "rakta-app",
			outDir: "dist",
			rendering: "ssr",
		});

		expect(adapter.files.length).toBe(0);
		expect(adapter.startCommand).toContain("dist/server/index.js");
	});

	test("Fly.io adapter is generic server", () => {
		const adapter = createDeploymentAdapter("fly", {
			appName: "rakta-app",
			outDir: "dist",
			rendering: "ssr",
		});

		expect(adapter.files.length).toBe(0);
		expect(adapter.startCommand).toContain("dist/server/index.js");
	});

	test("GitHub Pages adapter emits .nojekyll", () => {
		const adapter = createDeploymentAdapter("github-pages", {
			appName: "rakta-app",
			outDir: "dist",
			rendering: "ssg",
		});

		const nojekyll = adapter.files.find((f) => f.path.endsWith(".nojekyll"));
		expect(nojekyll).toBeDefined();
		expect(adapter.runtime).toBe("static");
	});

	test("Static adapter has no extra files", () => {
		const adapter = createDeploymentAdapter("static", {
			appName: "rakta-app",
			outDir: "dist",
			rendering: "ssg",
		});

		expect(adapter.runtime).toBe("static");
	});

	test("AWS Lambda adapter emits handler file", () => {
		const adapter = createDeploymentAdapter("aws-lambda", {
			appName: "rakta-app",
			outDir: "dist",
			rendering: "ssr",
		});

		const handler = adapter.files.find((f) =>
			f.path.includes("lambda-handler"),
		);
		expect(handler).toBeDefined();
		expect(handler?.content).toContain("createRaktaRequestHandler");
	});

	test("listDeploymentTargets returns all targets", () => {
		const targets = listDeploymentTargets();
		expect(targets).toContain("vercel");
		expect(targets).toContain("netlify");
		expect(targets).toContain("cloudflare-workers");
		expect(targets).toContain("cloudflare-pages");
		expect(targets).toContain("railway");
		expect(targets).toContain("render");
		expect(targets).toContain("fly");
		expect(targets).toContain("docker");
		expect(targets).toContain("github-pages");
		expect(targets).toContain("static");
		expect(targets).toContain("aws-lambda");
	});

	test("Vercel adapter config.json routes include SPA fallback for CSR", () => {
		const adapter = createDeploymentAdapter("vercel", {
			appName: "rakta-app",
			outDir: "dist",
			rendering: "csr",
		});

		const configFile = adapter.files.find(
			(f) => f.path === ".vercel/output/config.json",
		);
		const config = JSON.parse(configFile?.content ?? "{}") as {
			routes: Array<{ src?: string; dest?: string; handle?: string }>;
		};

		// Must have a catch-all fallback to index.html
		const fallback = config.routes.find(
			(r) => r.src === "/(.*)" && r.dest === "/index.html",
		);
		expect(fallback).toBeDefined();
	});

	test("Netlify CSR adapter config always references /index.html not /", () => {
		const adapter = createDeploymentAdapter("netlify", {
			appName: "rakta-app",
			outDir: "dist",
			rendering: "csr",
		});

		const toml = adapter.files.find((f) => f.path === "netlify.toml");
		// The old adapter had rewrite to "/" - this caused 404.
		// Now it must rewrite to "/index.html"
		expect(toml?.content).not.toContain('to = "/"');
		expect(toml?.content).toContain('to = "/index.html"');
	});

	test("Vercel deployment artifact structure prevents 404 NOT_FOUND on GET /", () => {
		const adapter = createDeploymentAdapter("vercel", {
			appName: "rakta-app",
			outDir: "dist",
			rendering: "csr",
		});

		const configFile = adapter.files.find(
			(f) => f.path === ".vercel/output/config.json",
		);
		expect(configFile).toBeDefined();
		const config = JSON.parse(configFile?.content ?? "{}") as {
			version: number;
			routes: Array<{ src?: string; dest?: string; handle?: string }>;
		};

		expect(config.version).toBe(3);
		// Must have handle: filesystem and destination to /index.html
		const hasFilesystem = config.routes.some((r) => r.handle === "filesystem");
		const hasIndexFallback = config.routes.some(
			(r) => r.src === "/(.*)" && r.dest === "/index.html",
		);
		expect(hasFilesystem).toBe(true);
		expect(hasIndexFallback).toBe(true);
	});
});
