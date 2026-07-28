import type { Context } from "gaman";

/**
 * Extract a standard Web Request from a Gaman.js v2.x Context.
 * Gaman v2.x exposes context.request as a Requester (Bun Request subclass).
 */
export function requestFromContext(c: Context): Request {
	// context.request is Bun's Request in Gaman v2.x
	if (c.request instanceof Request) {
		return c.request;
	}

	// Fallback: reconstruct from path + method
	const pathname = (c.path ?? "/").startsWith("http")
		? c.path
		: `http://localhost${c.path ?? "/"}`;

	return new Request(pathname, {
		method: (c.request as { method?: string }).method ?? "GET",
	});
}
