// RaktaSecurity - Content Security Policy builder

export interface CspDirectives {
	defaultSrc?: readonly string[];
	scriptSrc?: readonly string[];
	styleSrc?: readonly string[];
	imgSrc?: readonly string[];
	fontSrc?: readonly string[];
	connectSrc?: readonly string[];
	mediaSrc?: readonly string[];
	objectSrc?: readonly string[];
	frameSrc?: readonly string[];
	frameAncestors?: readonly string[];
	baseUri?: readonly string[];
	formAction?: readonly string[];
	upgradeInsecureRequests?: boolean;
	blockAllMixedContent?: boolean;
	reportUri?: string;
	reportTo?: string;
}

/**
 * Build a Content-Security-Policy header value from a structured config.
 *
 * @example
 * const csp = buildCsp({
 *   defaultSrc: ["'self'"],
 *   scriptSrc: ["'self'", "'nonce-abc123'"],
 *   upgradeInsecureRequests: true,
 * });
 */
export function buildCsp(directives: CspDirectives): string {
	const parts: string[] = [];

	const add = (name: string, values?: readonly string[]) => {
		if (values && values.length > 0) {
			parts.push(`${name} ${values.join(" ")}`);
		}
	};

	add("default-src", directives.defaultSrc);
	add("script-src", directives.scriptSrc);
	add("style-src", directives.styleSrc);
	add("img-src", directives.imgSrc);
	add("font-src", directives.fontSrc);
	add("connect-src", directives.connectSrc);
	add("media-src", directives.mediaSrc);
	add("object-src", directives.objectSrc);
	add("frame-src", directives.frameSrc);
	add("frame-ancestors", directives.frameAncestors);
	add("base-uri", directives.baseUri);
	add("form-action", directives.formAction);

	if (directives.upgradeInsecureRequests) {
		parts.push("upgrade-insecure-requests");
	}

	if (directives.blockAllMixedContent) {
		parts.push("block-all-mixed-content");
	}

	if (directives.reportUri) {
		parts.push(`report-uri ${directives.reportUri}`);
	}

	if (directives.reportTo) {
		parts.push(`report-to ${directives.reportTo}`);
	}

	return parts.join("; ");
}

/**
 * Generate a cryptographically random nonce for inline scripts/styles.
 */
export function generateCspNonce(): string {
	const bytes = new Uint8Array(16);
	crypto.getRandomValues(bytes);
	return btoa(String.fromCharCode(...bytes))
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");
}

/**
 * Returns a strict default CSP suitable for most Rakta.js apps.
 * Allows self-hosted assets only. Extend as needed.
 */
export function defaultCsp(nonce?: string): string {
	const scriptSrc = nonce ? ["'self'", `'nonce-${nonce}'`] : ["'self'"];

	return buildCsp({
		defaultSrc: ["'self'"],
		scriptSrc,
		styleSrc: ["'self'", "'unsafe-inline'"],
		imgSrc: ["'self'", "data:", "blob:"],
		fontSrc: ["'self'"],
		connectSrc: ["'self'"],
		objectSrc: ["'none'"],
		frameAncestors: ["'none'"],
		baseUri: ["'self'"],
		formAction: ["'self'"],
		upgradeInsecureRequests: true,
	});
}
