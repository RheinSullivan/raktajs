interface OtpRecord {
	readonly email: string;
	readonly code: string;
	readonly expiresAt: number;
}

const otps = new Map<string, OtpRecord>();

export function createOtp(email: string): OtpRecord {
	const code = String(crypto.getRandomValues(new Uint32Array(1))[0] ?? 0)
		.padStart(6, "0")
		.slice(0, 6);
	const record = {
		email,
		code,
		expiresAt: Date.now() + 1000 * 60 * 10,
	};

	otps.set(email, record);
	return record;
}

export function verifyOtp(email: string, code: string): boolean {
	const record = otps.get(email);

	if (record === undefined || record.expiresAt <= Date.now()) {
		otps.delete(email);
		return false;
	}

	if (record.code !== code) {
		return false;
	}

	otps.delete(email);
	return true;
}
