// Simple in-memory rate limiter.
// For production use Redis or a distributed store.

interface RateLimitEntry {
	count: number;
	resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

export interface RateLimitOptions {
	/** Max requests per window */
	readonly max: number;
	/** Window duration in seconds (default: 60) */
	readonly windowSecs?: number;
}

/**
 * Check and increment rate limit for a key (e.g. IP address or user ID).
 * Returns true if the request is allowed, false if rate limited.
 */
export function checkRateLimit(
	key: string,
	options: RateLimitOptions,
): boolean {
	const windowSecs = options.windowSecs ?? 60;
	const now = Math.floor(Date.now() / 1000);

	const existing = store.get(key);

	if (existing === undefined || existing.resetAt <= now) {
		store.set(key, { count: 1, resetAt: now + windowSecs });
		return true;
	}

	if (existing.count >= options.max) {
		return false;
	}

	existing.count++;
	return true;
}

/**
 * Get the client IP from a Request (works with Bun's server context).
 */
export function getClientIp(request: Request): string {
	return (
		request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
		request.headers.get("x-real-ip") ??
		"unknown"
	);
}
