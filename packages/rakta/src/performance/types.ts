export type RaktaBenchmarkKind = "startup" | "routing" | "hydration" | "build";

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
