// Session store — in-memory for development.
// Replace with Redis, PostgreSQL, or any persistent store in production.

export interface Session {
	readonly id: string;
	readonly userId: string;
	readonly email: string;
	readonly createdAt: number;
	readonly expiresAt: number;
}

const sessions = new Map<string, Session>();

const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

function generateId(): string {
	return crypto.randomUUID().replaceAll("-", "");
}

/**
 * Create a new session.
 * If singleSession is true, all existing sessions for the user are revoked first.
 */
export function createSession(
	userId: string,
	email: string,
	singleSession = false,
): Session {
	if (singleSession) {
		revokeAllSessions(userId);
	}

	const now = Math.floor(Date.now() / 1000);
	const session: Session = {
		id: generateId(),
		userId,
		email,
		createdAt: now,
		expiresAt: now + SESSION_TTL_SECONDS,
	};

	sessions.set(session.id, session);
	return session;
}

/**
 * Read a session by ID. Returns undefined if missing or expired.
 */
export function readSession(sessionId: string): Session | undefined {
	const session = sessions.get(sessionId);

	if (session === undefined) {
		return undefined;
	}

	const now = Math.floor(Date.now() / 1000);
	if (session.expiresAt < now) {
		sessions.delete(sessionId);
		return undefined;
	}

	return session;
}

/**
 * Revoke (delete) a single session.
 */
export function revokeSession(sessionId: string): void {
	sessions.delete(sessionId);
}

/**
 * Revoke all sessions for a user (used for single-session policy or logout-all).
 */
export function revokeAllSessions(userId: string): void {
	for (const [id, session] of sessions) {
		if (session.userId === userId) {
			sessions.delete(id);
		}
	}
}

/**
 * Count active sessions for a user.
 */
export function countActiveSessions(userId: string): number {
	const now = Math.floor(Date.now() / 1000);
	let count = 0;
	for (const session of sessions.values()) {
		if (session.userId === userId && session.expiresAt > now) {
			count++;
		}
	}
	return count;
}

/**
 * Regenerate a session (create new ID, keep user data). Used after privilege escalation.
 */
export function regenerateSession(oldSessionId: string): Session | undefined {
	const old = readSession(oldSessionId);
	if (!old) return undefined;
	revokeSession(oldSessionId);
	return createSession(old.userId, old.email, false);
}
