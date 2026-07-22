import type {
	RaktaBenchmarkKind,
	RaktaBenchmarkReport,
	RaktaBenchmarkSample,
	RaktaBuildCacheEntry,
	RaktaBundleSizeReport,
	RaktaIncrementalBuildPlan,
} from "./types";

export async function benchmark(
	kind: RaktaBenchmarkKind,
	label: string,
	task: () => Promise<void> | void,
	now: () => number = performance.now.bind(performance),
): Promise<RaktaBenchmarkSample> {
	const startedAt = now();
	await task();

	return {
		kind,
		label,
		duration: now() - startedAt,
	};
}

export function createBenchmarkReport(
	samples: readonly RaktaBenchmarkSample[],
): RaktaBenchmarkReport {
	const durations = samples.map((sample) => sample.duration);
	const total = durations.reduce((sum, duration) => sum + duration, 0);

	return {
		samples,
		average: durations.length === 0 ? 0 : total / durations.length,
		fastest: durations.length === 0 ? 0 : Math.min(...durations),
		slowest: durations.length === 0 ? 0 : Math.max(...durations),
	};
}

export function createBundleSizeReport(
	files: readonly { readonly path: string; readonly bytes: number }[],
): RaktaBundleSizeReport {
	return {
		files,
		totalBytes: files.reduce((sum, file) => sum + file.bytes, 0),
	};
}

export class RaktaBuildCache {
	readonly #entries = new Map<string, RaktaBuildCacheEntry>();

	get(key: string): RaktaBuildCacheEntry | undefined {
		return this.#entries.get(key);
	}

	set(entry: RaktaBuildCacheEntry): void {
		this.#entries.set(entry.key, entry);
	}

	isFresh(key: string, hash: string): boolean {
		return this.#entries.get(key)?.hash === hash;
	}

	snapshot(): readonly RaktaBuildCacheEntry[] {
		return Array.from(this.#entries.values());
	}
}

export function createBuildCache(): RaktaBuildCache {
	return new RaktaBuildCache();
}

export function createIncrementalBuildPlan(
	files: readonly { readonly key: string; readonly hash: string }[],
	cache: RaktaBuildCache,
): RaktaIncrementalBuildPlan {
	const changed: string[] = [];
	const reused: string[] = [];

	for (const file of files) {
		if (cache.isFresh(file.key, file.hash)) {
			reused.push(file.key);
		} else {
			changed.push(file.key);
		}
	}

	return { changed, reused };
}
