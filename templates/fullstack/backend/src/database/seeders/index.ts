import { runDatabaseSeeders } from "./DatabaseSeeder";

if (import.meta.main) {
	console.log("Running database seeders for testing...");
	await runDatabaseSeeders();
	console.log("Database seeders completed successfully.");
}

export { seedCmsPosts } from "./CmsSeeder";
export { seedUsers } from "./UserSeeder";
export { runDatabaseSeeders } from "./DatabaseSeeder";

