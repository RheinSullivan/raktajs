import type {
	RaktaAutoImportInspection,
	RaktaBundleAnalysis,
	RaktaDependencyGraph,
	RaktaErrorOverlayFrame,
	RaktaErrorOverlayPayload,
	RaktaProfilerMark,
	RaktaRouteAnalysis,
	RaktaSourceModule,
} from "./types";

export function createDependencyGraph(
	modules: readonly RaktaSourceModule[],
): RaktaDependencyGraph {
	return {
		modules,
		edges: modules.flatMap((sourceModule) =>
			(sourceModule.imports ?? []).map((targetModule) => ({
				from: sourceModule.id,
				to: targetModule,
			})),
		),
	};
}

export function analyzeRoutes(
	graph: RaktaDependencyGraph,
): readonly RaktaRouteAnalysis[] {
	return graph.modules
		.filter((sourceModule) => sourceModule.routePattern !== undefined)
		.map((sourceModule) => ({
			routePattern: sourceModule.routePattern ?? "/",
			moduleId: sourceModule.id,
			dependencies: collectDependencies(graph, sourceModule.id),
		}));
}

export function analyzeBundle(
	modules: readonly RaktaSourceModule[],
	limit = 10,
): RaktaBundleAnalysis {
	const largestModules = [...modules]
		.sort((left, right) => (right.size ?? 0) - (left.size ?? 0))
		.slice(0, limit);

	return {
		totalSize: modules.reduce(
			(total, sourceModule) => total + (sourceModule.size ?? 0),
			0,
		),
		largestModules,
	};
}

export function inspectAutoImports(
	imports: readonly RaktaAutoImportInspection[],
): readonly RaktaAutoImportInspection[] {
	return [...imports].sort((left, right) =>
		left.symbol.localeCompare(right.symbol),
	);
}

export function createErrorOverlay(
	error: Error,
	frames: readonly RaktaErrorOverlayFrame[] = [],
): RaktaErrorOverlayPayload {
	return {
		message: error.message,
		frames,
	};
}

export function createProfilerReport(
	marks: readonly RaktaProfilerMark[],
): readonly RaktaProfilerMark[] {
	return [...marks].sort((left, right) => left.startedAt - right.startedAt);
}

function collectDependencies(
	graph: RaktaDependencyGraph,
	moduleId: string,
): readonly string[] {
	const visited = new Set<string>();
	const queue = graph.edges
		.filter((edge) => edge.from === moduleId)
		.map((edge) => edge.to);

	for (const dependencyId of queue) {
		if (visited.has(dependencyId)) {
			continue;
		}

		visited.add(dependencyId);
		queue.push(
			...graph.edges
				.filter((edge) => edge.from === dependencyId)
				.map((edge) => edge.to),
		);
	}

	return Array.from(visited);
}
