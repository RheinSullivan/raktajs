import { API_URL } from "./http";

export interface AuthResult {
	readonly user: {
		readonly id: string;
		readonly name: string;
		readonly email: string;
		readonly role: string;
	};
	readonly token: string;
	readonly sessionId: string;
}

async function postJson<TData>(
	path: string,
	body: Record<string, unknown>,
): Promise<TData> {
	const response = await fetch(`${API_URL}${path}`, {
		method: "POST",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	});

	const payload = (await response.json()) as {
		readonly success: boolean;
		readonly data?: TData;
		readonly error?: string;
	};

	if (!response.ok || !payload.success || payload.data === undefined) {
		throw new Error(payload.error ?? `Request failed with ${response.status}`);
	}

	return payload.data;
}

export function loginUser(
	email: string,
	password: string,
): Promise<AuthResult> {
	return postJson<AuthResult>("/api/auth/login", { email, password });
}

export function registerUser(input: {
	readonly name: string;
	readonly email: string;
	readonly password: string;
}) {
	return postJson("/api/auth/register", input);
}

export function requestPasswordOtp(email: string) {
	return postJson<{ readonly otp: string; readonly expiresAt: number }>(
		"/api/auth/forgot-password",
		{ email },
	);
}

export function resetPassword(email: string, otp: string, password: string) {
	return postJson("/api/auth/reset-password", { email, otp, password });
}
