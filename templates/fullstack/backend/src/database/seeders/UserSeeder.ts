import type { User } from "../../models/user.model";
import { hashPassword } from "../../security/password";
import { database } from "../client";

export async function seedUsers(): Promise<void> {
	if (database.users.all().length > 0) {
		return;
	}

	const now = new Date().toISOString();
	const defaultPasswordHash = await hashPassword("rakta-password");

	const seedUsersList: User[] = [
		{
			id: "user_super_admin",
			firstName: "Rhein",
			lastName: "Sullivan",
			name: "Rhein Sullivan",
			email: "rheinsullivan@raktajs.dev",
			passwordHash: defaultPasswordHash,
			role: "Super Admin",
			gender: "MALE",
			createdAt: now,
			updatedAt: now,
		},
		{
			id: "user_organization",
			firstName: "Vyagra",
			lastName: "Nexus",
			name: "Vyagra Nexus",
			email: "vyagranexus@raktajs.dev",
			passwordHash: defaultPasswordHash,
			role: "Organization",
			gender: "OTHER",
			createdAt: now,
			updatedAt: now,
		},
		{
			id: "user_admin",
			firstName: "Rakta.js",
			lastName: "Admin",
			name: "Rakta.js Admin",
			email: "developer@raktajs.dev",
			passwordHash: defaultPasswordHash,
			role: "Administrator",
			gender: "MALE",
			createdAt: now,
			updatedAt: now,
		},
	];

	for (const user of seedUsersList) {
		database.users.create(user);
	}
}
