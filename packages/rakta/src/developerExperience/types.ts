export interface RaktaSourceModule {
	readonly id: string;
	readonly imports?: readonly string[];
	readonly routePattern?: string;
	readonly size?: number;
}

export interface RaktaDependencyEdge {
	readonly from: string;
	readonly to: string;
}

export interface RaktaDependencyGraph {
	readonly modules: readonly RaktaSourceModule[];
	readonly edges: readonly RaktaDependencyEdge[];
}

export interface RaktaRouteAnalysis {
	readonly routePattern: string;
	readonly moduleId: string;
	readonly dependencies: readonly string[];
}

export interface RaktaBundleAnalysis {
	readonly totalSize: number;
	readonly largestModules: readonly RaktaSourceModule[];
}

export interface RaktaAutoImportInspection {
	readonly symbol: string;
	readonly source: string;
	readonly usedBy: readonly string[];
}

export interface RaktaErrorOverlayFrame {
	readonly file: string;
	readonly line: number;
	readonly column: number;
	readonly functionName?: string;
}

export interface RaktaErrorOverlayPayload {
	readonly message: string;
	readonly frames: readonly RaktaErrorOverlayFrame[];
}

export interface RaktaProfilerMark {
	readonly name: string;
	readonly startedAt: number;
	readonly endedAt: number;
}
