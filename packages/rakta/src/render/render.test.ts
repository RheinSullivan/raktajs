import { describe, expect, test } from "bun:test";
import { getModeDescriptor, isRoadmapMode, resolveRouteMode } from "./modes";
import { render, renderNotFound, renderServerError } from "./renderer";
import type { RenderConfig, RenderContext, RenderMode } from "./types";

const rendererOpts = {
	appName: "Rakta Test App",
	scriptPath: "/app.js",
	cssPath: "/app.css",
	lang: "en",
};

function createTestContext(routePath: string, mode: RenderMode): RenderContext {
	return {
		routePath,
		mode,
		params: {},
		searchParams: {},
		requestHeaders: {},
		timestampMs: Date.now(),
	};
}

describe("Rakta Render Engine", () => {
	// -------------- resolveRouteMode --------------

	test("resolves default mode when no route matches", () => {
		const config: RenderConfig = {
			defaultMode: "csr",
			routes: { "/dashboard": "csr" },
		};
		const resolved = resolveRouteMode("/unknown", config);
		expect(resolved.mode).toBe("csr");
		expect(resolved.source).toBe("default");
	});

	test("resolves exact route override", () => {
		const config: RenderConfig = {
			defaultMode: "csr",
			routes: { "/": "ssg", "/dashboard": "csr" },
		};
		const resolved = resolveRouteMode("/", config);
		expect(resolved.mode).toBe("ssg");
		expect(resolved.source).toBe("route-override");
	});

	test("resolves dynamic segment pattern", () => {
		const config: RenderConfig = {
			defaultMode: "csr",
			routes: { "/blog/:slug": "csg" },
		};
		const resolved = resolveRouteMode("/blog/hello-world", config);
		expect(resolved.mode).toBe("csg");
	});

	test("literal route beats dynamic when both match", () => {
		// /users/profile (specificity 4) must beat /users/:id (specificity 3)
		// even though /users/:id is longer in string length.
		const config: RenderConfig = {
			defaultMode: "csr",
			routes: {
				"/users/:id": "csr",
				"/users/profile": "ssr",
			},
		};
		const resolved = resolveRouteMode("/users/profile", config);
		expect(resolved.mode).toBe("ssr");
	});

	test("deeper route beats shallower when more segments", () => {
		const config: RenderConfig = {
			defaultMode: "csr",
			routes: {
				"/blog": "ssg",
				"/blog/:slug": "csg",
			},
		};
		const resolvedPost = resolveRouteMode("/blog/my-post", config);
		expect(resolvedPost.mode).toBe("csg");

		const resolvedIndex = resolveRouteMode("/blog", config);
		expect(resolvedIndex.mode).toBe("ssg");
	});

	// -------------- isRoadmapMode, getModeDescriptor --------------

	test("isRoadmapMode correctly identifies roadmap modes", () => {
		expect(isRoadmapMode("ssr")).toBe(true);
		expect(isRoadmapMode("ssg")).toBe(true);
		expect(isRoadmapMode("csg")).toBe(true);
		expect(isRoadmapMode("csr")).toBe(false);
		expect(isRoadmapMode("hybrid")).toBe(false);
	});

	test("getModeDescriptor returns correct labels", () => {
		expect(getModeDescriptor("csr").shortLabel).toBe("CSR");
		expect(getModeDescriptor("hybrid").shortLabel).toBe("Hybrid");
		expect(getModeDescriptor("ssr").roadmap).toBe(true);
	});

	// -------------- render() --------------

	test("render csr returns success with html shell", async () => {
		const result = await render(createTestContext("/", "csr"), rendererOpts);
		expect(result.kind).toBe("success");
		if (result.kind === "success") {
			expect(result.html).toContain("<!DOCTYPE html>");
			expect(result.html).toContain("rakta-root");
			expect(result.mode).toBe("csr");
			expect(result.httpStatus).toBe(200);
			expect(result.responseHeaders["Content-Type"]).toContain("text/html");
		}
	});

	test("render spa returns success", async () => {
		const result = await render(createTestContext("/", "spa"), rendererOpts);
		expect(result.kind).toBe("success");
		if (result.kind === "success") {
			expect(result.mode).toBe("spa");
		}
	});

	test("render hybrid returns success with csr fallback", async () => {
		const result = await render(createTestContext("/", "hybrid"), rendererOpts);
		expect(result.kind).toBe("success");
		if (result.kind === "success") {
			expect(result.mode).toBe("csr");
		}
	});

	test("render ssr falls back to csr with console warning (roadmap)", async () => {
		const result = await render(
			createTestContext("/page", "ssr"),
			rendererOpts,
		);
		expect(result.kind).toBe("success");
		if (result.kind === "success") {
			expect(result.mode).toBe("csr");
		}
	});

	test("renderNotFound returns 404 with html shell", () => {
		const result = renderNotFound(rendererOpts);
		expect(result.kind).toBe("success");
		expect(result.httpStatus).toBe(404);
		expect(result.html).toContain("rakta-root");
	});

	test("renderServerError returns 500 failure result", () => {
		const result = renderServerError("Unhandled exception", "csr");
		expect(result.kind).toBe("failure");
		expect(result.httpStatus).toBe(500);
		expect(result.reason).toBe("Unhandled exception");
	});

	test("render html shell includes preload and modulepreload hints", async () => {
		const result = await render(createTestContext("/", "csr"), rendererOpts);
		if (result.kind === "success") {
			expect(result.html).toContain('rel="preload"');
			expect(result.html).toContain('rel="modulepreload"');
		}
	});
});
