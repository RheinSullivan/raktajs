export function requireString(
	input: Record<string, unknown>,
	key: string,
	minLength: number = 1,
): string {
	const value = input[key];

	if (typeof value !== "string" || value.trim().length < minLength) {
		throw new Error(`${key} must be at least ${minLength} characters.`);
	}

	return value.trim();
}
