// RaktaOps - Response headers utilities

/**
 * Merge multiple HeadersInit sources into a single Headers object.
 */
export function mergeHeaders(...sources: (HeadersInit | undefined)[]): Headers {
	const merged = new Headers();

	for (const source of sources) {
		if (!source) {
			continue;
		}

		const h = new Headers(source);

		for (const [key, value] of h.entries()) {
			merged.set(key, value);
		}
	}

	return merged;
}

/**
 * Convert a Headers object to a plain record.
 */
export function headersToRecord(headers: Headers): Record<string, string> {
	const record: Record<string, string> = {};

	for (const [key, value] of headers.entries()) {
		record[key] = value;
	}

	return record;
}

/**
 * Create a JSON response with the given data and optional headers/status.
 */
export function jsonResponse(
	data: unknown,
	init: { status?: number; headers?: HeadersInit } = {},
): Response {
	const headers = new Headers(init.headers);
	headers.set("Content-Type", "application/json");
	headers.set("X-Powered-By", "Rakta.js");

	return new Response(JSON.stringify(data), {
		status: init.status ?? 200,
		headers,
	});
}

/**
 * Create a redirect response.
 */
export function redirectResponse(
	location: string,
	status: 301 | 302 | 307 | 308 = 302,
): Response {
	return new Response(null, {
		status,
		headers: { Location: location },
	});
}
