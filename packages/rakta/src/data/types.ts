export type RaktaRenderRuntime =
	| "server"
	| "client"
	| "edge"
	| "static"
	| "hybrid";

export interface RaktaCacheEntry<TValue> {
	readonly key: string;
	readonly value: TValue;
	readonly createdAt: number;
	readonly expiresAt?: number;
	readonly tags: readonly string[];
}

export interface RaktaCacheOptions {
	readonly ttl?: number;
	readonly tags?: readonly string[];
	readonly now?: () => number;
}

export interface RaktaRouteDataStrategy {
	readonly routePattern: string;
	readonly runtime: RaktaRenderRuntime;
	readonly prerender: boolean;
	readonly stream: boolean;
	readonly prefetch: boolean;
	readonly revalidate?: number;
}
