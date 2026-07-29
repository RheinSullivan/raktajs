// RaktaData - Server-side data fetching primitives
// Covers: cache(), revalidate(), ISR, defer(), lazy(), prefetch()
// These are framework-level building blocks for server components and route loaders.

import { RaktaDataCache } from "./cache";
import type { RaktaCacheOptions, RaktaRenderRuntime } from "./types";

// Module-level default cache (singleton per process / worker)
let _defaultCache: RaktaDataCache | undefined;

function getDefaultCache(): RaktaDataCache {
	if (!_defaultCache) {
		_defaultCache = new RaktaDataCache();
	}

	return _defaultCache;
}

/**
 * Fetch and cache data with optional TTL and tag-based revalidation.
 *
 * @example
 * const posts = await cache("posts", () => db.posts.findMany(), { ttl: 60_000, tags: ["posts"] });
 */
export async function cache<TValue>(
	key: string,
	loader: () => Promise<TValue> | TValue,
	options: RaktaCacheOptions = {},
): Promise<TValue> {
	return getDefaultCache().cache(key, loader, options);
}

/**
 * Invalidate cache entries by key or tag.
 * Returns the number of entries removed.
 *
 * @example
 * revalidate("posts"); // removes the "posts" cache key
 * revalidate("cms"); // removes all entries tagged "cms"
 */
export function revalidate(keyOrTag: string): number {
	return getDefaultCache().revalidate(keyOrTag);
}

/**
 * ISR - Incremental Static Regeneration helper.
 * Wraps a loader with a time-based TTL and a background revalidation flag.
 */
export interface IsrOptions {
	readonly revalidateAfterMs: number;
	readonly tags?: readonly string[];
}

export interface IsrResult<TValue> {
	readonly data: TValue;
	readonly generatedAt: number;
	readonly isStale: boolean;
}

export async function isr<TValue>(
	key: string,
	loader: () => Promise<TValue> | TValue,
	options: IsrOptions,
): Promise<IsrResult<TValue>> {
	const now = Date.now();
	const c = getDefaultCache();

	// Check if stale
	const snapshot = c.snapshot().find((entry) => entry.key === key);
	const isStale =
		snapshot !== undefined &&
		snapshot.expiresAt !== undefined &&
		snapshot.expiresAt <= now;

	const cacheOpts: RaktaCacheOptions = {
		ttl: options.revalidateAfterMs,
		...(options.tags !== undefined ? { tags: options.tags } : {}),
		now: () => now,
	};

	const data = await c.cache(key, loader, cacheOpts);

	return {
		data,
		generatedAt: snapshot?.createdAt ?? now,
		isStale,
	};
}

/**
 * Defer a value - returns a Promise that can be awaited in streaming contexts.
 * On the server this triggers Suspense-compatible streaming.
 */
export function defer<TValue>(loader: () => Promise<TValue>): Promise<TValue> {
	return loader();
}

/**
 * Lazy load a module/component - returns a thunk that resolves on first call.
 */
export function lazy<TValue>(
	importer: () => Promise<TValue>,
): () => Promise<TValue> {
	let cached: Promise<TValue> | undefined;

	return () => {
		if (!cached) {
			cached = importer();
		}

		return cached;
	};
}

/**
 * Prefetch data for a route before the user navigates there.
 * Primes the default cache so navigation renders instantly.
 */
export async function prefetch<TValue>(
	key: string,
	loader: () => Promise<TValue>,
	options: RaktaCacheOptions = {},
): Promise<void> {
	await getDefaultCache().cache(key, loader, options);
}

/**
 * Choose a rendering runtime based on route config or page-level override.
 */
export function resolveRenderRuntime(
	routeRuntime: RaktaRenderRuntime,
	pageOverride?: RaktaRenderRuntime,
): RaktaRenderRuntime {
	return pageOverride ?? routeRuntime;
}

/** Reset the module-level default cache - for testing only. */
export function _resetDefaultCache(): void {
	_defaultCache = undefined;
}
