import { describe, expect, mock, test } from "bun:test";
import { createRaktaClient, RaktaRpcError } from "./client";
import { createRaktaRouter, createRpcHandler } from "./router";

describe("Rakta RPC Core Tests", () => {
	test("should execute query procedure successfully", async () => {
		const appRouter = createRaktaRouter({
			greet: {
				kind: "query",
				handler: async (ctx: { input: unknown }) => {
					const input = ctx.input as { name: string };
					return { greeting: `Hello, ${input.name}!` };
				},
			},
		});

		const handler = createRpcHandler(appRouter);

		const request = new Request("http://localhost:4000/rpc", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ procedure: "greet", input: { name: "Rakta" } }),
		});

		const response = await handler(request);
		expect(response.status).toBe(200);

		const json = await response.json();
		expect(json).toEqual({ ok: true, data: { greeting: "Hello, Rakta!" } });
	});

	test("should pass request and signal in RPC handler context", async () => {
		let receivedSignal: AbortSignal | undefined;
		let receivedRequest: Request | undefined;

		const appRouter = createRaktaRouter({
			inspectContext: {
				kind: "query",
				handler: async (ctx) => {
					receivedSignal = ctx.signal;
					receivedRequest = ctx.request;
					return { ok: true };
				},
			},
		});

		const handler = createRpcHandler(appRouter);
		const request = new Request("http://localhost:4000/rpc", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ procedure: "inspectContext", input: {} }),
		});

		await handler(request);
		expect(receivedRequest).toBe(request);
		expect(receivedSignal).toBeDefined();
	});

	test("should reject request immediately if signal is already aborted", async () => {
		const appRouter = createRaktaRouter({
			doWork: {
				kind: "mutation",
				handler: async () => ({ status: "done" }),
			},
		});

		const handler = createRpcHandler(appRouter);
		const controller = new AbortController();
		controller.abort();

		const request = new Request("http://localhost:4000/rpc", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ procedure: "doWork", input: {} }),
			signal: controller.signal,
		});

		const response = await handler(request);
		expect(response.status).toBe(499);
		const json = (await response.json()) as { code: string };
		expect(json.code).toBe("client_aborted");
	});

	test("client should throw RaktaRpcError on RPC procedure error", async () => {
		const originalFetch = globalThis.fetch;
		globalThis.fetch = mock(async () => {
			return new Response(
				JSON.stringify({
					ok: false,
					error: "Unauthorized",
					code: "UNAUTHORIZED",
				}),
				{
					status: 200,
					headers: { "content-type": "application/json" },
				},
			);
		}) as unknown as typeof fetch;

		try {
			type TestRouter = {
				protectedData: {
					kind: "query";
					handler: (ctx: { input: unknown }) => Promise<unknown>;
				};
			};
			const client = createRaktaClient<TestRouter>({
				baseUrl: "http://localhost:4000/rpc",
			});
			await expect(client.protectedData.query({})).rejects.toThrow(
				RaktaRpcError,
			);
		} finally {
			globalThis.fetch = originalFetch;
		}
	});

	test("client should throw RaktaRpcError on non-200 non-JSON HTTP response without syntax error", async () => {
		const originalFetch = globalThis.fetch;
		globalThis.fetch = mock(async () => {
			return new Response("<html>504 Gateway Timeout</html>", {
				status: 504,
				headers: { "content-type": "text/html" },
			});
		}) as unknown as typeof fetch;

		try {
			type TestRouter = {
				someProcedure: {
					kind: "query";
					handler: (ctx: { input: unknown }) => Promise<unknown>;
				};
			};
			const client = createRaktaClient<TestRouter>({
				baseUrl: "http://localhost:4000/rpc",
			});
			const promise = client.someProcedure.query({});
			await expect(promise).rejects.toThrow(RaktaRpcError);
		} finally {
			globalThis.fetch = originalFetch;
		}
	});

	test("client should handle timeout correctly and throw timeout code", async () => {
		const originalFetch = globalThis.fetch;
		globalThis.fetch = mock(async (_url, init) => {
			const signal = init?.signal;
			await new Promise<void>((_resolve, reject) => {
				signal?.addEventListener("abort", () => {
					const err = new Error("The operation was aborted");
					err.name = "AbortError";
					reject(err);
				});
			});
			return new Response("{}", { status: 200 });
		}) as unknown as typeof fetch;

		try {
			type TestRouter = {
				slowProcedure: {
					kind: "query";
					handler: (ctx: { input: unknown }) => Promise<unknown>;
				};
			};
			const client = createRaktaClient<TestRouter>({
				baseUrl: "http://localhost:4000/rpc",
			});
			const promise = client.slowProcedure.query({}, { timeout: 30 });
			await expect(promise).rejects.toThrow(RaktaRpcError);
		} finally {
			globalThis.fetch = originalFetch;
		}
	});
});
