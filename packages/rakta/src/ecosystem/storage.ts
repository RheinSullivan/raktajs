// @rakta/storage - File storage ecosystem package
// Abstraction over local filesystem, S3-compatible, and in-memory storage.

export type StorageDriver = "local" | "s3" | "memory" | "r2";

export interface StorageConfig {
	readonly driver: StorageDriver;
	readonly bucket?: string;
	readonly prefix?: string;
	readonly baseUrl?: string;
}

export interface StorageObject {
	readonly key: string;
	readonly size: number;
	readonly contentType: string;
	readonly lastModified: Date;
	readonly url?: string;
}

export interface StorageAdapter {
	readonly driver: StorageDriver;
	/** Upload a file. Returns the public URL if available. */
	put(
		key: string,
		data: Uint8Array | string,
		options?: { contentType?: string },
	): Promise<StorageObject>;
	/** Download a file. Returns undefined if not found. */
	get(
		key: string,
	): Promise<{ data: Uint8Array; meta: StorageObject } | undefined>;
	/** Delete a file. */
	delete(key: string): Promise<boolean>;
	/** List files with optional prefix filter. */
	list(prefix?: string): Promise<readonly StorageObject[]>;
	/** Check if a key exists. */
	exists(key: string): Promise<boolean>;
}

/**
 * Create an in-memory storage adapter for testing.
 */
export function createMemoryStorage(): StorageAdapter {
	const store = new Map<string, { data: Uint8Array; meta: StorageObject }>();

	return {
		driver: "memory",
		async put(key, data, options = {}) {
			const bytes =
				typeof data === "string" ? new TextEncoder().encode(data) : data;
			const meta: StorageObject = {
				key,
				size: bytes.length,
				contentType: options.contentType ?? "application/octet-stream",
				lastModified: new Date(),
			};
			store.set(key, { data: bytes, meta });
			return meta;
		},
		async get(key) {
			return store.get(key);
		},
		async delete(key) {
			return store.delete(key);
		},
		async list(prefix) {
			const items = Array.from(store.values()).map(
				(storageEntry) => storageEntry.meta,
			);
			if (!prefix) {
				return items;
			}

			return items.filter((item) => item.key.startsWith(prefix));
		},
		async exists(key) {
			return store.has(key);
		},
	};
}
