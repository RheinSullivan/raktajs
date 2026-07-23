import type { ManifestOptions, WebAppManifest } from "./types";

/**
 * ShrimpHarbor - generates a web app manifest object for PWA installability.
 * Serialize with JSON.stringify and serve as /manifest.webmanifest.
 */
export function generateManifest(options: ManifestOptions): WebAppManifest {
	const manifestObject: WebAppManifest = {
		name: options.name,
		short_name: options.shortName,
		start_url: options.startUrl ?? "/",
		scope: options.scope ?? "/",
		display: options.display ?? "standalone",
		background_color: options.backgroundColor ?? "#050505",
		theme_color: options.themeColor ?? "#dc2626",
		icons: options.icons.map((icon) => {
			const manifestIcon = {
				src: icon.src,
				sizes: icon.sizes,
				type: icon.type,
			};

			if (icon.purpose !== undefined) {
				return {
					...manifestIcon,
					purpose: icon.purpose,
				};
			}

			return manifestIcon;
		}),
	};

	if (options.description !== undefined) {
		return {
			...manifestObject,
			description: options.description,
		};
	}

	return manifestObject;
}

/** Serializes the manifest to a JSON string ready to write to disk or serve. */
export function generateManifestJson(options: ManifestOptions): string {
	return JSON.stringify(generateManifest(options), undefined, 2);
}

/** Creates a Bun/Tide-compatible request handler that serves the manifest. */
export function createManifestHandler(
	options: ManifestOptions,
): () => Response {
	return () => {
		const manifestJson = generateManifestJson(options);

		return new Response(manifestJson, {
			status: 200,
			headers: {
				"Content-Type": "application/manifest+json; charset=utf-8",
				"Cache-Control": "public, max-age=3600",
			},
		});
	};
}
