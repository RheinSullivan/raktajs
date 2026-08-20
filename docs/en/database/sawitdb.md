# SawitDB Engine

SawitDB is a single-file database engine (`.sawit`) developed by **WowoEngine**, part of the Rakta.js ecosystem. It provides a lightweight embedded database with atomic transactions, Write-Ahead Logging (WAL), and a SQL-compatible query interface called AQL (Agricultural Query Language).

## When to Use

Use SawitDB when:
- You want a zero-external-service database for Rakta.js projects
- Your backend runs on a single machine and does not require horizontal scaling
- You are building applications with WowoEngine's stack
- You want a `.sawit` file as a portable, self-contained data store

For distributed or multi-server deployments, use PostgreSQL, MySQL, or Turso instead.

## Installation

### JavaScript / TypeScript (Node.js / Bun)

```bash
bun add @wowoengine/sawitdb-ts
```

### PHP (Laravel / CodeIgniter 4)

```bash
composer require wowoengine/sawitdb-php
```

## Configuration

```env
SAWITDB_FILE=./data/app.sawit
SAWITDB_PAGE_SIZE=4096
SAWITDB_WAL=true
```

## Project Structure

```
project/
├── frontend/               # Rakta.js frontend
│   ├── app/
│   │   └── users/
│   │       └── page.tsx
│   └── services/
│       └── users.ts
├── backend/                # Node.js / Gaman.js backend
│   ├── routes/
│   │   └── users.ts
│   ├── services/
│   │   └── userService.ts
│   └── database/
│       └── client.ts       # SawitDB connection
```

## Backend Integration

### Node.js / TypeScript (Gaman.js backend)

```typescript
// backend/database/client.ts
import { databaseClient } from "@wowoengine/sawitdb-ts";

const SAWIT_FILE = process.env.SAWITDB_FILE ?? "./data/app.sawit";

// Connect to the SawitDB file — created automatically if it doesn't exist
export const db = await databaseClient.connect(SAWIT_FILE, {
  pageSize: Number(process.env.SAWITDB_PAGE_SIZE ?? 4096),
  wal: process.env.SAWITDB_WAL === "true",
});
```

```typescript
// backend/database/migrate.ts
import { db } from "./client";

export async function migrateDb(): Promise<void> {
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
}
```

```typescript
// backend/services/userService.ts
import { db } from "../database/client";

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export async function getAllUsers(): Promise<User[]> {
  const result = await db.query(
    "SELECT id, name, email, role, created_at FROM users WHERE status = ?",
    ["active"]
  );
  return result.rows as User[];
}

export async function getUserById(id: number): Promise<User | null> {
  const result = await db.query(
    "SELECT id, name, email, role FROM users WHERE id = ?",
    [id]
  );
  return (result.rows[0] as User) ?? null;
}

export async function createUser(
  name: string,
  email: string,
  role = "user"
): Promise<number> {
  const result = await db.query(
    "INSERT INTO users (name, email, role) VALUES (?, ?, ?)",
    [name, email, role]
  );
  return result.lastInsertId as number;
}
```

```typescript
// backend/routes/users.ts (Gaman.js)
import { defineRoute } from "gamanjs";
import { getAllUsers, getUserById, createUser } from "../services/userService";

export default defineRoute({
  "GET /api/users": async (ctx) => {
    const users = await getAllUsers();
    return ctx.json({ users });
  },
  "GET /api/users/:id": async (ctx) => {
    const user = await getUserById(Number(ctx.params.id));
    if (!user) return ctx.json({ error: "Not found" }, 404);
    return ctx.json({ user });
  },
  "POST /api/users": async (ctx) => {
    const { name, email, role } = await ctx.json();
    const id = await createUser(name, email, role);
    return ctx.json({ id }, 201);
  },
});
```

### PHP Backend (Laravel / CodeIgniter 4)

```php
// config/sawitdb.php (Laravel)
use WowoEngine\SawitDB\Facades\SawitDB;

// Query all active users
$users = SawitDB::query("SELECT * FROM users WHERE role = ?", ['admin']);

// Insert a new user
SawitDB::query(
    "INSERT INTO users (name, email) VALUES (?, ?)",
    ['Budi Santoso', 'budi@example.com']
);
```

## Rakta.js Frontend Integration

```typescript
// frontend/services/users.ts
import { createRaktaHttp } from "raktajs/http";

const api = createRaktaHttp({ baseUrl: process.env.API_URL ?? "http://localhost:4000" });

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export async function fetchUsers(): Promise<User[]> {
  const data = await api.get<{ users: User[] }>("/api/users");
  return data.users;
}

export async function createUser(name: string, email: string): Promise<number> {
  const data = await api.post<{ id: number }>("/api/users", { name, email });
  return data.id;
}
```

```tsx
// frontend/app/users/page.tsx
export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchUsers().then(setUsers);
  }, []);

  return (
    <main>
      <title>Users</title>
      <lazy fallback={<p>Loading users...</p>}>
        <ul>
          {users.map((u) => (
            <li key={u.id}>
              <click to={`/users/${u.id}`}>{u.name}</click>
              <span> ({u.role})</span>
            </li>
          ))}
        </ul>
      </lazy>
    </main>
  );
}
```

## AQL — Agricultural Query Language

SawitDB supports both standard SQL subset and AQL extensions. AQL adds syntax inspired by data farming concepts:

```sql
-- Standard SQL works:
SELECT * FROM products WHERE price > 10000;
INSERT INTO products (name, price) VALUES ('Sawit Oil', 15000);

-- AQL extensions (SawitDB-specific):
HARVEST FROM products WHERE season = 'Q4';
PLANT INTO harvest_log (product_id, harvested_at) VALUES (1, NOW());
```

Refer to WowoEngine's AQL documentation for the full specification.

## Development

The `.sawit` file is created automatically in the configured directory:

```bash
# Verify the file
ls ./data/app.sawit

# Check page size and WAL status via SawitDB CLI
sawitdb info ./data/app.sawit
```

## Production

- Store the `.sawit` file on a persistent volume (not ephemeral storage)
- Schedule regular file backups
- Set write permissions for the server process user only (`chmod 640`)

## Architecture Summary

```
Rakta.js page
  ↓ createRaktaHttp
Backend route (Gaman.js / Laravel)
  ↓ @wowoengine/sawitdb-ts / sawitdb-php
./data/app.sawit (WAL mode, 4KB pages)
  ↓ AQL / SQL query result
JSON response
  ↓
Rakta.js UI
```

## Technical Details

| Property | Value |
|---|---|
| File format | Single-file `.sawit` |
| Developer | WowoEngine |
| Query language | AQL + SQL subset |
| Transaction model | Atomic (WAL mode) |
| Default page size | 4096 bytes |
| Max file size | Platform-dependent |
