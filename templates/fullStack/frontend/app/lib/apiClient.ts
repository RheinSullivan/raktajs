// Typed backend client for the generated Gaman.js API.
// Functions in this file are exposed through Rakta.js Auto Import.

export const API_URL =
	typeof window === "undefined"
		? "http://localhost:4000"
		: window.location.origin.replace(/:3000$/, ":4000");

interface ApiEnvelope<TData> {
	readonly success?: boolean;
	readonly data?: TData;
	readonly error?: string;
	readonly message?: string;
}

export interface AuthUser {
	readonly id: string;
	readonly firstName?: string;
	readonly lastName?: string;
	readonly name: string;
	readonly email: string;
	readonly role: UserRole | string;
	readonly gender?: Gender | string;
}

export interface AuthResult {
	readonly user: AuthUser;
	readonly accessToken?: string;
	readonly token: string;
	readonly sessionId: string;
}

export interface RegisterUserInput {
	readonly firstName: string;
	readonly lastName: string;
	readonly email: string;
	readonly password: string;
	readonly role: UserRole;
	readonly gender: Gender;
}

export interface CmsPost {
	readonly id: string;
	readonly title: string;
	readonly status?: string;
	readonly content?: string;
	readonly body?: string;
	readonly authorId?: string;
	readonly createdAt?: string;
}

async function parseEnvelope<TData>(response: Response): Promise<TData> {
	const payload = (await response
		.json()
		.catch(() => ({}))) as ApiEnvelope<TData>;

	if (!response.ok || payload.success === false) {
		throw new Error(
			payload.error ?? payload.message ?? `Request failed (${response.status})`,
		);
	}

	return (payload.data ?? payload) as TData;
}

export async function apiGet<TData>(path: string): Promise<TData> {
	const response = await fetch(`${API_URL}${path}`, {
		credentials: "include",
	});

	return parseEnvelope<TData>(response);
}

export async function loginUser(
	email: string,
	password: string,
): Promise<AuthResult> {
	const response = await fetch(`${API_URL}/api/auth/login`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify({ email, password }),
	});

	const result = await parseEnvelope<{
		user: AuthUser;
		accessToken: string;
		sessionId: string;
	}>(response);

	return {
		user: result.user,
		accessToken: result.accessToken,
		token: result.accessToken,
		sessionId: result.sessionId,
	};
}

export async function registerUser(
	input: RegisterUserInput,
): Promise<AuthUser> {
	const response = await fetch(`${API_URL}/api/auth/register`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify(input),
	});

	return parseEnvelope<AuthUser>(response);
}

export async function requestPasswordOtp(
	email: string,
): Promise<{ otp: string; expiresAt: number }> {
	const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify({ email }),
	});

	const result = await parseEnvelope<{ email: string; expiresAt: number }>(
		response,
	);

	return {
		otp: "Check backend console",
		expiresAt: result.expiresAt,
	};
}

export async function resetPassword(
	email: string,
	otp: string,
	password: string,
): Promise<{ reset: boolean }> {
	const response = await fetch(`${API_URL}/api/auth/reset-password`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify({ email, otp, password }),
	});

	return parseEnvelope<{ reset: boolean }>(response);
}

export async function resetPasswordWithOtp(input: {
	readonly email: string;
	readonly otp: string;
	readonly newPassword: string;
}): Promise<{ reset: boolean }> {
	return resetPassword(input.email, input.otp, input.newPassword);
}

export async function getProfile(token: string): Promise<AuthUser> {
	const response = await fetch(`${API_URL}/api/auth/me`, {
		headers: { Authorization: `Bearer ${token}` },
		credentials: "include",
	});

	return parseEnvelope<AuthUser>(response);
}

export async function fetchUsers(token: string): Promise<AuthUser[]> {
	const response = await fetch(`${API_URL}/api/users`, {
		headers: { Authorization: `Bearer ${token}` },
		credentials: "include",
	});

	return parseEnvelope<AuthUser[]>(response);
}

export async function fetchPosts(): Promise<CmsPost[]> {
	return apiGet<CmsPost[]>("/api/cms/posts");
}

export async function createPost(
	post: { readonly title: string; readonly body: string },
	token: string,
): Promise<CmsPost> {
	const response = await fetch(`${API_URL}/api/cms/posts`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		credentials: "include",
		body: JSON.stringify(post),
	});

	return parseEnvelope<CmsPost>(response);
}
