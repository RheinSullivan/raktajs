import { database } from "../../../database/client";
import { seedUsers as seedUsersFn } from "../../../database/seeders/UserSeeder";
import { hashPassword } from "../../../security/password";
import type { Gender, PublicUser, User, UserRole } from "../models/UserModel";
import { toPublicUser } from "../models/UserModel";

export class UserService {
	async seedUsers(): Promise<void> {
		await seedUsersFn();
	}

	listUsers(): PublicUser[] {
		return database.users.all().map(toPublicUser);
	}

	findUserById(userId: string): User | undefined {
		return database.users.find(userId);
	}

	findUserByEmail(email: string): User | undefined {
		return database.users.findBy((user) => user.email === email);
	}

	async createUser(input: {
		firstName: string;
		lastName: string;
		email: string;
		password: string;
		role?: UserRole;
		gender?: Gender;
	}): Promise<PublicUser> {
		if (this.findUserByEmail(input.email) !== undefined) {
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

	async updateUser(
		userId: string,
		input: {
			firstName?: string;
			lastName?: string;
			name?: string;
			email?: string;
			password?: string;
			role?: UserRole;
			gender?: Gender;
		},
	): Promise<PublicUser | undefined> {
		const existingUser = database.users.find(userId);

		if (existingUser === undefined) {
			return undefined;
		}

		const firstName = input.firstName ?? existingUser.firstName;
		const lastName = input.lastName ?? existingUser.lastName;
		const name = input.name ?? `${firstName} ${lastName}`.trim();
		const updatedUser: User = {
			...existingUser,
			firstName,
			lastName,
			name,
			email: input.email ?? existingUser.email,
			passwordHash:
				input.password === undefined
					? existingUser.passwordHash
					: await hashPassword(input.password),
			role: input.role ?? existingUser.role,
			gender: input.gender ?? existingUser.gender,
			updatedAt: new Date().toISOString(),
		};

		database.users.update(userId, updatedUser);
		return toPublicUser(updatedUser);
	}

	deleteUser(userId: string): boolean {
		return database.users.delete(userId);
	}
}

const userServiceInstance = new UserService();
export const seedUsers = () => userServiceInstance.seedUsers();
export const listUsers = () => userServiceInstance.listUsers();
export const findUserById = (id: string) =>
	userServiceInstance.findUserById(id);
export const findUserByEmail = (email: string) =>
	userServiceInstance.findUserByEmail(email);
export const createUser = (input: {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	role?: UserRole;
	gender?: Gender;
}) => userServiceInstance.createUser(input);
export const updateUser = (
	id: string,
	input: {
		firstName?: string;
		lastName?: string;
		name?: string;
		email?: string;
		password?: string;
		role?: UserRole;
		gender?: Gender;
	},
) => userServiceInstance.updateUser(id, input);
export const deleteUser = (id: string) => userServiceInstance.deleteUser(id);
