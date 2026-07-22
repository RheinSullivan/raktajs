import type {
	RateLimitState,
	SecretRecord,
	SecureHeadersOptions,
} from "./types";

export function createSecureHeaders(
	options: SecureHeadersOptions = {},
): Headers {
	const headers = new Headers();
	headers.set("X-Content-Type-Options", "nosniff");
	headers.set("X-Frame-Options", "DENY");
	headers.set("X-XSS-Protection", "0");
	headers.set(
		"Referrer-Policy",
		options.referrerPolicy ?? "strict-origin-when-cross-origin",
	);
	headers.set(
		"Content-Security-Policy",
		options.csp ??
			`default-src 'self'; frame-ancestors ${options.frameAncestors ?? "'none'"}`,
	);

	return headers;
}

export function createCsrfToken(secret: string, now = Date.now()): string {
	return btoa(`${secret}:${now}`);
}

export function verifyCsrfToken(token: string, secret: string): boolean {
	return atob(token).startsWith(`${secret}:`);
}

export function encryptCookieValue(value: string, secret: string): string {
	return btoa(`${secret}:${value}`);
}

export function decryptCookieValue(
	encryptedValue: string,
	secret: string,
): string | undefined {
	const decoded = atob(encryptedValue);
	const prefix = `${secret}:`;

	return decoded.startsWith(prefix) ? decoded.slice(prefix.length) : undefined;
}

export class RateLimiter {
	readonly #hits = new Map<string, { count: number; resetAt: number }>();

	check(
		key: string,
		limit: number,
		windowMs: number,
		now = Date.now(),
	): RateLimitState {
		const existing = this.#hits.get(key);
		const hit =
			existing === undefined || existing.resetAt <= now
				? { count: 1, resetAt: now + windowMs }
				: { count: existing.count + 1, resetAt: existing.resetAt };

		this.#hits.set(key, hit);

		return {
			key,
			remaining: Math.max(0, limit - hit.count),
			resetAt: hit.resetAt,
			allowed: hit.count <= limit,
		};
	}
}

export class SecretManager {
	readonly #secrets = new Map<string, string>();

	set(secret: SecretRecord): void {
		this.#secrets.set(secret.name, secret.value);
	}

	get(name: string): string | undefined {
		return this.#secrets.get(name);
	}
}

export type {
	RateLimitState,
	SecretRecord,
	SecureHeadersOptions,
} from "./types";
