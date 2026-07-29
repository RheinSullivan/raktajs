import { describe, expect, test } from "bun:test";
import {
	createRequestContext,
	deleteCookie,
	getCookie,
	headersToRecord,
	jsonResponse,
	mergeHeaders,
	parseCookies,
	RaktaEventBus,
	RaktaQueue,
	redirectResponse,
	runCronTask,
	serializeCookie,
	setCookie,
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

	test("parses and serializes cookies", () => {
		const request = new Request("http://localhost/", {
			headers: { cookie: "session=abc123; theme=dark" },
		});

		const cookies = parseCookies(request);
		expect(cookies.get("session")).toBe("abc123");
		expect(cookies.get("theme")).toBe("dark");

		const value = getCookie(request, "session");
		expect(value).toBe("abc123");

		const serialized = serializeCookie("token", "xyz", {
			httpOnly: true,
			path: "/",
			maxAge: 3600,
		});
		expect(serialized).toContain("token=xyz");
		expect(serialized).toContain("HttpOnly");
		expect(serialized).toContain("Max-Age=3600");
	});

	test("sets and deletes cookies on response", () => {
		let response = new Response("ok");
		response = setCookie(response, "session", "abc123", { path: "/" });
		expect(response.headers.get("Set-Cookie")).toContain("session=abc123");

		const deleted = deleteCookie(response, "session");
		expect(deleted.headers.get("Set-Cookie")).toContain("Max-Age=0");
	});

	test("merges headers and builds JSON responses", () => {
		const merged = mergeHeaders({ "X-One": "1" }, { "X-Two": "2" });
		expect(merged.get("X-One")).toBe("1");
		expect(merged.get("X-Two")).toBe("2");

		const record = headersToRecord(merged);
		expect(record["x-one"]).toBe("1");

		const jsonRes = jsonResponse({ ok: true });
		expect(jsonRes.status).toBe(200);
		expect(jsonRes.headers.get("Content-Type")).toContain("application/json");

		const redirect = redirectResponse("/login", 302);
		expect(redirect.status).toBe(302);
		expect(redirect.headers.get("Location")).toBe("/login");
	});
});
