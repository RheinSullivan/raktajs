import { env } from "../env";

export interface JwtPayload {
	readonly sub: string;
	readonly email: string;
	readonly sessionId: string;
	readonly exp: number;
}

function encodeBase64Url(value: string | ArrayBuffer): string {
	const bytes =
		typeof value === "string"
			? new TextEncoder().encode(value)
			: new Uint8Array(value);

	return btoa(String.fromCharCode(...bytes))
		.replaceAll("+", "-")
		.replaceAll("/", "_")
		.replaceAll("=", "");
}

function decodeBase64Url(value: string): string {
	const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
	const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
	return atob(padded);
}

async function signingKey(): Promise<CryptoKey> {
	return crypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(env.authSecret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
}

export async function signJwt(payload: JwtPayload): Promise<string> {
	const header = encodeBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
	const body = encodeBase64Url(JSON.stringify(payload));
	const signature = await crypto.subtle.sign(
		"HMAC",
		await signingKey(),
		new TextEncoder().encode(`${header}.${body}`),
	);

	return `${header}.${body}.${encodeBase64Url(signature)}`;
}

export async function verifyJwt(
	token: string,
): Promise<JwtPayload | undefined> {
	const [header, body, signature] = token.split(".");

	if (header === undefined || body === undefined || signature === undefined) {
		return undefined;
	}

	const expectedSignature = await crypto.subtle.sign(
		"HMAC",
		await signingKey(),
		new TextEncoder().encode(`${header}.${body}`),
	);

	if (encodeBase64Url(expectedSignature) !== signature) {
		return undefined;
	}

	const payload = JSON.parse(decodeBase64Url(body)) as JwtPayload;
	return payload.exp > Math.floor(Date.now() / 1000) ? payload : undefined;
}
