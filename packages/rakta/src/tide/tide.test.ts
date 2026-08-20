import { describe, expect, test } from "bun:test";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createBunAdapter } from "./adapter";

describe("Rakta Tide Adapter Security & Static File Serving", () => {
	test("serves static files safely within search directory", async () => {
		const appDir = mkdtempSync(join(tmpdir(), "rakta-tide-app-"));
		const publicDir = mkdtempSync(join(tmpdir(), "rakta-tide-public-"));
		const outDir = mkdtempSync(join(tmpdir(), "rakta-tide-out-"));

		writeFileSync(join(publicDir, "robots.txt"), "User-agent: *\nDisallow:");

		const adapter = createBunAdapter(
			{
				kind: "bun",
				appName: "TestApp",
				appDir,
				publicDir,
				outDir,
				port: 3000,
				host: "localhost",
				seo: { defaultTitle: "Test", defaultDescription: "Test" },
			},
			{ defaultMode: "ssr", routes: {} },
		);

		const validReq = new Request("http://localhost:3000/robots.txt");
		const validRes = await adapter.handle(validReq);
		expect(validRes.status).toBe(200);
		expect(await validRes.text()).toContain("User-agent: *");
	});

	test("blocks path traversal attempts escaping public directory", async () => {
		const appDir = mkdtempSync(join(tmpdir(), "rakta-tide-app-"));
		const publicDir = mkdtempSync(join(tmpdir(), "rakta-tide-public-"));
		const outDir = mkdtempSync(join(tmpdir(), "rakta-tide-out-"));

		// Place a secret file outside publicDir
		const secretPath = join(publicDir, "..", "secret.env");
		writeFileSync(secretPath, "SECRET_TOKEN=supersecret123");

		const adapter = createBunAdapter(
			{
				kind: "bun",
				appName: "TestApp",
				appDir,
				publicDir,
				outDir,
				port: 3000,
				host: "localhost",
				seo: { defaultTitle: "Test", defaultDescription: "Test" },
			},
			{ defaultMode: "ssr", routes: {} },
		);

		const traversalReq = new Request("http://localhost:3000/../secret.env");
		const res = await adapter.handle(traversalReq);

		// Should NOT leak secret file content!
		const text = await res.text();
		expect(text).not.toContain("SECRET_TOKEN");
	});

	test("handles invalid API route module imports safely", async () => {
		const appDir = mkdtempSync(join(tmpdir(), "rakta-tide-app-"));
		const publicDir = mkdtempSync(join(tmpdir(), "rakta-tide-public-"));
		const outDir = mkdtempSync(join(tmpdir(), "rakta-tide-out-"));

		const adapter = createBunAdapter(
			{
				kind: "bun",
				appName: "TestApp",
				appDir,
				publicDir,
				outDir,
				port: 3000,
				host: "localhost",
				seo: { defaultTitle: "Test", defaultDescription: "Test" },
			},
			{ defaultMode: "csr", routes: {} },
		);

		const apiReq = new Request("http://localhost:3000/api/nonexistent");
		const res = await adapter.handle(apiReq);
		expect(res.headers.get("X-Powered-By")).toBe("Rakta.js");
	});
});
