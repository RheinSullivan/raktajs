export interface SecureHeadersOptions {
	readonly csp?: string;
	readonly frameAncestors?: string;
	readonly referrerPolicy?: string;
}

export interface RateLimitState {
	readonly key: string;
	readonly remaining: number;
	readonly resetAt: number;
	readonly allowed: boolean;
}

export interface SecretRecord {
	readonly name: string;
	readonly value: string;
}
