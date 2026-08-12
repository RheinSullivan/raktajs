// biome-ignore-all lint: Rakta.js Core SPA Unit Tests

import { describe, expect, test } from "bun:test";
import { createSpaConfig, SpaErrorBoundary, useNavigation } from "./spa.js";

describe("Rakta SPA System", () => {
	test("createSpaConfig returns default scroll restoration configuration", () => {
		const config = createSpaConfig();
		expect(config.enableScrollRestoration).toBe(true);
		expect(Array.isArray(config.guards)).toBe(true);
	});

	test("useNavigation provides fallback safe defaults when unmounted", () => {
		const nav = useNavigation();
		expect(nav.state.currentPath).toBe("/");
		expect(nav.state.isLoading).toBe(false);
		expect(typeof nav.navigate).toBe("function");
	});

	test("SpaErrorBoundary is defined and exports class component", () => {
		expect(SpaErrorBoundary).toBeDefined();
		expect(typeof SpaErrorBoundary.getDerivedStateFromError).toBe("function");
	});
});
