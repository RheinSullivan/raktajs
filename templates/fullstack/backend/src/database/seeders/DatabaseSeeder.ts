import { seedCmsPosts } from "./CmsSeeder";
import { seedUsers } from "./UserSeeder";

export async function runDatabaseSeeders(): Promise<void> {
	await seedUsers();
	seedCmsPosts();
}
