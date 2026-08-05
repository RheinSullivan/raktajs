import { describe, expect, test } from "bun:test";
import {
	analyzeBundle,
	analyzeRoutes,
	createDependencyGraph,
	createErrorOverlay,
	createProfilerReport,
	inspectAutoImports,
} from "./index";

describe("Rakta DX analyzer", () => {
	test("builds dependency, route, and bundle reports", () => {
		const graph = createDependencyGraph([
			{
				id: "app/page.tsx",
				imports: ["lib/api.ts"],
				routePattern: "/",
				size: 40,
			},
			{ id: "lib/api.ts", imports: ["lib/http.ts"], size: 20 },
			{ id: "lib/http.ts", size: 10 },
		]);

		expect(graph.edges).toHaveLength(2);
		expect(analyzeRoutes(graph)[0]?.dependencies).toEqual([
			"lib/api.ts",
			"lib/http.ts",
		]);
		expect(analyzeBundle(graph.modules, 1).largestModules[0]?.id).toBe(
			"app/page.tsx",
		);
	});

	test("reports auto imports, overlays, and profiler marks", () => {
		expect(
			inspectAutoImports([
				{ symbol: "zeta", source: "rakta", usedBy: [] },
				{ symbol: "alpha", source: "rakta", usedBy: ["app/page.tsx"] },
			])[0]?.symbol,
		).toBe("alpha");
		expect(createErrorOverlay(new Error("broken")).message).toBe("broken");
		expect(
			createProfilerReport([
				{ name: "render", startedAt: 2, endedAt: 4 },
				{ name: "load", startedAt: 1, endedAt: 2 },
			])[0]?.name,
		).toBe("load");
	});
});
