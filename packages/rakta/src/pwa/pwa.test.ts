import { describe, expect, test } from "bun:test";
import {
	createManifestHandler,
	generateManifest,
	generateManifestJson,
} from "./manifest";
import { generateServiceWorkerScript } from "./serviceWorker";

describe("Rakta PWA System", () => {
	test("generates valid web app manifest object and json string", () => {
		const manifest = generateManifest({
			name: "Rakta App",
			shortName: "Rakta",
			description: "PWA fullstack application",
			icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }],
		});

		expect(manifest.name).toBe("Rakta App");
		expect(manifest.short_name).toBe("Rakta");
		expect(manifest.icons).toHaveLength(1);

		const json = generateManifestJson({
			name: "Rakta App",
			shortName: "Rakta",
		});
		expect(json).toContain('"name": "Rakta App"');
	});

	test("creates tide manifest request handler", async () => {
		const handler = createManifestHandler({
			name: "Rakta App",
			shortName: "Rakta",
		});

		const res = handler();
		expect(res.status).toBe(200);
		expect(res.headers.get("Content-Type")).toContain(
			"application/manifest+json",
		);
	});

	test("generates service worker script", () => {
		const swScript = generateServiceWorkerScript({
			cacheName: "rakta-cache-v1",
			cacheVersion: "1.0.0",
			precacheUrls: ["/", "/app.js", "/app.css"],
			offlineFallbackUrl: "/offline.html",
		});

		expect(swScript).toContain("rakta-cache-v1");
		expect(swScript).toContain("/offline.html");
		expect(swScript).toContain("caches.open");
	});
});
