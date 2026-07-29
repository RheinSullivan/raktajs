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
			id: "user_demo",
			firstName: "Rakta",
			lastName: "Admin",
			name: "Rakta Admin",
			email: "admin@rakta.local",
			passwordHash: defaultPasswordHash,
			role: "ADMIN",
			gender: "MALE",
			createdAt: now,
			updatedAt: now,
		},
		{
			id: "user_editor",
			firstName: "CMS",
			lastName: "Editor",
			name: "CMS Editor",
			email: "editor@rakta.local",
			passwordHash: defaultPasswordHash,
			role: "USER",
			gender: "FEMALE",
			createdAt: now,
			updatedAt: now,
		},
		{
			id: "user_tester",
			firstName: "Testing",
			lastName: "User",
			name: "Testing User",
			email: "tester@rakta.local",
			passwordHash: defaultPasswordHash,
			role: "USER",
			gender: "OTHER",
			createdAt: now,
			updatedAt: now,
		},
	];

	for (const user of seedUsersList) {
		database.users.create(user);
	}
}
