import { describe, expect, test } from "bun:test";
import {
	createCoverageReport,
	createMockServer,
	createSnapshot,
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
});
