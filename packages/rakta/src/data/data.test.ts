import { describe, expect, test } from "bun:test";
import {
	createDataCache,
	defineRouteDataStrategy,
	isIncrementalRoute,
	shouldPrefetchRoute,
	shouldStreamRoute,
} from "./index";

describe("Rakta data layer", () => {
	test("caches values and revalidates by tag", async () => {
		const cache = createDataCache(() => 1000);
		let calls = 0;

		const first = await cache.cache(
			"posts",
			() => {
				calls += 1;
				return ["hello"];
			},
			{ tags: ["cms"] },
		);
		const second = await cache.cache("posts", () => ["miss"]);

		expect(first).toEqual(["hello"]);
		expect(second).toEqual(["hello"]);
		expect(calls).toBe(1);
		expect(cache.revalidate("cms")).toBe(1);
	});

	test("resolves route data capabilities", () => {
		const strategy = defineRouteDataStrategy({
			routePattern: "/dashboard",
			runtime: "server",
			prerender: false,
			stream: true,
			prefetch: true,
			revalidate: 60,
		});

		expect(shouldStreamRoute(strategy)).toBe(true);
		expect(shouldPrefetchRoute(strategy)).toBe(true);
		expect(isIncrementalRoute(strategy)).toBe(true);
	});
});
