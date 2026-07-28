import { env } from "../env";
import type { PublicUser } from "../models/user.model";
import { toPublicUser } from "../models/user.model";
import {
	rotateRefreshToken,
	signAccessToken,
	signRefreshToken,
	verifyJwt,
} from "../security/jwt";
import { verifyPassword } from "../security/password";
import { sendPasswordResetOtp, verifyOtp } from "../services/otp.service";
import {
	findUserByEmail,
	findUserById,
	updateUser,
} from "../services/user.service";
import { createSession, readSession, revokeSession } from "./session.store";

export async function login(
	email: string,
	password: string,
	rememberMe = false,
) {
	const user = findUserByEmail(email);

	if (
		user === undefined ||
		!(await verifyPassword(password, user.passwordHash))
	) {
		return undefined;
	}

	const session = createSession(
		user.id,
		user.email,
		env.sessionMode === "single",
	);

	const accessExpiry = 60 * 60; // 1 hour
	const refreshExpiry = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60;

	const accessToken = await signAccessToken(
		user.id,
		user.email,
		session.id,
		accessExpiry,
	);
	const refreshToken = await signRefreshToken(
		user.id,
		user.email,
		session.id,
		refreshExpiry,
	);

	const cookieMaxAge = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60;

	return {
		user: toPublicUser(user),
		accessToken,
		refreshToken,
		sessionId: session.id,
		cookie: `rakta_session=${session.id}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${cookieMaxAge}`,
		refreshCookie: `rakta_refresh=${refreshToken}; HttpOnly; SameSite=Lax; Path=/api/auth/refresh; Max-Age=${cookieMaxAge}`,
	};
}

export async function refreshTokens(request: Request) {
	// Accept refresh token from Authorization header or HttpOnly cookie
	const authHeader = request.headers.get("authorization");
	const bearerRefresh = authHeader?.startsWith("Bearer ")
		? authHeader.slice(7)
		: undefined;
	const cookieRefresh = request.headers
		.get("cookie")
		?.split(";")
		.map((c) => c.trim())
		.find((c) => c.startsWith("rakta_refresh="))
		?.slice("rakta_refresh=".length);

	const oldToken = bearerRefresh ?? cookieRefresh;
	if (!oldToken) return undefined;

	return rotateRefreshToken(oldToken);
}

export async function authenticate(
	request: Request,
): Promise<PublicUser | undefined> {
	const authorization = request.headers.get("authorization");
	const bearerToken = authorization?.startsWith("Bearer ")
		? authorization.slice(7)
		: undefined;
	const cookieSessionId = request.headers
		.get("cookie")
		?.split(";")
		.map((cookie) => cookie.trim())
		.find((cookie) => cookie.startsWith("rakta_session="))
		?.slice("rakta_session=".length);

	const payload =
		bearerToken === undefined ? undefined : await verifyJwt(bearerToken);
	const sessionId = payload?.sessionId ?? cookieSessionId;
	const session = sessionId === undefined ? undefined : readSession(sessionId);
	const user =
		session === undefined ? undefined : findUserById(session.userId);

	return user === undefined ? undefined : toPublicUser(user);
}

export function logout(sessionId: string): void {
	revokeSession(sessionId);
}

export async function requestPasswordOtp(email: string) {
	return sendPasswordResetOtp(email);
}

export async function resetPassword(
	email: string,
	code: string,
	password: string,
): Promise<boolean> {
	if (!verifyOtp(email, code)) return false;

	const user = findUserByEmail(email);
	if (user === undefined) return false;

	await updateUser(user.id, { password });
	return true;
}
