export interface StoredFile {
	readonly key: string;
	readonly url: string;
	readonly contentType: string;
	readonly size: number;
}

export interface StorageProvider {
	put(input: {
		readonly key: string;
		readonly body: Uint8Array;
		readonly contentType: string;
	}): Promise<StoredFile>;
}

class MemoryStorageProvider implements StorageProvider {
	readonly #files = new Map<string, StoredFile>();

	async put(input: {
		readonly key: string;
		readonly body: Uint8Array;
		readonly contentType: string;
	}): Promise<StoredFile> {
		const file: StoredFile = {
			key: input.key,
			url: `/storage/${input.key}`,
			contentType: input.contentType,
			size: input.body.byteLength,
		};

		this.#files.set(input.key, file);
		return file;
	}
}

export const storageProvider: StorageProvider = new MemoryStorageProvider();
