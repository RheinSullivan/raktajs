import { describe, expect, test } from "bun:test";
import { createLayoutManifest, matchLayouts } from "./index";

describe("Rakta layout manifest", () => {
	test("supports root, nested, special, groups, and parallel layouts", () => {
		const manifest = createLayoutManifest([
			{ path: "app/layout.tsx" },
			{ path: "app/dashboard/layout.tsx" },
			{ path: "app/dashboard/loading.tsx" },
			{ path: "app/dashboard/error.tsx" },
			{ path: "app/(admin)/users/layout.tsx" },
			{ path: "app/dashboard/@analytics/layout.tsx" },
		]);

		expect(manifest.root?.routePattern).toBe("/");
		expect(manifest.entries.map((entry) => entry.kind)).toContain("loading");
		expect(manifest.entries.map((entry) => entry.kind)).toContain("error");
		expect(manifest.entries.map((entry) => entry.kind)).toContain("group");
		expect(manifest.entries.map((entry) => entry.kind)).toContain("parallel");
		expect(matchLayouts(manifest, "/dashboard/settings")).toHaveLength(5);
	});
});
