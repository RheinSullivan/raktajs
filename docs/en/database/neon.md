# Neon

Neon is a serverless PostgreSQL platform with a compute/storage separation architecture. It provides instant branching, scale-to-zero compute, and a PostgreSQL-compatible API. Neon is an ideal choice for Rakta.js applications deployed on serverless or edge runtimes.

## When to Use

Use Neon when:
- You need PostgreSQL on a serverless backend (Vercel, Cloudflare Workers, AWS Lambda)
- You want instant database branching for development and preview environments
- You want auto-scaling that scales to zero during idle periods to save cost
- Your application uses Drizzle, Prisma, or raw `pg` — all are compatible with Neon

## Installation

```bash
# Neon serverless driver (optimized for HTTP connections from edge/serverless)
bun add @neondatabase/serverless

# Or use standard pg driver for Node.js / Bun servers
bun add pg
```

## Configuration

```env
DATABASE_URL="postgresql://user:password@ep-cool-name-123456.us-east-2.aws.neon.tech/dbname?sslmode=require"
```

Get your connection string from the [Neon Console](https://console.neon.tech).

## Project Structure

```
project/
├── frontend/               # Rakta.js frontend
│   ├── app/
│   │   └── analytics/
│   │       └── page.tsx
│   └── services/
│       └── analytics.ts
├── backend/                # Node.js / Gaman.js backend
│   ├── routes/
│   │   └── analytics.ts
│   └── db/
│       └── neon.ts         # @neondatabase/serverless client
```

## Backend Integration

### Node.js server (standard pg)

```typescript
// backend/db/neon.ts
import { Pool } from "pg";

// Standard pg pool works with Neon's PostgreSQL endpoint
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Required for Neon TLS
  max: 5, // Neon serverless prefers smaller pool sizes
});
```

### Serverless / Edge runtime (Neon HTTP driver)

```typescript
// backend/db/neon.ts (for edge / serverless)
import { neon } from "@neondatabase/serverless";

export const sql = neon(process.env.DATABASE_URL!);

// Usage: tagged template literal queries
// const result = await sql`SELECT * FROM users WHERE id = ${userId}`;
```

### Service Layer

```typescript
// backend/services/analyticsService.ts
import { sql } from "../db/neon";

export interface PageView {
  path: string;
  views: number;
  last_viewed: string;
}

export async function getTopPages(limit = 10): Promise<PageView[]> {
  const rows = await sql`
    SELECT path, COUNT(*) as views, MAX(created_at) as last_viewed
    FROM page_views
    GROUP BY path
    ORDER BY views DESC
    LIMIT ${limit}
  `;
  return rows as PageView[];
}

export async function recordPageView(path: string, userId: string | null): Promise<void> {
  await sql`
    INSERT INTO page_views (path, user_id, created_at)
    VALUES (${path}, ${userId}, NOW())
  `;
}
```

### API Route

```typescript
// backend/routes/analytics.ts (Gaman.js)
import { defineRoute } from "gamanjs";
import { getTopPages, recordPageView } from "../services/analyticsService";

export default defineRoute({
  "GET /api/analytics/top-pages": async (ctx) => {
    const pages = await getTopPages(10);
    return ctx.json({ pages });
  },
  "POST /api/analytics/view": async (ctx) => {
    const { path, userId } = await ctx.json();
    await recordPageView(path, userId ?? null);
    return ctx.json({ ok: true });
  },
});
```

## Rakta.js Frontend Integration

```typescript
// frontend/services/analytics.ts
import { createRaktaHttp } from "raktajs/http";

const api = createRaktaHttp({ baseUrl: process.env.API_URL ?? "http://localhost:4000" });

export interface PageView {
  path: string;
  views: number;
  last_viewed: string;
}

export async function fetchTopPages(): Promise<PageView[]> {
  const data = await api.get<{ pages: PageView[] }>("/api/analytics/top-pages");
  return data.pages;
}

export async function trackView(path: string): Promise<void> {
  await api.post("/api/analytics/view", { path });
}
```

```tsx
// frontend/app/analytics/page.tsx
export default function AnalyticsPage() {
  const [pages, setPages] = useState<PageView[]>([]);

  useEffect(() => {
    fetchTopPages().then(setPages);
  }, []);

  return (
    <main>
      <title>Analytics — Top Pages</title>
      <lazy fallback={<p>Loading analytics...</p>}>
        <table>
          <thead>
            <tr><th>Path</th><th>Views</th></tr>
          </thead>
          <tbody>
            {pages.map((p) => (
              <tr key={p.path}>
                <td>{p.path}</td>
                <td>{p.views}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </lazy>
    </main>
  );
}
```

## Database Branching

Neon's branching feature lets you create isolated copies of your database for each pull request or preview environment.

```bash
# Install Neon CLI
npm install -g neonctl

# Create a branch for a feature
neonctl branches create --name feature/user-roles

# Get connection string for the branch
neonctl connection-string feature/user-roles
```

## Migrations

Neon is fully PostgreSQL-compatible. Use any PostgreSQL migration tool:

```bash
# Drizzle Kit
bunx drizzle-kit generate
bunx drizzle-kit migrate

# Or raw SQL via psql
psql $DATABASE_URL -f migrations/001_create_tables.sql
```

## Production

Neon is production-ready. Use the Neon Console to:
- Set up read replicas for read-heavy workloads
- Configure autoscaling limits
- Enable connection pooling (PgBouncer built-in)
- Monitor query performance

## Architecture Summary

```
Rakta.js page
  ↓ createRaktaHttp
Backend route (Gaman.js / Node.js serverless)
  ↓ @neondatabase/serverless / pg Pool (TLS)
Neon PostgreSQL (serverless compute + S3 storage)
  ↓ query result
JSON response
  ↓
Rakta.js UI
```
