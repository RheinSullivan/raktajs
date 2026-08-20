// RaktaOps - Cookie utilities
// Parse, get, set, and delete cookies from Request/Response.

export interface CookieOptions {
	readonly maxAge?: number; // seconds
	readonly expires?: Date;
	readonly path?: string;
	readonly domain?: string;
	readonly secure?: boolean;
	readonly httpOnly?: boolean;
	readonly sameSite?: "Strict" | "Lax" | "None";
}

function safeDecodeCookieValue(val: string): string {
	try {
		return decodeURIComponent(val);
	} catch {
		return val;
	}
}

/**
 * Parse all cookies from a Request header into a Map.
 */
export function parseCookies(request: Request): Map<string, string> {
	const header = request.headers.get("cookie") ?? "";
	const map = new Map<string, string>();

	for (const pair of header.split(";")) {
		const equalsIndex = pair.indexOf("=");

		if (equalsIndex === -1) {
			continue;
		}

		const name = pair.slice(0, equalsIndex).trim();
		const value = pair.slice(equalsIndex + 1).trim();

		if (name) {
			map.set(name, safeDecodeCookieValue(value));
		}
	}

	return map;
}

/**
 * Get a single cookie value from the request.
 */
export function getCookie(request: Request, name: string): string | undefined {
	return parseCookies(request).get(name);
}

/**
 * Serialize a cookie into a Set-Cookie header value.
 */
export function serializeCookie(
	name: string,
	value: string,
	options: CookieOptions = {},
): string {
	let cookie = `${name}=${encodeURIComponent(value)}`;

	if (options.maxAge !== undefined) {
		cookie += `; Max-Age=${options.maxAge}`;
	}

	if (options.expires) {
		cookie += `; Expires=${options.expires.toUTCString()}`;
	}

	if (options.path !== undefined) {
		cookie += `; Path=${options.path}`;
	} else {
		cookie += "; Path=/";
	}

	if (options.domain) {
		cookie += `; Domain=${options.domain}`;
	}

	if (options.secure) {
		cookie += "; Secure";
	}

	if (options.httpOnly !== false) {
		cookie += "; HttpOnly";
	}

	if (options.sameSite) {
		cookie += `; SameSite=${options.sameSite}`;
	}

	return cookie;
}

/**
 * Set a cookie on a Response.
 */
export function setCookie(
	response: Response,
	name: string,
	value: string,
	options?: CookieOptions,
): Response {
	const headers = new Headers(response.headers);
	headers.append("Set-Cookie", serializeCookie(name, value, options));

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers,
	});
}

/**
 * Delete a cookie by setting Max-Age=0.
 */
export function deleteCookie(response: Response, name: string): Response {
	return setCookie(response, name, "", { maxAge: 0, path: "/" });
}
