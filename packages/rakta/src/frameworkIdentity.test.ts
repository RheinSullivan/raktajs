import { describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
	createRaktaDetectionHeaders,
	RAKTA_NAME,
	RAKTA_VERSION,
} from "./frameworkIdentity";
import { render } from "./render/renderer";
import { createBunAdapter } from "./tide/adapter";

function readPackageVersion(): string {
	const packagePath = join(import.meta.dir, "..", "package.json");
	const packageJson = JSON.parse(readFileSync(packagePath, "utf8")) as {
		version: string;
	};

	return packageJson.version;
}

describe("Rakta framework identity", () => {
	test("keeps the framework version aligned with package.json", () => {
		expect(RAKTA_VERSION).toBe(readPackageVersion());
	});

	test("renders stable public HTML fingerprints", async () => {
		const result = await render(
			{
				routePath: "/",
				mode: "csr",
				params: {},
				searchParams: {},
				requestHeaders: {},
				timestampMs: Date.now(),
			},
			{
				appName: "Fingerprint Test",
				cssPath: "/app.css",
				description: "Test page",
				lang: "en",
				scriptPath: "/app.js",
				title: "Fingerprint Test",
			},
		);

		expect(result.kind).toBe("success");
		if (result.kind !== "success") return;

		expect(result.html).toContain(
			'<meta name="generator" content="Rakta.js" />',
		);
		expect(result.html).toContain('data-framework="raktajs"');
		expect(result.html).toContain('id="rakta-root" data-rakta="true"');
		expect(result.html).toContain("window.__RAKTA__");
		expect(result.html).toContain(`"version":"${RAKTA_VERSION}"`);
		expect(result.html).not.toContain("env:");
		expect(result.responseHeaders["X-Rakta-Version"]).toBe(RAKTA_VERSION);
	});

	test("emits detection headers from the Bun adapter", async () => {
		const tempDir = mkdtempSync(join(tmpdir(), "rakta-identity-"));

		try {
			const appDir = join(tempDir, "app");
			const publicDir = join(tempDir, "public");
			const outDir = join(tempDir, "dist");
			mkdirSync(appDir, { recursive: true });
			mkdirSync(publicDir, { recursive: true });
			mkdirSync(outDir, { recursive: true });

			const adapter = createBunAdapter(
				{
					appDir,
					appName: "Identity Test",
					host: "127.0.0.1",
					kind: "bun",
					outDir,
					port: 0,
					publicDir,
					seo: {
						defaultDescription: "Identity test",
						defaultTitle: "Identity Test",
					},
				},
				{ defaultMode: "csr", routes: {} },
			);
			const response = await adapter.handle(new Request("http://localhost/"));

			expect(response.headers.get("x-rakta-version")).toBe(RAKTA_VERSION);
			expect(response.headers.get("x-generator")).toBe(
				`${RAKTA_NAME}/${RAKTA_VERSION}`,
			);
		} finally {
			rmSync(tempDir, { force: true, recursive: true });
		}
	});

	test("does not match non-Rakta pages with a plain text mention", () => {
		const html =
			"<html><head><title>Rakta word only</title></head><body>Rakta.js article</body></html>";

		expect(html).not.toContain('data-framework="raktajs"');
		expect(html).not.toContain('id="rakta-root" data-rakta');
		expect(html).not.toContain("window.__RAKTA__");
		expect(createRaktaDetectionHeaders("bun")["X-Rakta-Version"]).toBe(
			RAKTA_VERSION,
		);
	});
});
