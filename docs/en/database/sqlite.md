# SQLite

SQLite is an embedded relational database stored as a single file. It requires no server process and is included in virtually every platform. For Rakta.js backends running on Bun, SQLite is the fastest zero-dependency database option for local development and lightweight production workloads.

## When to Use

Use SQLite when:
- You want zero-infrastructure database for development or prototyping
- Your application runs on a single server and does not need horizontal scaling
- You are building desktop apps, CLI tools, or embedded data stores
- You are using Bun (native SQLite API via `bun:sqlite`)
- You are using Turso for distributed SQLite in production (see [Turso](./turso.md))

SQLite is not designed for multi-server setups or high-concurrency writes. For those cases, use PostgreSQL or MySQL.

## Installation

### Bun — Native (zero dependencies)

Bun includes SQLite natively via the `bun:sqlite` module. No extra package needed.

### Node.js — better-sqlite3

```bash
bun add better-sqlite3
bun add -d @types/better-sqlite3
```

### With Drizzle ORM

```bash
# For Bun native SQLite
bun add drizzle-orm

# For better-sqlite3
bun add drizzle-orm better-sqlite3
```

## Configuration

```env
SQLITE_FILE="./data/app.db"
```

No connection string format required. SQLite connects directly to a file path.

## Project Structure

```
project/
├── frontend/               # Rakta.js frontend
│   ├── app/
│   │   └── tasks/
│   │       └── page.tsx
│   └── services/
│       └── tasks.ts
├── backend/                # Node.js / Gaman.js backend
│   ├── routes/
│   │   └── tasks.ts
│   ├── services/
│   │   └── taskService.ts
│   └── db/
│       └── sqlite.ts       # bun:sqlite or better-sqlite3
│       └── migrate.ts      # schema init
```

## Backend Integration

### Bun — Native SQLite

```typescript
// backend/db/sqlite.ts
import { Database } from "bun:sqlite";

const DB_PATH = process.env.SQLITE_FILE ?? "./data/app.db";

// Bun's SQLite is synchronous by default (fastest path)
export const db = new Database(DB_PATH, { create: true });

// Enable WAL mode for better concurrent read performance
db.run("PRAGMA journal_mode = WAL;");
db.run("PRAGMA synchronous = NORMAL;");
db.run("PRAGMA foreign_keys = ON;");
```

```typescript
// backend/db/migrate.ts
import { db } from "./sqlite";

export function migrateDb(): void {
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      user_id TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
}

// Run migrations at startup
migrateDb();
```

```typescript
// backend/services/taskService.ts
import { db } from "../db/sqlite";

export interface Task {
  id: number;
  title: string;
  completed: boolean;
  user_id: string;
  created_at: string;
}

export function getUserTasks(userId: string): Task[] {
  const stmt = db.prepare(
    "SELECT id, title, completed, user_id, created_at FROM tasks WHERE user_id = ? ORDER BY created_at DESC"
  );
  return stmt.all(userId) as Task[];
}

export function createTask(userId: string, title: string): number {
  const stmt = db.prepare(
    "INSERT INTO tasks (title, user_id) VALUES (?, ?)"
  );
  const result = stmt.run(title, userId);
  return result.lastInsertRowid as number;
}

export function toggleTask(id: number): void {
  db.run(
    "UPDATE tasks SET completed = NOT completed WHERE id = ?",
    [id]
  );
}

export function deleteTask(id: number, userId: string): void {
  db.run("DELETE FROM tasks WHERE id = ? AND user_id = ?", [id, userId]);
}
```

```typescript
// backend/routes/tasks.ts (Gaman.js)
import { defineRoute } from "gamanjs";
import { getUserTasks, createTask, toggleTask, deleteTask } from "../services/taskService";

export default defineRoute({
  "GET /api/tasks": (ctx) => {
    const userId = ctx.query.userId as string;
    if (!userId) return ctx.json({ error: "userId required" }, 400);
    return ctx.json({ tasks: getUserTasks(userId) });
  },
  "POST /api/tasks": async (ctx) => {
    const { userId, title } = await ctx.json();
    const id = createTask(userId, title);
    return ctx.json({ id }, 201);
  },
  "PATCH /api/tasks/:id/toggle": (ctx) => {
    toggleTask(Number(ctx.params.id));
    return ctx.json({ ok: true });
  },
  "DELETE /api/tasks/:id": async (ctx) => {
    const { userId } = await ctx.json();
    deleteTask(Number(ctx.params.id), userId);
    return ctx.json({ ok: true });
  },
});
```

### With Drizzle ORM + Bun SQLite

```typescript
// backend/db/schema.ts
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const tasks = sqliteTable("tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  completed: integer("completed", { mode: "boolean" }).default(false),
  userId: text("user_id").notNull(),
  createdAt: text("created_at").default("datetime('now')"),
});
```

```typescript
// backend/db/client.ts
import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import * as schema from "./schema";

const sqlite = new Database(process.env.SQLITE_FILE ?? "./data/app.db", { create: true });
export const db = drizzle(sqlite, { schema });
```

## Rakta.js Frontend Integration

```typescript
// frontend/services/tasks.ts
import { createRaktaHttp } from "raktajs/http";

const api = createRaktaHttp({ baseUrl: process.env.API_URL ?? "http://localhost:4000" });

export interface Task {
  id: number;
  title: string;
  completed: boolean;
  created_at: string;
}

export async function fetchTasks(userId: string): Promise<Task[]> {
  const data = await api.get<{ tasks: Task[] }>(`/api/tasks?userId=${userId}`);
  return data.tasks;
}

export async function createTask(userId: string, title: string): Promise<number> {
  const data = await api.post<{ id: number }>("/api/tasks", { userId, title });
  return data.id;
}
```

```tsx
// frontend/app/tasks/page.tsx
export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const userId = "user_1";

  useEffect(() => {
    fetchTasks(userId).then(setTasks);
  }, [userId]);

  return (
    <main>
      <title>My Tasks</title>
      <lazy fallback={<p>Loading tasks...</p>}>
        <ul>
          {tasks.map((t) => (
            <li key={t.id} style={{ textDecoration: t.completed ? "line-through" : "none" }}>
              {t.title}
            </li>
          ))}
        </ul>
      </lazy>
    </main>
  );
}
```

## Development

SQLite creates the database file automatically. No Docker or external service is needed.

```bash
# Verify the database file
ls ./data/app.db

# Open with SQLite CLI
sqlite3 ./data/app.db
.tables
SELECT * FROM tasks;
.quit
```

## Production

For single-server production deployments, SQLite is production-ready with WAL mode enabled. For distributed production, use [Turso](./turso.md) which provides globally replicated SQLite.

## Architecture Summary

```
Rakta.js page
  ↓ createRaktaHttp
Backend route (Gaman.js / Hono.js / Bun)
  ↓ bun:sqlite (synchronous, in-process)
./data/app.db file (single file on disk)
  ↓ query result rows
JSON response
  ↓
Rakta.js UI
```
