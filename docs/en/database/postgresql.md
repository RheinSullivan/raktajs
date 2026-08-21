# PostgreSQL

PostgreSQL is the recommended relational database for Rakta.js applications. It provides ACID transactions, JSONB support, full-text search, and strong ecosystem tooling across all supported backend languages.

## When to Use

Use PostgreSQL when your application needs:
- Relational data with complex joins
- Native JSON/JSONB document storage alongside relational tables
- Full-text search without an external search engine
- Strict data integrity and transactional guarantees
- Strong ORM support (Prisma, Drizzle, TypeORM, SQLAlchemy, GORM, Eloquent)

## Installation

### Node.js / Bun backend

```bash
bun add pg
# or with Drizzle ORM
bun add drizzle-orm postgres
```

### PHP (Laravel)

PostgreSQL support is built into Laravel via PDO. No extra package needed.

### Python (Django / Flask)

```bash
pip install psycopg2-binary
```

### Go (Prabogo / Beego)

```bash
go get github.com/lib/pq
```

## Configuration

Add your connection string to `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/rakta_db"
```

Rakta.js reads environment variables via `process.env` on the frontend side and directly on the backend.

## Project Structure

```
project/
├── frontend/           # Rakta.js frontend
│   ├── app/
│   │   └── users/
│   │       └── page.tsx       # Fetches /api/users
│   └── services/
│       └── users.ts           # API client using panturaFetch
├── backend/            # Node.js / Gaman.js backend
│   ├── routes/
│   │   └── users.ts           # GET /api/users
│   ├── services/
│   │   └── userService.ts     # Business logic
│   └── db/
│       └── client.ts          # pg / drizzle connection
```

## Backend Integration

### Node.js + pg (raw SQL)

```typescript
// backend/db/client.ts
import { Pool } from "pg";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
});
```

```typescript
// backend/services/userService.ts
import { pool } from "../db/client";

export interface User {
  id: number;
  name: string;
  email: string;
}

export async function getAllUsers(): Promise<User[]> {
  const result = await pool.query<User>(
    "SELECT id, name, email FROM users ORDER BY created_at DESC"
  );
  return result.rows;
}

export async function getUserById(id: number): Promise<User | null> {
  const result = await pool.query<User>(
    "SELECT id, name, email FROM users WHERE id = $1",
    [id]
  );
  return result.rows[0] ?? null;
}
```

```typescript
// backend/routes/users.ts (Gaman.js)
import { defineRoute } from "gamanjs";
import { getAllUsers, getUserById } from "../services/userService";

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
});
```

### Node.js + Drizzle ORM

```typescript
// backend/db/schema.ts
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});
```

```typescript
// backend/db/client.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
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
}

export async function fetchUsers(): Promise<User[]> {
  const data = await api.get<{ users: User[] }>("/api/users");
  return data.users;
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
      <ul>
        {users.map((u) => (
          <li key={u.id}>
            <click to={`/users/${u.id}`}>{u.name}</click>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

## Authentication Pattern

### Sign In → Backend → PostgreSQL

```
Rakta.js Login Page
  → POST /api/auth/login
  → backend validates credentials against users table
  → returns JWT / session token
  → Rakta.js stores token, guards routes with <Guard>
```

```typescript
// backend/services/authService.ts
import { pool } from "../db/client";
import { verifyToken, signToken } from "raktajs/auth";

export async function login(email: string, password: string) {
  const result = await pool.query(
    "SELECT id, email, password_hash FROM users WHERE email = $1",
    [email]
  );
  const user = result.rows[0];
  if (!user) throw new Error("Invalid credentials");

  // Compare password_hash with provided password (use bcrypt in production)
  const token = signToken({ sub: user.id, email: user.email }, process.env.JWT_SECRET!);
  return { token, user: { id: user.id, email: user.email } };
}
```

## Migrations

Using Drizzle Kit:

```bash
# Generate migration
bunx drizzle-kit generate

# Apply migration
bunx drizzle-kit migrate
```

Using raw SQL:

```bash
psql $DATABASE_URL -f migrations/001_create_users.sql
```

## Development

Run PostgreSQL locally with Docker:

```bash
docker run -d \
  --name pg-dev \
  -p 5432:5432 \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=rakta_dev \
  postgres:16
```

## Production

Use managed PostgreSQL providers:
- **Neon** - serverless PostgreSQL, great for edge/serverless
- **Supabase** - PostgreSQL with built-in auth and realtime
- **AWS RDS** - enterprise managed PostgreSQL
- **DigitalOcean Managed Database** - simple cloud PostgreSQL

## Architecture Summary

```
Rakta.js page (SSR/CSR)
  ↓ panturaFetch / createRaktaHttp
Backend route handler
  ↓ pg Pool / Drizzle ORM
PostgreSQL database
  ↓
Service layer
  ↓ JSON response
Rakta.js UI update
```
