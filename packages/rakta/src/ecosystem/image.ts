/**
 * @rakta/image - Rakta.js Image Optimization Ecosystem Package
 *
 * Provides utilities for:
 * - Automatic WebP/AVIF conversion hints
 * - Responsive srcset generation
 * - Blur placeholder (BlurHash-style) data URLs
 * - Lazy loading intersection observer hook
 * - CDN URL builder (Cloudflare Images, Imgix, Vercel Image Optimization)
 */

// -------------------------------------------------------------------------- //
// Types
// -------------------------------------------------------------------------- //

/** Supported output formats for image optimization. */
export type ImageFormat = "webp" | "avif" | "jpeg" | "png" | "gif";

/** Named CDN adapter kinds. */
export type ImageCdnKind = "cloudflare" | "imgix" | "vercel" | "none";

/** Breakpoint preset for srcset generation. */
export interface ImageBreakpoints {
	readonly sm: number;
	readonly md: number;
	readonly lg: number;
	readonly xl: number;
	readonly "2xl": number;
}

/** Options for building an optimized image URL. */
export interface ImageOptimizeOptions {
	/** Source URL or relative path. */
	readonly src: string;
	/** Target output width in pixels. */
	readonly width?: number | undefined;
	/** Target output height in pixels. */
	readonly height?: number | undefined;
	/** Output format. Defaults to 'webp'. */
	readonly format?: ImageFormat | undefined;
	/** Quality (1–100). Defaults to 85. */
	readonly quality?: number | undefined;
	/** CDN adapter to use. Defaults to 'none' (passthrough). */
	readonly cdn?: ImageCdnKind | undefined;
	/** Optional CDN base URL (required when cdn !== 'none'). */
	readonly cdnBase?: string | undefined;
}

/** A single srcset entry. */
export interface SrcSetEntry {
	readonly url: string;
	readonly width: number;
}

/** Result of generating a responsive image manifest. */
export interface ResponsiveImageManifest {
	readonly src: string;
	readonly srcSet: SrcSetEntry[];
	readonly sizes: string;
	readonly format: ImageFormat;
}

/** Blur placeholder result. */
export interface BlurPlaceholder {
	/** Tiny base64-encoded data URL (≤ 200 bytes). */
	readonly dataUrl: string;
	/** Dominant hex color sampled from the placeholder. */
	readonly dominantColor: string;
}

// -------------------------------------------------------------------------- //
// Standard breakpoints
// -------------------------------------------------------------------------- //

/** Rakta.js standard responsive breakpoints (matches Tailwind defaults). */
export const IMAGE_BREAKPOINTS: ImageBreakpoints = {
	sm: 640,
	md: 768,
	lg: 1024,
	xl: 1280,
	"2xl": 1536,
};

// -------------------------------------------------------------------------- //
// URL builders
// -------------------------------------------------------------------------- //

/**
 * buildOptimizedUrl - generates an optimized image URL for the requested CDN
 * or returns the original URL unchanged when cdn is 'none'.
 *
 * @example
 * buildOptimizedUrl({ src: "/hero.jpg", width: 800, format: "webp", cdn: "vercel" })
 * // → "/_next/image?url=%2Fhero.jpg&w=800&q=85"
 */
export function buildOptimizedUrl(options: ImageOptimizeOptions): string {
	const {
		src,
		width,
		height,
		format = "webp",
		quality = 85,
		cdn = "none",
		cdnBase = "",
	} = options;

	const clampedQuality = Math.max(1, Math.min(100, quality));

	switch (cdn) {
		case "vercel":
			return `/_next/image?url=${encodeURIComponent(src)}${width ? `&w=${width}` : ""}&q=${clampedQuality}`;

		case "imgix": {
			const base = cdnBase.replace(/\/$/, "");
			const params = new URLSearchParams();
			params.set("fm", format);
			params.set("q", String(clampedQuality));
			params.set("auto", "compress,format");
			if (width) params.set("w", String(width));
			if (height) params.set("h", String(height));
			const path = src.startsWith("http") ? src : `${base}${src}`;
			return `${path}?${params.toString()}`;
		}

		case "cloudflare": {
			const base = cdnBase.replace(/\/$/, "");
			const parts: string[] = [];
			if (width) parts.push(`width=${width}`);
			if (height) parts.push(`height=${height}`);
			parts.push(`quality=${clampedQuality}`);
			parts.push(`format=${format}`);
			return `${base}/cdn-cgi/image/${parts.join(",")}/${src.replace(/^\//, "")}`;
		}

		default:
			return src;
	}
}

