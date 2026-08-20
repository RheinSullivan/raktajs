import { describe, expect, test } from "bun:test";
import { mergeMetadata, resolveRobotsContent, resolveTitle } from "./metadata";

describe("Rakta SEO Metadata Engine", () => {
	test("resolves title object with fallback titleTemplate", () => {
		const title = resolveTitle({
			title: { default: "Dashboard" },
			titleTemplate: "%s | Rakta.js",
		});
		expect(title).toBe("Dashboard | Rakta.js");
	});

	test("resolves absolute title without applying template", () => {
		const title = resolveTitle({
			title: { default: "Dashboard", absolute: "Rakta Dashboard Overview" },
			titleTemplate: "%s | Rakta.js",
		});
		expect(title).toBe("Rakta Dashboard Overview");
	});

	test("resolves string title with titleTemplate", () => {
		const title = resolveTitle({
			title: "Settings",
			titleTemplate: "%s - Rakta",
		});
		expect(title).toBe("Settings - Rakta");
	});

	test("formats robots object into directives string", () => {
		const robots = resolveRobotsContent({
			index: false,
			follow: true,
			nocache: true,
		});
		expect(robots).toBe("noindex, follow, nocache");
	});

	test("merges base and page override metadata", () => {
		const base = {
			title: "Base",
			openGraph: { siteName: "Rakta App" },
		};
		const override = {
			title: "Override Page",
			openGraph: { title: "Override Page" },
		};
		const merged = mergeMetadata(base, override);
		expect(merged.title).toBe("Override Page");
		expect(merged.openGraph?.siteName).toBe("Rakta App");
		expect(merged.openGraph?.title).toBe("Override Page");
	});
});
