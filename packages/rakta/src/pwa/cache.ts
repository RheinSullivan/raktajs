import type { CacheStrategyOptions } from "./types";

/** Builds a versioned cache name, e.g. "rakta-shrimp-harbor-v1". */
export function buildCacheName(
	cacheName: string,
	cacheVersion: string,
): string {
	const sanitizedName = cacheName.trim().toLowerCase().replace(/\s+/g, "-");
	const sanitizedVersion = cacheVersion.trim().toLowerCase();

	return `${sanitizedName}-${sanitizedVersion}`;
}

/** Returns the list of URLs that should be precached, including the offline fallback. */
export function resolvePrecacheList(options: CacheStrategyOptions): string[] {
	const uniqueUrls = new Set<string>(options.precacheUrls);
	uniqueUrls.add(options.offlineFallbackUrl);

	return Array.from(uniqueUrls);
}