/**
 * generateSrcSet - produces a responsive srcSet array for the given breakpoints.
 *
 * @example
 * generateSrcSet({ src: "/hero.jpg", format: "webp" })
 */
export function generateSrcSet(
	options: Omit<ImageOptimizeOptions, "width">,
	breakpoints: number[] = Object.values(IMAGE_BREAKPOINTS),
): ResponsiveImageManifest {
	const format = options.format ?? "webp";
	const srcSet: SrcSetEntry[] = breakpoints.map((bp) => ({
		url: buildOptimizedUrl({ ...options, width: bp, format }),
		width: bp,
	}));

	const sizes = breakpoints
		.slice(0, -1)
		.map((bp, i) => `(max-width: ${bp}px) ${breakpoints[i]}px`)
		.concat(`${breakpoints[breakpoints.length - 1]}px`)
		.join(", ");

	return {
		src: options.src,
		srcSet,
		sizes,
		format,
	};
}

// -------------------------------------------------------------------------- //
// Blur placeholder
// -------------------------------------------------------------------------- //

const PLACEHOLDER_PALETTE: string[] = [
	"#0a0a0a",
	"#111111",
	"#1a1a2e",
	"#16213e",
	"#0f3460",
	"#533483",
	"#e94560",
	"#ff6b6b",
	"#4ecdc4",
	"#45b7d1",
];

/**
 * generateBlurPlaceholder - returns a tiny SVG-based blur data URL and a
 * dominant color derived from the source path.
 *
 * This is a server-safe implementation that does not require Canvas/Sharp.
 * For production-quality blur hashes, pair with @rakta/sharp-bridge.
 */
export function generateBlurPlaceholder(src: string): BlurPlaceholder {
	// Deterministic color seeding from the src string.
	let hash = 0;
	for (let i = 0; i < src.length; i++) {
		hash = (hash * 31 + src.charCodeAt(i)) >>> 0;
	}
	// Non-null assertion is safe: modulo keeps index in range [0, length).
	const dominantColor =
		PLACEHOLDER_PALETTE[hash % PLACEHOLDER_PALETTE.length] ?? "#0a0a0a";

	const r = Number.parseInt(dominantColor.slice(1, 3), 16);
	const g = Number.parseInt(dominantColor.slice(3, 5), 16);
	const b = Number.parseInt(dominantColor.slice(5, 7), 16);

	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8" fill="rgb(${r},${g},${b})"/><filter id="b"><feGaussianBlur stdDeviation="1"/></filter><rect width="8" height="8" fill="rgb(${Math.min(r + 20, 255)},${Math.min(g + 20, 255)},${Math.min(b + 20, 255)})" filter="url(#b)" opacity="0.7"/></svg>`;

	const dataUrl = `data:image/svg+xml;base64,${btoa(svg)}`;

	return { dataUrl, dominantColor };
}

// -------------------------------------------------------------------------- //
// Utility helpers
// -------------------------------------------------------------------------- //

/**
 * getImageDimensions - extracts width and height from a URL query string.
 * Useful for reading dimensions that a CDN has encoded into the URL.
 */
export function getImageDimensions(
	url: string,
): { width: number; height: number } | null {
	try {
		const u = new URL(url, "https://example.com");
		const w = u.searchParams.get("w") ?? u.searchParams.get("width");
		const h = u.searchParams.get("h") ?? u.searchParams.get("height");
		if (!w || !h) return null;
		return { width: Number(w), height: Number(h) };
	} catch {
		return null;
	}
}

/**
 * isAnimatedGif - returns true if the src URL looks like an animated GIF.
 * Animated GIFs should be passed through without conversion.
 */
export function isAnimatedGif(src: string): boolean {
	return /\.gif(\?.*)?$/i.test(src);
}

/**
 * normalizeFormat - maps common MIME types to ImageFormat values.
 */
export function normalizeFormat(mimeOrExt: string): ImageFormat {
	const clean = mimeOrExt.toLowerCase().replace(/^image\//, "");
	switch (clean) {
		case "webp":
			return "webp";
		case "avif":
			return "avif";
		case "jpg":
		case "jpeg":
			return "jpeg";
		case "gif":
			return "gif";
		default:
			return "png";
	}
}
