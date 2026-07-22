import { env } from "../env";
import type { PublicUser } from "../models/user.model";
import { toPublicUser } from "../models/user.model";
import { signJwt, verifyJwt } from "../security/jwt";
import { verifyPassword } from "../security/password";
import { sendPasswordResetOtp, verifyOtp } from "../services/otp.service";
import {
	findUserByEmail,
	findUserById,
	updateUser,
} from "../services/user.service";
import { createSession, readSession, revokeSession } from "./session.store";

export async function login(email: string, password: string) {
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
	const token = await signJwt({
		sub: user.id,
		email: user.email,
		sessionId: session.id,
		exp: Math.floor(Date.now() / 1000) + 60 * 60,
	});

	return {
		user: toPublicUser(user),
		token,
		sessionId: session.id,
		cookie: `rakta_session=${session.id}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800`,
	};
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
	const user = session === undefined ? undefined : findUserById(session.userId);

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
	if (!verifyOtp(email, code)) {
		return false;
	}

	const user = findUserByEmail(email);

	if (user === undefined) {
		return false;
	}

	await updateUser(user.id, { password });
	return true;
}
