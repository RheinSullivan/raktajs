// RaktaAuth - TOTP Two-Factor Authentication (RFC 6238)
// No external dependencies - uses WebCrypto HMAC-SHA1.

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32Decode(encoded: string): Uint8Array<ArrayBuffer> {
	const normalized = encoded.toUpperCase().replace(/=+$/, "");
	const bits: number[] = [];

	for (const character of normalized) {
		const charValue = BASE32_ALPHABET.indexOf(character);
		if (charValue === -1) continue;
		for (let bitOffset = 4; bitOffset >= 0; bitOffset--) {
			bits.push((charValue >> bitOffset) & 1);
		}
	}

	const result = new Uint8Array(
		Math.floor(bits.length / 8),
	) as Uint8Array<ArrayBuffer>;
	for (let byteIndex = 0; byteIndex < result.length; byteIndex++) {
		let byteValue = 0;
		for (let bitIndex = 0; bitIndex < 8; bitIndex++) {
			byteValue = (byteValue << 1) | (bits[byteIndex * 8 + bitIndex] ?? 0);
		}
		result[byteIndex] = byteValue;
	}

	return result;
}

function base32Encode(bytes: Uint8Array): string {
	let result = "";
	let buffer = 0;
	let bitsLeft = 0;

	for (const byte of bytes) {
		buffer = (buffer << 8) | byte;
		bitsLeft += 8;
		while (bitsLeft >= 5) {
			bitsLeft -= 5;
			result += BASE32_ALPHABET[(buffer >> bitsLeft) & 31];
		}
	}

	if (bitsLeft > 0) {
		result += BASE32_ALPHABET[(buffer << (5 - bitsLeft)) & 31];
	}

	return result;
}

async function hmacSha1(
	keyBytes: Uint8Array<ArrayBuffer>,
	messageBytes: Uint8Array<ArrayBuffer>,
): Promise<Uint8Array> {
	const cryptoKey = await crypto.subtle.importKey(
		"raw",
		keyBytes,
		{ name: "HMAC", hash: "SHA-1" },
		false,
		["sign"],
	);

	const signatureBuffer = await crypto.subtle.sign(
		"HMAC",
		cryptoKey,
		messageBytes,
	);
	return new Uint8Array(signatureBuffer);
}

async function hotp(
	secretBytes: Uint8Array<ArrayBuffer>,
	counter: number,
): Promise<number> {
	const counterBytes = new Uint8Array(8) as Uint8Array<ArrayBuffer>;
	let remaining = counter;
	for (let byteIndex = 7; byteIndex >= 0; byteIndex--) {
		counterBytes[byteIndex] = remaining & 0xff;
		remaining = Math.floor(remaining / 256);
	}

	const hmacResult = await hmacSha1(secretBytes, counterBytes);
	const offset = (hmacResult[19] ?? 0) & 0xf;
	const truncated =
		(((hmacResult[offset] ?? 0) & 0x7f) << 24) |
		(((hmacResult[offset + 1] ?? 0) & 0xff) << 16) |
		(((hmacResult[offset + 2] ?? 0) & 0xff) << 8) |
		((hmacResult[offset + 3] ?? 0) & 0xff);

	return truncated % 1_000_000;
}

/**
 * Generate a random 20-byte TOTP secret, base32-encoded.
 */
export function generateTotpSecret(): string {
	const secretBytes = new Uint8Array(20);
	crypto.getRandomValues(secretBytes);
	return base32Encode(secretBytes);
}

/**
 * Generate a TOTP URI for QR code generation.
 */
export function generateTotpUri(
	secret: string,
	email: string,
	issuer: string,
): string {
	const label = encodeURIComponent(`${issuer}:${email}`);
	const params = new URLSearchParams({
		secret: secret.toUpperCase(),
		issuer,
		algorithm: "SHA1",
		digits: "6",
		period: "30",
	});

	return `otpauth://totp/${label}?${params.toString()}`;
}

/**
 * Verify a 6-digit TOTP token. Allows 1 time-step of clock drift.
 */
export async function verifyTotp(
	token: string,
	secret: string,
	window = 1,
): Promise<boolean> {
	const normalizedToken = token.replace(/\s/g, "");
	if (!/^\d{6}$/.test(normalizedToken)) return false;

	const secretBytes = base32Decode(secret);
	const currentStep = Math.floor(Date.now() / 1000 / 30);
	const tokenNumber = parseInt(normalizedToken, 10);

	for (let stepOffset = -window; stepOffset <= window; stepOffset++) {
		const expectedToken = await hotp(secretBytes, currentStep + stepOffset);
		if (expectedToken === tokenNumber) return true;
	}

	return false;
}

/**
 * Generate backup codes for account recovery.
 */
export function generateBackupCodes(count = 10): readonly string[] {
	const codes: string[] = [];
	const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

	for (let codeIndex = 0; codeIndex < count; codeIndex++) {
		const codeBytes = new Uint8Array(8);
		crypto.getRandomValues(codeBytes);
		const code = Array.from(codeBytes)
			.map((byte) => characters[byte % characters.length] ?? "A")
			.join("");
		codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
	}

	return codes;
}

/**
 * Verify a backup code against stored codes.
 */
export function verifyBackupCode(
	submittedCode: string,
	storedCodes: readonly string[],
): boolean {
	const normalized = submittedCode.replace(/-/g, "").toUpperCase();
	return storedCodes.some(
		(storedCode) => storedCode.replace(/-/g, "").toUpperCase() === normalized,
	);
}
