export interface SessionRecord {
	readonly id: string;
	readonly userId: string;
	readonly email: string;
	readonly expiresAt: string;
}

const sessions = new Map<string, SessionRecord>();
const userSessionIndex = new Map<string, string>();

export function createSession(
	userId: string,
	email: string,
	singleSession: boolean,
): SessionRecord {
	if (singleSession) {
		const oldSessionId = userSessionIndex.get(userId);

		if (oldSessionId !== undefined) {
			sessions.delete(oldSessionId);
		}
	}

	const session = {
		id: crypto.randomUUID(),
		userId,
		email,
		expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
	};

	sessions.set(session.id, session);
	userSessionIndex.set(userId, session.id);
	return session;
}

export function readSession(sessionId: string): SessionRecord | undefined {
	const session = sessions.get(sessionId);

	if (session === undefined || Date.parse(session.expiresAt) <= Date.now()) {
		sessions.delete(sessionId);
		return undefined;
	}

	return session;
}

export function revokeSession(sessionId: string): void {
	const session = sessions.get(sessionId);

	if (session !== undefined) {
		userSessionIndex.delete(session.userId);
	}

	sessions.delete(sessionId);
}
