import { describe, expect, test } from "bun:test";
import {
	benchmark,
	createBenchmarkReport,
	createBuildCache,
	createBundleSizeReport,
	createIncrementalBuildPlan,
} from "./index";

describe("Rakta performance tools", () => {
	test("measures benchmark families and bundle size", async () => {
		let tick = 0;
		const sample = await benchmark(
			"startup",
			"boot",
			() => {},
			() => {
				tick += 5;
				return tick;
			},
		);

		expect(sample.duration).toBe(5);
		expect(createBenchmarkReport([sample]).average).toBe(5);
		expect(
			createBundleSizeReport([
				{ path: "a.js", bytes: 10 },
				{ path: "b.js", bytes: 15 },
			]).totalBytes,
		).toBe(25);
	});

	test("tracks persistent build cache freshness", () => {
		const cache = createBuildCache();
		cache.set({ key: "app", hash: "abc", createdAt: 1 });

		expect(cache.isFresh("app", "abc")).toBe(true);
		expect(cache.isFresh("app", "def")).toBe(false);
		expect(
			createIncrementalBuildPlan([{ key: "app", hash: "abc" }], cache).reused,
		).toEqual(["app"]);
	});
});
