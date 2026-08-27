import {
	authenticate,
	login,
	logout,
	logoutAll,
	refreshTokens,
	requestPasswordOtp,
	resetPassword,
} from "../auth/auth.service";
import { readJson, readSessionCookie } from "../http/request";
import { created, fail, ok } from "../http/response";
import type { Gender, UserRole } from "../models/user.model";
import { createUser } from "../services/user.service";
import { requireString } from "../validation/auth.validation";

export async function registerController(request: Request): Promise<Response> {
	try {
		const body = await readJson(request);
		const firstName = requireString(body, "firstName", 1);
		const lastName = requireString(body, "lastName", 1);
		const email = requireString(body, "email", 5);
		const password = requireString(body, "password", 8);
		const role = (body.role as UserRole) || "USER";
		const gender = (body.gender as Gender) || "MALE";

		const user = await createUser({
			firstName,
			lastName,
			email,
			password,
			role,
			gender,
		});

		return created(user);
	} catch (error) {
		return fail(
			error instanceof Error ? error.message : "Registration failed.",
		);
	}
}

export async function loginController(request: Request): Promise<Response> {
	const body = await readJson(request);
	const rememberMe = body.rememberMe === true;

	const result = await login(
		requireString(body, "email", 5),
		requireString(body, "password", 1),
		rememberMe,
	);

	if (result === undefined) {
		return fail("Invalid credentials.", 401);
	}

	return Response.json(
		{
			success: true,
			data: {
				user: result.user,
				accessToken: result.accessToken,
				sessionId: result.sessionId,
			},
		},
		{
			headers: {
				"Set-Cookie": [result.cookie, result.refreshCookie].join(", "),
			},
		},
	);
}

export async function refreshController(request: Request): Promise<Response> {
	// Accept refresh token from cookie or body
	const cookieRefresh = request.headers
		.get("cookie")
		?.split(";")
		.map((c) => c.trim())
		.find((c) => c.startsWith("rakta_refresh="))
		?.slice("rakta_refresh=".length);

	const body: Record<string, unknown> = request.headers
		.get("content-type")
		?.includes("application/json")
		? await readJson(request).catch(() => ({}))
		: {};

	const bodyRefreshToken =
		typeof body.refreshToken === "string"
			? (body.refreshToken as string)
			: undefined;

	const refreshToken = cookieRefresh ?? bodyRefreshToken;

	if (!refreshToken) {
		return fail("Refresh token required.", 401);
	}

	const result = await refreshTokens(refreshToken);

	if (result === undefined) {
		return fail("Invalid or expired refresh token.", 401);
	}

	return Response.json(
		{
			success: true,
			data: {
				accessToken: result.accessToken,
				sessionId: result.sessionId,
			},
		},
		{
			headers: {
				"Set-Cookie": `rakta_session=${result.sessionId}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800`,
			},
		},
	);
}

export async function meController(request: Request): Promise<Response> {
	const user = await authenticate(request);
	return user === undefined ? fail("Unauthorized.", 401) : ok(user);
}

export function logoutController(request: Request): Response {
	const sessionId = readSessionCookie(request);

	if (sessionId !== undefined) {
		logout(sessionId);
	}

	return Response.json(
		{ success: true },
		{
			headers: {
				"Set-Cookie": [
					"rakta_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
					"rakta_refresh=; Path=/api/auth/refresh; HttpOnly; SameSite=Strict; Max-Age=0",
				].join(", "),
			},
		},
	);
}

export async function logoutAllController(request: Request): Promise<Response> {
	const user = await authenticate(request);
	if (!user) return fail("Unauthorized.", 401);

	logoutAll(user.id);

	return Response.json(
		{ success: true, message: "All sessions revoked." },
		{
			headers: {
				"Set-Cookie": [
					"rakta_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
					"rakta_refresh=; Path=/api/auth/refresh; HttpOnly; SameSite=Strict; Max-Age=0",
				].join(", "),
			},
		},
	);
}

export async function forgotPasswordController(
	request: Request,
): Promise<Response> {
	const body = await readJson(request);
	const otp = await requestPasswordOtp(requireString(body, "email", 5));
	return ok({ email: otp.email, expiresAt: otp.expiresAt });
}

export async function resetPasswordController(
	request: Request,
): Promise<Response> {
	const body = await readJson(request);
	const success = await resetPassword(
		requireString(body, "email", 5),
		requireString(body, "otp", 6),
		requireString(body, "password", 8),
	);
	return success ? ok({ reset: true }) : fail("Invalid OTP.", 422);
}
