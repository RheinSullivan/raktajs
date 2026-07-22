import {
	authenticate,
	login,
	logout,
	requestPasswordOtp,
	resetPassword,
} from "../auth/auth.service";
import { readJson, readSessionCookie } from "../http/request";
import { created, fail, ok } from "../http/response";
import { createUser } from "../services/user.service";
import { requireString } from "../validation/auth.validation";

export async function registerController(request: Request): Promise<Response> {
	try {
		const body = await readJson(request);
		const user = await createUser({
			name: requireString(body, "name", 2),
			email: requireString(body, "email", 5),
			password: requireString(body, "password", 8),
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
	const result = await login(
		requireString(body, "email", 5),
		requireString(body, "password", 1),
	);

	if (result === undefined) {
		return fail("Invalid credentials.", 401);
	}

	return Response.json(
		{ success: true, data: result },
		{ headers: { "Set-Cookie": result.cookie } },
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
				"Set-Cookie":
					"rakta_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0",
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
