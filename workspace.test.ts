import { describe, expect, test } from "bun:test";

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
});
