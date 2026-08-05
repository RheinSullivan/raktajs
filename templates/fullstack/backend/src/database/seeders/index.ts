import { runDatabaseSeeders } from "./DatabaseSeeder";

if (import.meta.main) {
	console.log("Running database seeders for testing...");
	await runDatabaseSeeders();
	console.log("Database seeders completed successfully.");
}

export { seedCmsPosts } from "./CmsSeeder";
export { runDatabaseSeeders } from "./DatabaseSeeder";
export { seedUsers } from "./UserSeeder";
