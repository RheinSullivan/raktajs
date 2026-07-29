// RaktaKernel - Module Loader
// Discovers, loads, and registers modules (plugins, services, features) from
// a given directory or explicit module list. Supports lazy loading, caching,
// and per-module error isolation.

import type { RaktaPlugin } from "./types";

export interface RaktaModuleRecord {
	readonly id: string;
	readonly plugin: RaktaPlugin;
	readonly loadedAt: number;
}

export interface RaktaModuleLoaderOptions {
	/** Fail the entire startup pipeline if any module fails to load. Default: false */
	readonly strict?: boolean;
}

export interface RaktaModuleLoader {
	/** Load modules from a list of dynamic importers. */
	loadMany(
		importers: ReadonlyArray<() => Promise<{ default?: RaktaPlugin }>>,
		options?: RaktaModuleLoaderOptions,
	): Promise<readonly RaktaModuleRecord[]>;

	/** Load a single module. */
	loadOne(
		id: string,
		importer: () => Promise<{ default?: RaktaPlugin }>,
	): Promise<RaktaModuleRecord | undefined>;

	/** Return all previously loaded modules. */
	loaded(): readonly RaktaModuleRecord[];

	/** Clear the module cache (useful in tests). */
	clear(): void;
}

export function createModuleLoader(): RaktaModuleLoader {
	const cache = new Map<string, RaktaModuleRecord>();

	return {
		async loadOne(id, importer) {
			if (cache.has(id)) {
				return cache.get(id);
			}

			try {
				const mod = await importer();
				const plugin = mod.default;

				if (!plugin || typeof plugin.name !== "string") {
					return undefined;
				}

				const record: RaktaModuleRecord = {
					id,
					plugin,
					loadedAt: Date.now(),
				};

				cache.set(id, record);
				return record;
			} catch {
				return undefined;
			}
		},

		async loadMany(importers, options = {}) {
			const results: RaktaModuleRecord[] = [];

			for (let index = 0; index < importers.length; index++) {
				const moduleId = `module:${index}`;
				const importer = importers[index];

				// noUncheckedIndexedAccess: importer may be undefined if array is sparse
				if (!importer) {
					continue;
				}

				try {
					const mod = await importer();
					const plugin = mod.default;

					if (!plugin || typeof plugin.name !== "string") {
						continue;
					}

					const record: RaktaModuleRecord = {
						id: plugin.name ?? moduleId,
						plugin,
						loadedAt: Date.now(),
					};

					cache.set(record.id, record);
					results.push(record);
				} catch (err) {
					if (options.strict) {
						throw err;
					}
				}
			}

			return results;
		},

		loaded() {
			return Array.from(cache.values());
		},

		clear() {
			cache.clear();
		},
	};
}
