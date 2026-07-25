import { API_URL } from "./http";

export type UserRole = "ADMIN" | "USER" | "GUEST";
export type Gender = "MALE" | "FEMALE" | "OTHER";

export interface AuthResult {
	user: {
		id: string;
		firstName: string;
		lastName: string;
		name: string;
		email: string;
		role: UserRole;
		gender: Gender;
	};
	token: string;
	sessionId: string;
}

export interface RegisterUserInput {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	role: UserRole;
	gender: Gender;
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
		success: boolean;
		data?: TData;
		error?: string;
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

export function registerUser(input: RegisterUserInput) {
	return postJson("/api/auth/register", input);
}

export function requestPasswordOtp(email: string) {
	return postJson<{ otp: string; expiresAt: number }>(
		"/api/auth/forgot-password",
		{ email },
	);
}

export function resetPasswordWithOtp(input: {
	email: string;
	otp: string;
	newPassword: string;
}) {
	return postJson("/api/auth/reset-password", input);
}

export function resetPassword(email: string, otp: string, password: string) {
	return resetPasswordWithOtp({ email, otp, newPassword: password });
}
