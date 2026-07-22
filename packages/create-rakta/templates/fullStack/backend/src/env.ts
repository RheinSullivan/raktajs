function optionalEnv(envKey: string, fallbackValue: string): string {
	return process.env[envKey] ?? fallbackValue;
}

function requiredSecret(envKey: string, fallbackValue: string): string {
	const value = optionalEnv(envKey, fallbackValue);

	if (value.length < 32) {
		throw new Error(`${envKey} must be at least 32 characters long.`);
	}

	return value;
}

export const env = {
	port: Number(optionalEnv("PORT", "4000")),
	corsOrigin: optionalEnv("CORS_ORIGIN", "http://localhost:3000"),
	databaseUrl: optionalEnv("DATABASE_URL", "file:./database.sqlite"),
	authSecret: requiredSecret(
		"AUTH_SECRET",
		"change-this-development-secret-32-chars",
	),
	sessionMode: optionalEnv("SESSION_MODE", "single"),
} as const;
