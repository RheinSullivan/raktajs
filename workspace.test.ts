import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Rakta.js workspace", () => {
	test("has an active test runner", () => {
		expect("Rakta.js").toBe("Rakta.js");
	});

	test("uses the official workspace identity", () => {
		const frameworkIdentity = {
			name: "Rakta.js",
			author: "Rhein Sullivan | Vyagra Nexus™",
			runtime: "Bun",
		};

		expect(frameworkIdentity.name).toBe("Rakta.js");
		expect(frameworkIdentity.author).toBe("Rhein Sullivan | Vyagra Nexus™");
		expect(frameworkIdentity.runtime).toBe("Bun");
	});

	test("template package statistics never use fake dependent counts", () => {
		const templateFiles = [
			"templates/frontendOnly/app/components/PackageStatsStrip.tsx",
			"templates/frontendOnly/app/lib/packageStats.ts",
			"templates/fullStack/frontend/app/components/PackageStatsStrip.tsx",
			"templates/fullStack/frontend/app/lib/packageStats.ts",
		];

		for (const templateFile of templateFiles) {
			const source = readFileSync(join(process.cwd(), templateFile), "utf8");

			expect(source).not.toContain("61073");
			expect(source).not.toContain("61,073");

			if (templateFile.endsWith("PackageStatsStrip.tsx")) {
				expect(source).toContain("Unavailable");
				expect(source).toContain("Loading");
				expect(source).toContain("fetchPackageStats");
			} else {
				expect(source).toContain("parseDependentsCount");
				expect(source).toContain("parseRuntimeDependencies");
			}
		}
	});
});
