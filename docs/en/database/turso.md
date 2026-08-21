# Turso

Turso is a distributed SQLite database built on libSQL, a fork of SQLite maintained by ChiselStrike. It provides globally distributed edge reads, low latency, and a familiar SQLite interface - with a generous free tier.

## When to Use

Use Turso when:
- You want SQLite semantics with global distribution and low edge latency
- You're building applications for Cloudflare Workers, Bun edge runtimes, or serverless platforms
- You need a lightweight database for SaaS with per-tenant database isolation
- You want a free tier that scales reasonably for small-to-medium applications
- Your data access pattern fits a single-writer, many-readers model

## Installation

```bash
# libSQL client for Node.js / Bun
bun add @libsql/client

# Or with Drizzle ORM
bun add drizzle-orm @libsql/client
```

## Configuration

```env
TURSO_DATABASE_URL="libsql://your-database-name.turso.io"
TURSO_AUTH_TOKEN="your-turso-auth-token"
```

Get your URL and token from the [Turso Console](https://turso.tech/app) or via the Turso CLI.

## Project Structure

```
project/
├── frontend/               # Rakta.js frontend
│   ├── app/
│   │   └── notes/
│   │       └── page.tsx
│   └── services/
│       └── notes.ts
├── backend/                # Node.js / Gaman.js backend
│   ├── routes/
│   │   └── notes.ts
│   ├── services/
│   │   └── noteService.ts
│   └── db/
│       └── turso.ts        # libSQL client
```

## Backend Integration

### Node.js + @libsql/client

```typescript
// backend/db/turso.ts
import { createClient } from "@libsql/client";

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
```

### Schema Initialization

```typescript
// backend/db/migrate.ts
import { db } from "./turso";

export async function migrateDb(): Promise<void> {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      user_id TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
}
```

### Service Layer

```typescript
// backend/services/noteService.ts
import { db } from "../db/turso";

export interface Note {
  id: number;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
}

export async function getUserNotes(userId: string): Promise<Note[]> {
  const result = await db.execute({
    sql: "SELECT id, title, content, user_id, created_at FROM notes WHERE user_id = ? ORDER BY created_at DESC",
    args: [userId],
  });
  return result.rows as unknown as Note[];
}

export async function createNote(
  userId: string,
  title: string,
  content: string
): Promise<number> {
  const result = await db.execute({
    sql: "INSERT INTO notes (title, content, user_id) VALUES (?, ?, ?)",
    args: [title, content, userId],
  });
  return Number(result.lastInsertRowid);
}

export async function deleteNote(id: number, userId: string): Promise<void> {
  await db.execute({
    sql: "DELETE FROM notes WHERE id = ? AND user_id = ?",
    args: [id, userId],
  });
}
```

### API Route

```typescript
// backend/routes/notes.ts (Gaman.js)
import { defineRoute } from "gamanjs";
import { getUserNotes, createNote, deleteNote } from "../services/noteService";

export default defineRoute({
  "GET /api/notes": async (ctx) => {
    const userId = ctx.query.userId as string;
    if (!userId) return ctx.json({ error: "userId required" }, 400);
    const notes = await getUserNotes(userId);
    return ctx.json({ notes });
  },
  "POST /api/notes": async (ctx) => {
    const { userId, title, content } = await ctx.json();
    const id = await createNote(userId, title, content);
    return ctx.json({ id }, 201);
  },
  "DELETE /api/notes/:id": async (ctx) => {
    const { userId } = await ctx.json();
    await deleteNote(Number(ctx.params.id), userId);
    return ctx.json({ ok: true });
  },
});
```

### With Drizzle ORM

```typescript
// backend/db/schema.ts
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const notes = sqliteTable("notes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  userId: text("user_id").notNull(),
  createdAt: text("created_at").default("datetime('now')"),
});
```

```typescript
// backend/db/client.ts
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
```

## Rakta.js Frontend Integration

```typescript
// frontend/services/notes.ts
import { createRaktaHttp } from "raktajs/http";

const api = createRaktaHttp({ baseUrl: process.env.API_URL ?? "http://localhost:4000" });

export interface Note {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

export async function fetchNotes(userId: string): Promise<Note[]> {
  const data = await api.get<{ notes: Note[] }>(`/api/notes?userId=${userId}`);
  return data.notes;
}

export async function createNote(
  userId: string,
  title: string,
  content: string
): Promise<number> {
  const data = await api.post<{ id: number }>("/api/notes", { userId, title, content });
  return data.id;
}
```

```tsx
// frontend/app/notes/page.tsx
export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const userId = "user_123"; // In practice: read from auth context

  useEffect(() => {
    fetchNotes(userId).then(setNotes);
  }, [userId]);

  return (
    <main>
      <title>My Notes</title>
      <lazy fallback={<p>Loading notes...</p>}>
        <guard isAllowed={notes.length > 0} fallback={<p>No notes yet.</p>}>
          <ul>
            {notes.map((note) => (
              <li key={note.id}>
                <click to={`/notes/${note.id}`}>
                  <strong>{note.title}</strong>
                </click>
              </li>
            ))}
          </ul>
        </guard>
      </lazy>
    </main>
  );
}
```

## Turso CLI

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Log in
turso auth login

# Create a database
turso db create my-rakta-app

# Get connection info
turso db show my-rakta-app
turso db tokens create my-rakta-app

# Create a replica in a specific region (edge reads)
turso db replicate my-rakta-app sin  # Singapore
turso db replicate my-rakta-app ams  # Amsterdam
```

## Local Development

Run Turso locally with the embedded SQLite mode (no network required):

```typescript
// backend/db/turso.ts (dev mode)
import { createClient } from "@libsql/client";

export const db = createClient({
  url: process.env.NODE_ENV === "development"
    ? "file:local.db"
    : process.env.TURSO_DATABASE_URL!,
  authToken: process.env.NODE_ENV === "development"
    ? undefined
    : process.env.TURSO_AUTH_TOKEN,
});
```

## Architecture Summary

```
Rakta.js page
  ↓ createRaktaHttp
Backend route (Gaman.js / Hono.js / Bun)
  ↓ @libsql/client (HTTP or WSS)
Turso (libSQL edge replica - closest region)
  ↓ SQLite query result rows
JSON response
  ↓
Rakta.js UI
```
