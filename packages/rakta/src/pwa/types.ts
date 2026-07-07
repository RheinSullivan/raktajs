export interface ManifestIcon {
	readonly src: string;
	readonly sizes: string;
	readonly type: string;
	readonly purpose?: "any" | "maskable" | "monochrome";
}

export type ManifestDisplayMode =
	| "standalone"
	| "fullscreen"
	| "minimal-ui"
	| "browser";

export interface ManifestOptions {
	readonly name: string;
	readonly shortName: string;
	readonly description?: string;
	readonly startUrl?: string;
	readonly scope?: string;
	readonly display?: ManifestDisplayMode;
	readonly backgroundColor?: string;
	readonly themeColor?: string;
	readonly icons: ManifestIcon[];
}

export interface WebAppManifestIcon {
	src: string;
	sizes: string;
	type: string;
	purpose?: "any" | "maskable" | "monochrome";
}

export interface WebAppManifest {
	name: string;
	short_name: string;
	start_url: string;
	scope: string;
	display: ManifestDisplayMode;
	background_color: string;
	theme_color: string;
	icons: WebAppManifestIcon[];
	description?: string;
}

export interface CacheStrategyOptions {
	readonly cacheName: string;
	readonly cacheVersion: string;
	readonly precacheUrls: string[];
	readonly offlineFallbackUrl: string;
}

export interface ServiceWorkerOptions extends CacheStrategyOptions {
	readonly runtimeCachePatterns?: string[];
}
