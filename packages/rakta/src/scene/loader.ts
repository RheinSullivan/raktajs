// Asset loader for 3D scenes - lazy, cached, progressive
// Named after Sunan Gunung Jati's coastal trade routes: assets flow in
// like ships arriving at Cirebon harbor, cached for reuse.
//
// Three.js is an optional peer dependency. Install it to use 3D features:
//   bun add three

export interface LoaderOptions {
	readonly onProgress?: (progress: number) => void;
	readonly onLoaded?: () => void;
	readonly onError?: (error: Error) => void;
}

const assetCache = new Map<string, unknown>();

/**
 * loadGLTF - lazy-loads a GLTF/GLB 3D model.
 * Three.js GLTFLoader is dynamically imported - zero cost until called.
 */
export async function loadGLTF(
	url: string,
	options?: LoaderOptions,
): Promise<unknown> {
	if (assetCache.has(url)) return assetCache.get(url);

	let ThreeModule: typeof import("three") | null = null;
	try {
		ThreeModule = await import("three");
	} catch {
		throw new Error(
			"[Rakta MegaScape] Three.js not installed. Run: bun add three",
		);
	}

	void ThreeModule; // used for type check only; GLTFLoader import below

	let GLTFLoaderModule: {
		GLTFLoader: new () => {
			load: (
				url: string,
				onLoad: (gltf: unknown) => void,
				onProgress: (event: ProgressEvent) => void,
				onError: (error: ErrorEvent) => void,
			) => void;
		};
	};
	try {
		GLTFLoaderModule = (await import(
			"three/addons/loaders/GLTFLoader.js"
		)) as typeof GLTFLoaderModule;
	} catch {
		throw new Error("[Rakta MegaScape] GLTFLoader not available.");
	}

	return new Promise((resolve, reject) => {
		const loader = new GLTFLoaderModule.GLTFLoader();
		loader.load(
			url,
			(gltf) => {
				assetCache.set(url, gltf);
				options?.onLoaded?.();
				resolve(gltf);
			},
			(event: ProgressEvent) => {
				if (event.total > 0) {
					options?.onProgress?.(event.loaded / event.total);
				}
			},
			(error: ErrorEvent) => {
				const err = new Error(error.message ?? "GLTFLoader error");
				options?.onError?.(err);
				reject(err);
			},
		);
	});
}

/**
 * loadTexture - lazy-loads a texture asset.
 */
export async function loadTexture(
	url: string,
	options?: LoaderOptions,
): Promise<unknown> {
	if (assetCache.has(url)) return assetCache.get(url);

	let three: typeof import("three") | null = null;
	try {
		three = await import("three");
	} catch {
		throw new Error(
			"[Rakta MegaScape] Three.js not installed. Run: bun add three",
		);
	}

	return new Promise((resolve) => {
		const loader = new three.TextureLoader();
		loader.load(
			url,
			(texture) => {
				assetCache.set(url, texture);
				options?.onLoaded?.();
				resolve(texture);
			},
			(event: ProgressEvent) => {
				if (event.total > 0) {
					options?.onProgress?.(event.loaded / event.total);
				}
			},
		);
	});
}

/**
 * clearAssetCache - releases cached 3D assets.
 */
export function clearAssetCache(url?: string): void {
	if (url) assetCache.delete(url);
	else assetCache.clear();
}
