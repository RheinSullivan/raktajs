import { authenticate } from "../auth/auth.service";
import type { UserRole } from "../models/user.model";

/**
 * requireAuth — rejects unauthenticated requests with 401.
 * Returns undefined if authenticated (let the handler continue).
 */
export async function requireAuth(
	request: Request,
): Promise<Response | undefined> {
	const user = await authenticate(request);

	if (user === undefined) {
		return Response.json(
			{ success: false, error: "Unauthorized." },
			{ status: 401 },
		);
	}

	return undefined;
}

/**
 * requireRole — rejects requests where the user does not have one of the
 * allowed roles. Combines authentication + authorization in one call.
 *
 * @example
 * const rejected = await requireRole(request, "ADMIN");
 * if (rejected) return rejected;
 */
export async function requireRole(
	request: Request,
	...roles: UserRole[]
): Promise<Response | undefined> {
	const user = await authenticate(request);

	if (user === undefined) {
		return Response.json(
			{ success: false, error: "Unauthorized." },
			{ status: 401 },
		);
	}

	if (roles.length > 0 && !roles.includes(user.role as UserRole)) {
		return Response.json(
			{ success: false, error: "Forbidden." },
			{ status: 403 },
		);
	}

	return undefined;
}

/**
 * optionalAuth — resolves the user if a valid token/session exists,
 * but does NOT reject the request if unauthenticated.
 * Useful for public endpoints that show extra data to logged-in users.
 */
export async function optionalAuth(request: Request) {
	return authenticate(request);
}
