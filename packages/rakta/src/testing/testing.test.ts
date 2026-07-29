import { describe, expect, test } from "bun:test";
import {
	createCoverageReport,
	createE2EClient,
	createMockServer,
	createSnapshot,
	expectText,
	renderComponent,
	runRaktaTests,
} from "./index";

describe("Rakta testing package", () => {
	test("runs tests and reports failures", async () => {
		const results = await runRaktaTests(
			[
				{ name: "unit passes", kind: "unit", run() {} },
				{
					name: "e2e fails",
					kind: "e2e",
					run() {
						throw new Error("boom");
					},
				},
			],
			(() => {
				let tick = 0;
				return () => {
					tick += 1;
					return tick;
				};
			})(),
		);

		expect(results.map((result) => result.passed)).toEqual([true, false]);
		expect(results[1]?.error).toBe("boom");
	});

	test("creates mock server, snapshots, and coverage", async () => {
		const server = createMockServer([
			{
				method: "GET",
				pathname: "/api/hello",
				response: Response.json({ ok: true }),
			},
		]);

		expect(
			await server(new Request("http://localhost/api/hello")).json(),
		).toEqual({
			ok: true,
		});
		expect(server(new Request("http://localhost/missing")).status).toBe(404);
		expect(createSnapshot({ b: 2, a: 1 })).toContain('"a": 1');
		expect(createCoverageReport({ files: 4, covered: 3 }).percent).toBe(75);
	});

	test("renders component and asserts text content", () => {
		const html = '<div><span data-testid="title">Hello Rakta.js</span></div>';
		const rendered = renderComponent(html);

		expect(rendered.exists("span")).toBe(true);
		expect(rendered.getByText("Hello Rakta.js")).toBeDefined();
		expect(rendered.getByTestId("title")).toBeDefined();

		expectText(rendered, "Hello Rakta.js");
	});

	test("creates E2E client that calls handler directly", async () => {
		const handler = (request: Request): Response => {
			const url = new URL(request.url);
			if (url.pathname === "/api/ping" && request.method === "GET") {
				return Response.json({ pong: true });
			}
			return new Response("not found", { status: 404 });
		};

		const client = createE2EClient("http://localhost", handler);

		const response = await client.get("/api/ping");
		expect(response.status).toBe(200);
		expect(response.ok).toBe(true);
		expect(await response.json()).toEqual({ pong: true });

		const missing = await client.get("/missing");
		expect(missing.status).toBe(404);
	});
});
