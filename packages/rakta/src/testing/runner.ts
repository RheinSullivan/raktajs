import type {
	RaktaCoverageReport,
	RaktaMockRoute,
	RaktaTestCase,
	RaktaTestResult,
} from "./types";

export async function runRaktaTests(
	cases: readonly RaktaTestCase[],
	now: () => number = performance.now.bind(performance),
): Promise<readonly RaktaTestResult[]> {
	const results: RaktaTestResult[] = [];

	for (const testCase of cases) {
		const startedAt = now();

		try {
			await testCase.run();
			results.push({
				name: testCase.name,
				kind: testCase.kind,
				passed: true,
				duration: now() - startedAt,
			});
		} catch (error) {
			results.push({
				name: testCase.name,
				kind: testCase.kind,
				passed: false,
				duration: now() - startedAt,
				error: error instanceof Error ? error.message : "Unknown test error.",
			});
		}
	}

	return results;
}

export function createMockServer(routes: readonly RaktaMockRoute[]) {
	return (request: Request): Response => {
		const url = new URL(request.url);
		const route = routes.find(
			(entry) =>
				entry.method.toUpperCase() === request.method.toUpperCase() &&
				entry.pathname === url.pathname,
		);

		return route?.response ?? new Response("Not found", { status: 404 });
	};
}

export function createCoverageReport(input: {
	readonly files: number;
	readonly covered: number;
}): RaktaCoverageReport {
	return {
		files: input.files,
		covered: input.covered,
		percent: input.files === 0 ? 100 : (input.covered / input.files) * 100,
	};
}

export function createSnapshot(value: unknown): string {
	return `${JSON.stringify(value, Object.keys(value as object).sort(), 2)}\n`;
}
