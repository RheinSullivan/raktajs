import { describe, expect, test } from "bun:test";
import { parseDependentsCount, parseRuntimeDependencies } from "./packageStats";

describe("package statistics parsing", () => {
	test("counts runtime dependencies from the latest npm version only", () => {
		const parsed = parseRuntimeDependencies({
			"dist-tags": { latest: "1.1.6" },
			time: { "1.1.6": "2026-08-13T00:00:00.000Z" },
			versions: {
				"1.1.4": {
					dependencies: { oldRuntime: "^1.0.0" },
					version: "1.1.4",
				},
				"1.1.6": {
					dependencies: {
						gsap: "^3.12.7",
						"react-icons": "^5.7.0",
					},
					devDependencies: {
						typescript: "^6.0.3",
					},
					peerDependencies: {
						react: ">=19.0.0",
						"react-dom": ">=19.0.0",
					},
					version: "1.1.6",
				},
			},
		});

		expect(parsed.dependencies).toBe(4);
		expect(parsed.dependencyNames).toEqual([
			"gsap",
			"react",
			"react-dom",
			"react-icons",
		]);
		expect(parsed.version).toBe("1.1.6");
		expect(parsed.updatedAt).toBe("2026-08-13T00:00:00.000Z");
	});

	test("parses a reliable dependent count when an API provides one", () => {
		expect(parseDependentsCount({ dependents: 7 })).toBe(7);
		expect(parseDependentsCount({ dependentCount: 3 })).toBe(3);
		expect(parseDependentsCount({ dependentsCount: 2 })).toBe(2);
		expect(parseDependentsCount({ dependents: 0 })).toBeNull();
	});

	test("parses nested npm search-style dependent count when present", () => {
		const parsed = parseDependentsCount({
			objects: [
				{
					package: { name: "other" },
				},
				{
					collected: { metadata: { dependentsCount: 5 } },
					package: { name: "raktajs" },
				},
			],
		});

		expect(parsed).toBe(5);
	});

	test("returns null instead of fabricating dependents", () => {
		expect(
			parseDependentsCount({
				objects: [{ package: { name: "raktajs" }, score: { final: 0.1 } }],
			}),
		).toBeNull();
		expect(parseDependentsCount({ objects: [] })).toBeNull();
	});
});
