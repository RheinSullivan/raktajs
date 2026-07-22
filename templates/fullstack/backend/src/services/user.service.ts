import { database } from "../database/client";
import type { PublicUser, User } from "../models/user.model";
import { toPublicUser } from "../models/user.model";
import { hashPassword } from "../security/password";

export async function seedUsers(): Promise<void> {
	if (database.users.all().length > 0) {
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

	database.users.create(admin);

	const editor: User = {
		id: "user_editor",
		name: "CMS Editor",
		email: "editor@rakta.local",
		passwordHash: await hashPassword("rakta-password"),
		role: "editor",
		createdAt: now,
		updatedAt: now,
	};

	database.users.create(editor);
}

export function listUsers(): PublicUser[] {
	return database.users.all().map(toPublicUser);
}

export function findUserById(userId: string): User | undefined {
	return database.users.find(userId);
}

export function findUserByEmail(email: string): User | undefined {
	return database.users.findBy((user) => user.email === email);
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

	database.users.create(user);
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
	const existingUser = database.users.find(userId);

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

	database.users.update(userId, updatedUser);
	return toPublicUser(updatedUser);
}

export function deleteUser(userId: string): boolean {
	return database.users.delete(userId);
}
