/// <reference types="bun" />

import { describe, expect, test } from "bun:test";
import { createDeploymentAdapter, listDeploymentTargets } from "./index";

describe("Rakta deployment adapters", () => {
	test("generates first-class provider files", () => {
		const vercel = createDeploymentAdapter("vercel", {
			appName: "rakta-app",
			outDir: "dist",
		});
		const docker = createDeploymentAdapter("docker", {
			appName: "rakta-app",
			port: 4000,
		});
		const netlify = createDeploymentAdapter("netlify", {
			appName: "rakta-app",
			outDir: "dist",
		});
		const cloudflare = createDeploymentAdapter("cloudflare-workers", {
			appName: "rakta-app",
		});

		expect(vercel.files.map((file) => file.path)).toContain("vercel.json");
		expect(vercel.runtime).toBe("edge");
		const vercelJson = vercel.files.find(
			(f) => f.path === "vercel.json",
		)?.content;
		expect(vercelJson).toContain("[a-zA-Z0-9]");

		expect(docker.files.map((file) => file.path)).toContain("Dockerfile");
		expect(docker.environment.PORT).toBe("4000");

		expect(netlify.files.map((file) => file.path)).toContain("netlify.toml");
		expect(cloudflare.files.map((file) => file.path)).toContain(
			"wrangler.toml",
		);
	});

	test("lists supported stable targets", () => {
		expect(listDeploymentTargets()).toContain("cloudflare-workers");
		expect(listDeploymentTargets()).toContain("netlify");
		expect(listDeploymentTargets()).toContain("github-pages");
	});
});
