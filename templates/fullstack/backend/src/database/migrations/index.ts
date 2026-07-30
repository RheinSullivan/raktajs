export interface Migration {
	readonly id: string;
	up(): Promise<void> | void;
}

const migrations: readonly Migration[] = [
	{
		id: "001_create_users_and_cms_posts",
		up() {},
	},
];

export async function runMigrations(): Promise<readonly string[]> {
	const applied: string[] = [];

	for (const migration of migrations) {
		await migration.up();
		applied.push(migration.id);
	}

	return applied;
}

if (import.meta.main) {
	console.log("Running database migrations...");
	const applied = await runMigrations();
	console.log(
		`Database migrations completed. Applied ${applied.length} migration(s).`,
	);
}
