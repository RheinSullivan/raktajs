/// <reference types="bun" />

import { describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { matchRoute, scanRoutes } from "./index";

function createRouteFile(appDir: string, routePath: string): void {
	const filePath = join(appDir, routePath);
	mkdirSync(dirname(filePath), { recursive: true });
	writeFileSync(filePath, "export default function Page() { return null; }\n");
}

describe("Rakta router dynamic segments", () => {
	test("supports Next.js-style dynamic, catch-all, and route groups", () => {
		const appDir = mkdtempSync(join(tmpdir(), "rakta-routes-"));
		createRouteFile(appDir, "[auth]/page.tsx");
		createRouteFile(appDir, "users/[id]/page.tsx");
		createRouteFile(appDir, "docs/[...signIn]/page.tsx");
		createRouteFile(appDir, "(marketing)/about/page.tsx");

		const routes = scanRoutes({ appDir });

		expect(routes.some((route) => route.urlPattern === "/:auth")).toBe(true);
		expect(routes.some((route) => route.urlPattern === "/users/:id")).toBe(
			true,
		);
		expect(routes.some((route) => route.urlPattern === "/docs/:signIn*")).toBe(
			true,
		);
		expect(routes.some((route) => route.urlPattern === "/about")).toBe(true);

		expect(matchRoute("/login", routes)?.params.auth).toBe("login");
		expect(matchRoute("/users/42", routes)?.params.id).toBe("42");
		expect(matchRoute("/docs/a/b/c", routes)?.params.signIn).toEqual([
			"a",
			"b",
			"c",
		]);
		expect(matchRoute("/about", routes)?.entry.urlPattern).toBe("/about");
	});
});
