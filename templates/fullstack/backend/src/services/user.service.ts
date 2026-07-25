import { database } from "../database/client";
import type { Gender, PublicUser, User, UserRole } from "../models/user.model";
import { toPublicUser } from "../models/user.model";
import { hashPassword } from "../security/password";

export async function seedUsers(): Promise<void> {
	if (database.users.all().length > 0) {
		return;
	}

	const now = new Date().toISOString();
	const admin: User = {
		id: "user_demo",
		firstName: "Rakta",
		lastName: "Admin",
		name: "Rakta Admin",
		email: "admin@rakta.local",
		passwordHash: await hashPassword("rakta-password"),
		role: "ADMIN",
		gender: "MALE",
		createdAt: now,
		updatedAt: now,
	};

	database.users.create(admin);

	const editor: User = {
		id: "user_editor",
		firstName: "CMS",
		lastName: "Editor",
		name: "CMS Editor",
		email: "editor@rakta.local",
		passwordHash: await hashPassword("rakta-password"),
		role: "USER",
		gender: "FEMALE",
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
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	role?: UserRole;
	gender?: Gender;
}): Promise<PublicUser> {
	if (findUserByEmail(input.email) !== undefined) {
		throw new Error("Email is already registered.");
	}

	const now = new Date().toISOString();
	const firstName = input.firstName;
	const lastName = input.lastName;
	const name = `${firstName} ${lastName}`.trim();
	const user: User = {
		id: `user_${Math.random().toString(36).substring(2, 10)}`,
		firstName,
		lastName,
		name,
		email: input.email,
		passwordHash: await hashPassword(input.password),
		role: input.role ?? "USER",
		gender: input.gender ?? "MALE",
		createdAt: now,
		updatedAt: now,
	};

	database.users.create(user);
	return toPublicUser(user);
}
