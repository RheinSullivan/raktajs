import type { RaktaCacheEntry, RaktaCacheOptions } from "./types";

export class RaktaDataCache {
	readonly #entries = new Map<string, RaktaCacheEntry<unknown>>();
	readonly #now: () => number;

	constructor(now: () => number = Date.now) {
		this.#now = now;
	}

	async cache<TValue>(
		key: string,
		loader: () => Promise<TValue> | TValue,
		options: RaktaCacheOptions = {},
	): Promise<TValue> {
		const now = options.now?.() ?? this.#now();
		const existingEntry = this.#entries.get(key);

		if (
			existingEntry !== undefined &&
			(existingEntry.expiresAt === undefined || existingEntry.expiresAt > now)
		) {
			return existingEntry.value as TValue;
		}

		const value = await loader();
		const entry: RaktaCacheEntry<TValue> = {
			key,
			value,
			createdAt: now,
			tags: options.tags ?? [],
		};

		if (options.ttl !== undefined) {
			this.#entries.set(key, { ...entry, expiresAt: now + options.ttl });
			return value;
		}

		this.#entries.set(key, entry);
		return value;
	}

	revalidate(keyOrTag: string): number {
		let deleted = 0;

		for (const [key, entry] of this.#entries) {
			if (key === keyOrTag || entry.tags.includes(keyOrTag)) {
				this.#entries.delete(key);
				deleted += 1;
			}
		}

		return deleted;
	}

	snapshot(): readonly RaktaCacheEntry<unknown>[] {
		return Array.from(this.#entries.values());
	}
}

export function createDataCache(now?: () => number): RaktaDataCache {
	return new RaktaDataCache(now);
}
