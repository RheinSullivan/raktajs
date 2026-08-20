import { describe, expect, mock, test } from "bun:test";
import { HttpTimeoutError } from "./errors";
import { createRaktaHttp } from "./panturaFetch";

describe("PanturaFetch HTTP Client Core Tests", () => {
	test("should execute normal GET request successfully", async () => {
		const originalFetch = globalThis.fetch;
		globalThis.fetch = mock(
			async (url: string | URL | Request, init?: RequestInit) => {
				expect(String(url)).toBe("http://localhost:4000/api/users?active=true");
				expect(init?.method).toBe("GET");
				expect(init?.keepalive).toBeUndefined();
				return new Response(JSON.stringify([{ id: 1, name: "Alice" }]), {
					status: 200,
					headers: { "content-type": "application/json" },
				});
			},
		) as unknown as typeof fetch;

		try {
			const http = createRaktaHttp({ baseUrl: "http://localhost:4000" });
			const data = await http.get<{ id: number; name: string }[]>(
				"/api/users",
				{
					params: { active: true },
				},
			);

			expect(data).toBeArray();
			expect(data).toHaveLength(1);
			expect(data[0]?.name).toBe("Alice");
		} finally {
			globalThis.fetch = originalFetch;
		}
	});

	test("should throw HttpTimeoutError on request timeout and NOT retry", async () => {
		let attempts = 0;
		const originalFetch = globalThis.fetch;
		globalThis.fetch = mock(
			async (_url: string | URL | Request, init?: RequestInit) => {
				attempts++;
				const signal = init?.signal;
				await new Promise<void>((resolve, reject) => {
					const handle = setTimeout(resolve, 200);
					signal?.addEventListener("abort", () => {
						clearTimeout(handle);
						const err = new Error("The operation was aborted");
						err.name = "AbortError";
						reject(err);
					});
				});
				return new Response("OK", { status: 200 });
			},
		) as unknown as typeof fetch;

		try {
			const http = createRaktaHttp({ baseUrl: "http://localhost:4000" });
			const promise = http.get("/api/slow", {
				timeout: 50,
				retries: 2,
				retryDelay: 10,
			});

			await expect(promise).rejects.toThrow(HttpTimeoutError);
			expect(attempts).toBe(1); // Crucial: Must NOT retry on timeout!
		} finally {
			globalThis.fetch = originalFetch;
		}
	});

	test("should honor caller AbortSignal cancellation and NOT retry", async () => {
		let attempts = 0;
		const originalFetch = globalThis.fetch;
		globalThis.fetch = mock(
			async (_url: string | URL | Request, init?: RequestInit) => {
				attempts++;
				const signal = init?.signal;
				await new Promise<void>((_resolve, reject) => {
					signal?.addEventListener("abort", () => {
						const err = new Error("Cancelled");
						err.name = "AbortError";
						reject(err);
					});
				});
				return new Response("OK", { status: 200 });
			},
		) as unknown as typeof fetch;

		try {
			const http = createRaktaHttp({ baseUrl: "http://localhost:4000" });
			const controller = new AbortController();

			const promise = http.get("/api/cancel", {
				signal: controller.signal,
				retries: 3,
			});

			setTimeout(() => controller.abort(), 20);

			await expect(promise).rejects.toThrow();
			expect(attempts).toBe(1); // Crucial: Must NOT retry on caller cancellation!
		} finally {
			globalThis.fetch = originalFetch;
		}
	});

	test("should support explicit keepalive setting when requested", async () => {
		const originalFetch = globalThis.fetch;
		globalThis.fetch = mock(
			async (_url: string | URL | Request, init?: RequestInit) => {
				expect(init?.keepalive).toBe(true);
				return new Response(JSON.stringify({ ok: true }), {
					status: 200,
					headers: { "content-type": "application/json" },
				});
			},
		) as unknown as typeof fetch;

		try {
			const http = createRaktaHttp({ baseUrl: "http://localhost:4000" });
			await http.post(
				"/api/beacon",
				{ event: "page_unload" },
				{ keepalive: true },
			);
		} finally {
			globalThis.fetch = originalFetch;
		}
	});

	test("should handle concurrent requests independently", async () => {
		const originalFetch = globalThis.fetch;
		globalThis.fetch = mock(
			async (url: string | URL | Request, init?: RequestInit) => {
				const urlStr = String(url);
				if (urlStr.includes("fast")) {
					return new Response(JSON.stringify({ result: "fast" }), {
						status: 200,
						headers: { "content-type": "application/json" },
					});
				}

				// slow endpoint
				const signal = init?.signal;
				await new Promise<void>((resolve, reject) => {
					const handle = setTimeout(resolve, 300);
					signal?.addEventListener("abort", () => {
						clearTimeout(handle);
						const err = new Error("The operation was aborted");
						err.name = "AbortError";
						reject(err);
					});
				});
				return new Response(JSON.stringify({ result: "slow" }), {
					status: 200,
				});
			},
		) as unknown as typeof fetch;

		try {
			const http = createRaktaHttp({ baseUrl: "http://localhost:4000" });

			const fastReq = http.get<{ result: string }>("/api/fast", {
				timeout: 1000,
			});
			const slowReq = http.get<{ result: string }>("/api/slow", {
				timeout: 50,
			});

			const fastRes = await fastReq;
			expect(fastRes.result).toBe("fast");

			await expect(slowReq).rejects.toThrow(HttpTimeoutError);
		} finally {
			globalThis.fetch = originalFetch;
		}
	});
});
