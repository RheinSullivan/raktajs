import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

interface WappalyzerTechnology {
	readonly cats?: readonly number[];
	readonly dom?: Record<string, unknown>;
	readonly headers?: Record<string, string>;
	readonly html?: readonly string[];
	readonly implies?: unknown;
	readonly js?: Record<string, string>;
	readonly meta?: Record<string, string>;
	readonly oss?: boolean;
	readonly scriptSrc?: unknown;
	readonly website?: string;
}

function readWappalyzerDefinition(): WappalyzerTechnology {
	const filePath = join(
		import.meta.dir,
		"..",
		"..",
		"..",
		"public",
		"wappalyzer.json",
	);
	const json = JSON.parse(readFileSync(filePath, "utf8")) as Record<
		string,
		WappalyzerTechnology
	>;

	const definition = json["Rakta.js"];
	if (definition === undefined) {
		throw new Error("Missing Rakta.js Wappalyzer definition.");
	}

	return definition;
}

describe("Wappalyzer fingerprint definition", () => {
	test("is valid JSON with strong Rakta.js fingerprints", () => {
		const definition = readWappalyzerDefinition();

		expect(definition.website).toBe("https://raktajs.dev");
		expect(definition.oss).toBe(true);
		expect(definition.cats).toContain(12);
		expect(definition.meta?.generator).toBe("^Rakta\\.js$");
		expect(definition.headers?.["x-rakta-version"]).toContain("version");
		expect(definition.headers?.["x-generator"]).toContain("version");
		expect(definition.dom?.["#rakta-root[data-rakta]"]).toBeDefined();
		expect(definition.dom?.["html[data-framework='raktajs']"]).toBeDefined();
		expect(definition.js?.["window.__RAKTA__"]).toBe("");
		expect(definition.js?.["window.__RAKTA__.version"]).toContain("version");
	});

	test("avoids weak fingerprints and dependency assumptions", () => {
		const definition = readWappalyzerDefinition();
		const htmlPatterns = definition.html ?? [];

		expect(definition.scriptSrc).toBeUndefined();
		expect(definition.implies).toBeUndefined();
		expect(htmlPatterns).not.toContain("rakta");
		expect(htmlPatterns).not.toContain("Rakta");
	});
});
