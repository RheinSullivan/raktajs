export type RaktaLayoutKind =
	| "root"
	| "nested"
	| "persistent"
	| "error"
	| "loading"
	| "not-found"
	| "parallel"
	| "group";

export interface RaktaLayoutEntry {
	readonly id: string;
	readonly kind: RaktaLayoutKind;
	readonly routePattern: string;
	readonly filePath: string;
	readonly parentId?: string;
	readonly slot?: string;
	readonly order: number;
}

export interface RaktaLayoutManifest {
	readonly root?: RaktaLayoutEntry;
	readonly entries: readonly RaktaLayoutEntry[];
}

export interface RaktaLayoutFile {
	readonly path: string;
}
