import { describe, expect, test } from "bun:test";
import {
	createOfficialPlugins,
	createPluginRegistry,
	createPluginTemplate,
} from "./index";

describe("Rakta plugin API", () => {
	test("registers official manifests and resolves capabilities", () => {
		const registry = createPluginRegistry(createOfficialPlugins());

		expect(
			registry.withCapability("deployment").map((plugin) => plugin.name),
		).toContain("@rakta/vercel");
		expect(registry.withCapability("mdx")[0]?.name).toBe("@rakta/mdx");
	});

	test("creates community plugin templates", () => {
		const template = createPluginTemplate({
			name: "@acme/rakta-plugin",
			version: "0.1.0",
			capabilities: ["build"],
		});

		expect(template.files["rakta.plugin.json"]).toContain("@acme/rakta-plugin");
		expect(template.files["src/index.ts"]).toContain("RaktaPlugin");
	});
});
