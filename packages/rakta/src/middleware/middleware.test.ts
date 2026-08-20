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

	test("supports post-processing middleware with await next() returning void", async () => {
		const steps: string[] = [];
		const stack = createMiddlewareStack([
			async (_context, next) => {
				steps.push("step-1-start");
				await next();
				steps.push("step-1-end");
			},
			async (_context, next) => {
				steps.push("step-2-start");
				const res = await next();
				steps.push("step-2-end");
				return res;
			},
		]);

		const response = await stack.handle(
			new Request("https://rakta.test/api/data"),
			() => {
				steps.push("handler");
				return new Response("handler-response");
			},
		);

		expect(await response.text()).toBe("handler-response");
		expect(steps).toEqual([
			"step-1-start",
			"step-2-start",
			"handler",
			"step-2-end",
			"step-1-end",
		]);
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
