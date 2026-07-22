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

		expect(vercel.files.map((file) => file.path)).toContain("vercel.json");
		expect(vercel.runtime).toBe("edge");
		expect(docker.files.map((file) => file.path)).toContain("Dockerfile");
		expect(docker.environment.PORT).toBe("4000");
	});

	test("lists supported stable targets", () => {
		expect(listDeploymentTargets()).toContain("cloudflare-workers");
		expect(listDeploymentTargets()).toContain("netlify");
		expect(listDeploymentTargets()).toContain("github-pages");
	});
});
