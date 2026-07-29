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
