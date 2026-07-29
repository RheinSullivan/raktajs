// @rakta/database - Database ecosystem package
// Typed repository abstraction and ORM adapter contracts.
// Supports SQLite, PostgreSQL, MySQL, and edge KV.

export type DatabaseDriver =
	| "sqlite"
	| "postgresql"
	| "mysql"
	| "mariadb"
	| "kv";

export interface DatabaseConfig {
	readonly driver: DatabaseDriver;
	readonly url: string;
	readonly poolSize?: number;
	readonly debug?: boolean;
}

export interface QueryResult<T> {
	readonly rows: readonly T[];
	readonly rowCount: number;
	readonly durationMs: number;
}

export interface DatabaseAdapter {
	readonly driver: DatabaseDriver;
	/** Execute a raw SQL query. */
	query<T = Record<string, unknown>>(
		sql: string,
		params?: readonly unknown[],
	): Promise<QueryResult<T>>;
	/** Execute a write query (INSERT, UPDATE, DELETE). */
	execute(
		sql: string,
		params?: readonly unknown[],
	): Promise<{ rowsAffected: number }>;
	/** Close the connection. */
	close(): Promise<void>;
}

/**
 * Create a typed repository around a database adapter.
 * The repository pattern keeps SQL out of your domain logic.
 */
export interface Repository<T, TId = string> {
	findById(id: TId): Promise<T | undefined>;
	findMany(where?: Partial<T>): Promise<readonly T[]>;
	create(data: Omit<T, "id">): Promise<T>;
	update(id: TId, data: Partial<T>): Promise<T | undefined>;
	delete(id: TId): Promise<boolean>;
}

/**
 * Create an in-memory repository for testing.
 */
export function createInMemoryRepository<T extends { id: string }>(
	initialData: T[] = [],
): Repository<T, string> {
	const store = new Map<string, T>(initialData.map((item) => [item.id, item]));

	return {
		async findById(id) {
			return store.get(id);
		},
		async findMany(where) {
			const items = Array.from(store.values());

			if (!where) {
				return items;
			}

			return items.filter((item) => {
				for (const [key, value] of Object.entries(where)) {
					if ((item as Record<string, unknown>)[key] !== value) {
						return false;
					}
				}

				return true;
			});
		},
		async create(data) {
			const id = crypto.randomUUID();
			const item = { id, ...data } as unknown as T;
			store.set(id, item);
			return item;
		},
		async update(id, data) {
			const existing = store.get(id);

			if (!existing) {
				return undefined;
			}

			const updated = { ...existing, ...data } as T;
			store.set(id, updated);
			return updated;
		},
		async delete(id) {
			return store.delete(id);
		},
	};
}

/**
 * Build a connection string from config parts.
 */
export function buildConnectionString(config: {
	driver: DatabaseDriver;
	host?: string;
	port?: number;
	database?: string;
	user?: string;
	password?: string;
}): string {
	switch (config.driver) {
		case "sqlite":
			return `file:${config.database ?? "database.sqlite"}`;
		case "postgresql":
			return `postgresql://${config.user}:${config.password}@${config.host ?? "localhost"}:${config.port ?? 5432}/${config.database}`;
		case "mysql":
		case "mariadb":
			return `mysql://${config.user}:${config.password}@${config.host ?? "localhost"}:${config.port ?? 3306}/${config.database}`;
		default:
			return config.database ?? "";
	}
}
