/// <reference types="bun" />

import { describe, expect, test } from "bun:test";
import {
	abort,
	after,
	before,
	createMiddlewareStack,
	redirect,
	rewrite,
} from "./index";

describe("Rakta middleware", () => {
	test("runs before and after middleware in order", async () => {
		const events: string[] = [];
		const stack = createMiddlewareStack([
			before((context) => {
				context.state.set("requestId", "rakta-1");
				events.push("before");
			}),
			after((context, response) => {
				events.push(String(context.state.get("requestId")));
				const headers = new Headers(response.headers);
				headers.set("x-after", "done");
				return new Response(response.body, {
					status: response.status,
					headers,
				});
			}),
		]);

		const response = await stack.handle(
			new Request("https://rakta.test/dashboard"),
			() => {
				events.push("terminal");
				return new Response("ok");
			},
		);

		expect(events).toEqual(["before", "terminal", "rakta-1"]);
		expect(response.headers.get("x-after")).toBe("done");
	});

	test("supports redirects, aborts, and rewrites", async () => {
		const redirected = redirect("https://rakta.test/login");
		expect(redirected.status).toBe(307);
		expect(redirected.headers.get("location")).toBe("https://rakta.test/login");

		const aborted = abort(401, "unauthorized");
		expect(aborted.status).toBe(401);
		expect(await aborted.text()).toBe("unauthorized");

		const stack = createMiddlewareStack([() => rewrite("/docs")]);
		const rewritten = await stack.handle(
			new Request("https://rakta.test/guide"),
			() => new Response("never"),
		);

		expect(rewritten.status).toBe(204);
		expect(rewritten.headers.get("x-rakta-rewrite")).toBe(
			"https://rakta.test/docs",
		);
	});

	test("rejects duplicated next calls", async () => {
		const stack = createMiddlewareStack([
			async (_context, next) => {
				await next();
				return next();
			},
		]);

		await expect(
			stack.handle(new Request("https://rakta.test"), () => new Response("ok")),
		).rejects.toThrow("Rakta middleware next() was called more than once.");
	});
});
