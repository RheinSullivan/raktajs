import { describe, expect, test } from "bun:test";
import {
	createRequestContext,
	RaktaEventBus,
	RaktaQueue,
	runCronTask,
} from "./index";

describe("Rakta operations", () => {
	test("creates request context and queues jobs", () => {
		const context = createRequestContext(new Request("http://localhost/api"));
		const queue = new RaktaQueue();

		queue.push({ id: "1", name: "mail", payload: { to: "a@b.test" } }, 1);

		expect(context.pathname).toBe("/api");
		expect(queue.size()).toBe(1);
		expect(queue.shift()?.name).toBe("mail");
	});

	test("emits events and runs cron tasks", async () => {
		const bus = new RaktaEventBus();
		let received = "";
		bus.on<string>("ready", (event) => {
			received = event.payload;
		});

		bus.emit({ name: "ready", payload: "yes" });

		expect(received).toBe("yes");
		expect(
			await runCronTask({ name: "cleanup", intervalMs: 1000, run() {} }),
		).toBe("cleanup");
	});
});
