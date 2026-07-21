import type { RaktaEnvironment, RaktaEnvironmentName } from "./types";

function readRuntimeEnv(): Record<string, string | undefined> {
	const processEnv = typeof process === "undefined" ? undefined : process.env;
	const bunEnv = typeof Bun === "undefined" ? undefined : Bun.env;

	return {
		...processEnv,
		...bunEnv,
	};
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
	if (value === undefined) {
		return fallback;
	}

	return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

export function createRaktaEnvironment(
	name?: RaktaEnvironmentName,
	env: Readonly<Record<string, string | undefined>> = readRuntimeEnv(),
): RaktaEnvironment {
	const resolvedName = name ?? env.RAKTA_ENV ?? env.NODE_ENV ?? "development";
	const snapshot = Object.fromEntries(
		Object.entries(env).filter(
			(entry): entry is [string, string] => entry[1] !== undefined,
		),
	);

	return {
		name: resolvedName,
		isDevelopment: resolvedName === "development",
		isProduction: resolvedName === "production",
		isTest: resolvedName === "test",

		get(key: string) {
			return snapshot[key];
		},

		require(key: string) {
			const value = snapshot[key];

			if (value === undefined || value.length === 0) {
				throw new Error(
					`Required Rakta environment variable "${key}" is missing.`,
				);
			}

			return value;
		},

		boolean(key: string, fallback = false) {
			return parseBoolean(snapshot[key], fallback);
		},

		number(key: string, fallback = 0) {
			const value = snapshot[key];

			if (value === undefined || value.length === 0) {
				return fallback;
			}

			const parsed = Number(value);

			if (!Number.isFinite(parsed)) {
				throw new Error(
					`Rakta environment variable "${key}" must be a finite number.`,
				);
			}

			return parsed;
		},

		snapshot() {
			return { ...snapshot };
		},
	};
}
