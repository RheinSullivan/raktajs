/// <reference types="bun" />

import { describe, expect, test } from "bun:test";
import { createRaktaEnvironment, createRaktaKernel } from "./index";

describe("Rakta kernel", () => {
	test("resolves singleton services once", async () => {
		const kernel = createRaktaKernel();
		let calls = 0;

		kernel.services.singleton("clock", () => {
			calls += 1;
			return { now: 1 };
		});

		const first = await kernel.services.resolve<{ now: number }>("clock");
		const second = await kernel.services.resolve<{ now: number }>("clock");

		expect(first).toBe(second);
		expect(calls).toBe(1);
		expect(kernel.snapshot().services).toEqual(["clock"]);
	});

	test("runs plugin lifecycle in a predictable order", async () => {
		const events: string[] = [];
		const kernel = createRaktaKernel({
			plugins: [
				{
					name: "auth",
					configure(context) {
						context.registerFeature({
							name: "auth",
							options: { strategy: "session" },
						});
						events.push("auth:configure");
					},
					start() {
						events.push("auth:start");
					},
					ready() {
						events.push("auth:ready");
					},
					shutdown() {
						events.push("auth:shutdown");
					},
				},
			],
		});

		await kernel.start();

		expect(kernel.hasFeature("auth")).toBe(true);
		expect(
			kernel.feature<{ strategy: string }>("auth")?.options?.strategy,
		).toBe("session");
		expect(kernel.snapshot().started).toBe(true);

		await kernel.shutdown();

		expect(events).toEqual([
			"auth:configure",
			"auth:start",
			"auth:ready",
			"auth:shutdown",
		]);
	});

	test("detects circular service dependencies", async () => {
		const kernel = createRaktaKernel();

		kernel.services.singleton("a", (container) => container.resolve("b"));
		kernel.services.singleton("b", (container) => container.resolve("a"));

		await expect(kernel.services.resolve("a")).rejects.toThrow(
			'Circular Rakta service dependency detected at "a".',
		);
	});

	test("reads environment values with typed helpers", () => {
		const environment = createRaktaEnvironment("production", {
			FEATURE_ON: "true",
			PORT: "3000",
			EMPTY: "",
		});

		expect(environment.isProduction).toBe(true);
		expect(environment.boolean("FEATURE_ON")).toBe(true);
		expect(environment.number("PORT")).toBe(3000);
		expect(environment.get("MISSING")).toBeUndefined();
		expect(() => environment.require("EMPTY")).toThrow(
			'Required Rakta environment variable "EMPTY" is missing.',
		);
	});
});
