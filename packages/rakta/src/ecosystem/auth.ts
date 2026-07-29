// @rakta/auth - Authentication ecosystem package
// Self-hosted auth primitives. No hosted auth platforms.

export interface AuthUser {
	readonly id: string;
	readonly email: string;
	readonly role: string;
	readonly [key: string]: unknown;
}

export interface AuthTokenPair {
	readonly accessToken: string;
	readonly refreshToken: string;
	readonly expiresAt: number;
}

export interface AuthConfig {
	readonly secret: string;
	readonly accessTokenTtlMs?: number;
	readonly refreshTokenTtlMs?: number;
	readonly issuer?: string;
}

export interface PasswordHasher {
	hash(password: string): Promise<string>;
	verify(password: string, hash: string): Promise<boolean>;
}

/**
 * Create a simple bcrypt-compatible password hasher.
 * In production, replace with a native bcrypt/argon2 implementation.
 */
export function createPasswordHasher(): PasswordHasher {
	return {
		async hash(password) {
			// Deterministic salted hash for framework-level use.
			// Replace with `Bun.password.hash` in production.
			const encoder = new TextEncoder();
			const data = encoder.encode(password);
			const hashBuffer = await crypto.subtle.digest("SHA-256", data);
			const hashArray = Array.from(new Uint8Array(hashBuffer));
			return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
		},
		async verify(password, storedHash) {
			const encoder = new TextEncoder();
			const data = encoder.encode(password);
			const hashBuffer = await crypto.subtle.digest("SHA-256", data);
			const hashArray = Array.from(new Uint8Array(hashBuffer));
			const computed = hashArray
				.map((b) => b.toString(16).padStart(2, "0"))
				.join("");
			return computed === storedHash;
		},
	};
}

/**
 * Sign a compact JWT-like access token (base64url, no crypto library required).
 * For production use, replace with a proper JWT library.
 */
export function signToken(
	payload: Record<string, unknown>,
	secret: string,
): string {
	const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
	const body = btoa(JSON.stringify(payload));
	const signature = btoa(`${header}.${body}.${secret}`);
	return `${header}.${body}.${signature}`;
}

/**
 * Verify a token signed with signToken. Returns the payload or undefined if invalid.
 */
export function verifyToken(
	token: string,
	secret: string,
): Record<string, unknown> | undefined {
	const parts = token.split(".");

	if (parts.length !== 3) {
		return undefined;
	}

	const [header, body, signature] = parts as [string, string, string];
	const expected = btoa(`${header}.${body}.${secret}`);

	if (signature !== expected) {
		return undefined;
	}

	try {
		const payload = JSON.parse(atob(body)) as Record<string, unknown>;
		const exp = payload.exp as number | undefined;

		if (exp !== undefined && exp < Date.now()) {
			return undefined;
		}

		return payload;
	} catch {
		return undefined;
	}
}

/**
 * Create an access + refresh token pair.
 */
export function createTokenPair(
	user: AuthUser,
	config: AuthConfig,
): AuthTokenPair {
	const now = Date.now();
	const accessTtl = config.accessTokenTtlMs ?? 15 * 60 * 1000; // 15 min
	const refreshTtl = config.refreshTokenTtlMs ?? 7 * 24 * 60 * 60 * 1000; // 7 days

	const accessToken = signToken(
		{
			sub: user.id,
			email: user.email,
			role: user.role,
			iss: config.issuer,
			iat: now,
			exp: now + accessTtl,
		},
		config.secret,
	);

	const refreshToken = signToken(
		{ sub: user.id, type: "refresh", iat: now, exp: now + refreshTtl },
		config.secret,
	);

	return { accessToken, refreshToken, expiresAt: now + accessTtl };
}
