export async function hashPassword(password: string): Promise<string> {
	return Bun.password.hash(password, {
		algorithm: "argon2id",
		memoryCost: 19_456,
		timeCost: 2,
	});
}

export function verifyPassword(
	password: string,
	hash: string,
): Promise<boolean> {
	return Bun.password.verify(password, hash);
}
