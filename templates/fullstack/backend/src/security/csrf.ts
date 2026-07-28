// CSRF protection — double-submit cookie pattern.
// Stateless, no server storage required.

const CSRF_HEADER = "x-csrf-token";
const CSRF_COOKIE = "rakta_csrf";
const CSRF_TTL_SECONDS = 60 * 60; // 1 hour

function generateToken(): string {
	const bytes = new Uint8Array(32);
	crypto.getRandomValues(bytes);
	return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Issue a CSRF token. Store in a non-HttpOnly cookie so JavaScript can read it.
 */
export function issueCsrfToken(): {
	token: string;
	cookie: string;
} {
	const token = generateToken();
	const cookie = `${CSRF_COOKIE}=${token}; SameSite=Strict; Path=/; Max-Age=${CSRF_TTL_SECONDS}`;
	return { token, cookie };
}

/**
 * Validate a CSRF token from a request.
 * Compares X-CSRF-Token header with rakta_csrf cookie (double-submit).
 */
export function validateCsrfToken(request: Request): boolean {
	// Skip CSRF for safe methods
	if (["GET", "HEAD", "OPTIONS"].includes(request.method.toUpperCase())) {
		return true;
	}

	const headerToken = request.headers.get(CSRF_HEADER);
	const cookieToken = request.headers
		.get("cookie")
		?.split(";")
		.find((c) => c.trim().startsWith(`${CSRF_COOKIE}=`))
		?.split("=")[1]
		?.trim();

	if (!headerToken || !cookieToken) return false;
	return headerToken === cookieToken;
}
