import type { PublicUser, User } from "../models/user.model";
import { toPublicUser } from "../models/user.model";
import { hashPassword } from "../security/password";

const users = new Map<string, User>();

export async function seedUsers(): Promise<void> {
	if (users.size > 0) {
		return;
	}

	const now = new Date().toISOString();
	const admin: User = {
		id: "user_demo",
		name: "Rakta Admin",
		email: "admin@rakta.local",
		passwordHash: await hashPassword("rakta-password"),
		role: "owner",
		createdAt: now,
		updatedAt: now,
	};

	users.set(admin.id, admin);

	const editor: User = {
		id: "user_editor",
		name: "CMS Editor",
		email: "editor@rakta.local",
		passwordHash: await hashPassword("rakta-password"),
		role: "editor",
		createdAt: now,
		updatedAt: now,
	};

	users.set(editor.id, editor);
}

export function listUsers(): PublicUser[] {
	return Array.from(users.values(), toPublicUser);
}

export function findUserById(userId: string): User | undefined {
	return users.get(userId);
}

export function findUserByEmail(email: string): User | undefined {
	return Array.from(users.values()).find((user) => user.email === email);
}

export async function createUser(input: {
	readonly name: string;
	readonly email: string;
	readonly password: string;
	readonly role?: User["role"];
}): Promise<PublicUser> {
	if (findUserByEmail(input.email) !== undefined) {
		throw new Error("Email is already registered.");
	}

	const now = new Date().toISOString();
	const user: User = {
		id: crypto.randomUUID(),
		name: input.name,
		email: input.email,
		passwordHash: await hashPassword(input.password),
		role: input.role ?? "member",
		createdAt: now,
		updatedAt: now,
	};

	users.set(user.id, user);
	return toPublicUser(user);
}

export async function updateUser(
	userId: string,
	input: {
		readonly name?: string;
		readonly email?: string;
		readonly password?: string;
		readonly role?: User["role"];
	},
): Promise<PublicUser | undefined> {
	const existingUser = users.get(userId);

	if (existingUser === undefined) {
		return undefined;
	}

	const updatedUser: User = {
		...existingUser,
		name: input.name ?? existingUser.name,
		email: input.email ?? existingUser.email,
		passwordHash:
			input.password === undefined
				? existingUser.passwordHash
				: await hashPassword(input.password),
		role: input.role ?? existingUser.role,
		updatedAt: new Date().toISOString(),
	};

	users.set(userId, updatedUser);
	return toPublicUser(updatedUser);
}

export function deleteUser(userId: string): boolean {
	return users.delete(userId);
}
