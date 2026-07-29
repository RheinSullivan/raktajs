export type RaktaBenchmarkKind =
	| "startup"
	| "routing"
	| "hydration"
	| "build"
	| "hmr"
	| "memory"
	| "bundle";

export interface RaktaBenchmarkSample {
	readonly kind: RaktaBenchmarkKind;
	readonly label: string;
	readonly duration: number;
}

export interface RaktaBenchmarkReport {
	readonly samples: readonly RaktaBenchmarkSample[];
	readonly average: number;
	readonly fastest: number;
	readonly slowest: number;
}

export interface RaktaBundleSizeReport {
	readonly files: readonly {
		readonly path: string;
		readonly bytes: number;
	}[];
	readonly totalBytes: number;
}

export interface RaktaBuildCacheEntry {
	readonly key: string;
	readonly hash: string;
	readonly createdAt: number;
}

export interface RaktaIncrementalBuildPlan {
	readonly changed: readonly string[];
	readonly reused: readonly string[];
}

export interface RaktaMemorySnapshot {
	readonly label: string;
	readonly heapUsedBytes: number;
	readonly heapTotalBytes: number;
	readonly externalBytes: number;
	readonly capturedAt: number;
}

export interface RaktaPerformanceSuite {
	readonly name: string;
	readonly benchmarks: readonly RaktaBenchmarkReport[];
	readonly memory?: RaktaMemorySnapshot;
	readonly totalDurationMs: number;
}
