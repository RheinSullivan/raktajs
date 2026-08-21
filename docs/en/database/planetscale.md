# PlanetScale

PlanetScale is a serverless MySQL platform built on Vitess, the database infrastructure that powers YouTube and Google. It provides horizontal sharding, non-blocking schema changes, and database branching. 

> **Note:** PlanetScale deprecated its Hobby tier in 2024 and moved to paid plans only. Evaluate [Neon](./neon.md) (serverless PostgreSQL) or [Turso](./turso.md) (serverless SQLite) as free-tier alternatives for small projects.

## When to Use

Use PlanetScale when:
- You need MySQL at global scale with automatic horizontal sharding
- Your team wants a Git-like branching workflow for schema changes
- You need non-blocking schema migrations (no table locks during `ALTER TABLE`)
- You're running high-traffic MySQL workloads and outgrow self-managed MySQL

## Installation

PlanetScale uses the `@planetscale/database` HTTP driver (works in edge/serverless) or standard `mysql2` for traditional Node.js servers.

```bash
# PlanetScale HTTP driver (edge/serverless compatible)
bun add @planetscale/database

# Or standard mysql2 (Node.js / Bun)
bun add mysql2
```

## Configuration

```env
# PlanetScale connection string
DATABASE_URL="mysql://user:password@aws.connect.psdb.cloud/database?sslaccept=strict"

# Or via individual variables
PLANETSCALE_HOST="aws.connect.psdb.cloud"
PLANETSCALE_DATABASE="your-database"
PLANETSCALE_USERNAME="your-username"
PLANETSCALE_PASSWORD="your-password"
```

Get your credentials from the [PlanetScale Console](https://app.planetscale.com).

## Project Structure

```
project/
├── frontend/               # Rakta.js frontend
│   ├── app/
│   │   └── orders/
│   │       └── page.tsx
│   └── services/
│       └── orders.ts
├── backend/                # Node.js / Gaman.js backend
│   ├── routes/
│   │   └── orders.ts
│   └── db/
│       └── planetscale.ts  # PlanetScale client
```

## Backend Integration

### Node.js + @planetscale/database (HTTP driver)

```typescript
// backend/db/planetscale.ts
import { connect } from "@planetscale/database";

export const ps = connect({
  host: process.env.PLANETSCALE_HOST!,
  username: process.env.PLANETSCALE_USERNAME!,
  password: process.env.PLANETSCALE_PASSWORD!,
});
```

```typescript
// backend/services/orderService.ts
import { ps } from "../db/planetscale";

export interface Order {
  id: number;
  user_id: number;
  total: number;
  status: string;
  created_at: string;
}

export async function getUserOrders(userId: number): Promise<Order[]> {
  const result = await ps.execute(
    "SELECT id, user_id, total, status, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC",
    [userId]
  );
  return result.rows as Order[];
}

export async function createOrder(userId: number, total: number): Promise<number> {
  const result = await ps.execute(
    "INSERT INTO orders (user_id, total, status) VALUES (?, ?, 'pending')",
    [userId, total]
  );
  return result.insertId as number;
}
```

### API Route

```typescript
// backend/routes/orders.ts (Gaman.js)
import { defineRoute } from "gamanjs";
import { getUserOrders, createOrder } from "../services/orderService";

export default defineRoute({
  "GET /api/orders": async (ctx) => {
    const userId = Number(ctx.query.userId);
    if (!userId) return ctx.json({ error: "userId required" }, 400);
    const orders = await getUserOrders(userId);
    return ctx.json({ orders });
  },
  "POST /api/orders": async (ctx) => {
    const { userId, total } = await ctx.json();
    const id = await createOrder(userId, total);
    return ctx.json({ id }, 201);
  },
});
```

### Node.js + mysql2 (traditional server)

```typescript
// backend/db/planetscale.ts (mysql2 approach)
import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: true },
  connectionLimit: 5,
});
```

## Rakta.js Frontend Integration

```typescript
// frontend/services/orders.ts
import { createRaktaHttp } from "raktajs/http";

const api = createRaktaHttp({ baseUrl: process.env.API_URL ?? "http://localhost:4000" });

export interface Order {
  id: number;
  total: number;
  status: string;
  created_at: string;
}

export async function fetchOrders(userId: number): Promise<Order[]> {
  const data = await api.get<{ orders: Order[] }>(`/api/orders?userId=${userId}`);
  return data.orders;
}
```

```tsx
// frontend/app/orders/page.tsx
export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const userId = 1; // In practice: read from auth context

  useEffect(() => {
    fetchOrders(userId).then(setOrders);
  }, [userId]);

  return (
    <main>
      <title>My Orders</title>
      <lazy fallback={<p>Loading orders...</p>}>
        {orders.length === 0 ? (
          <p>No orders yet.</p>
        ) : (
          <ul>
            {orders.map((o) => (
              <li key={o.id}>
                Order #{o.id} - ${o.total} - <strong>{o.status}</strong>
              </li>
            ))}
          </ul>
        )}
      </lazy>
    </main>
  );
}
```

## Schema Branching

PlanetScale's branching is similar to Git branches for your database schema:

```bash
# Install PlanetScale CLI
brew install planetscale/tap/pscale

# Create a development branch
pscale branch create your-db feature/add-shipping

# Connect to a branch
pscale connect your-db feature/add-shipping --port 3309

# Open a deploy request to merge schema changes
pscale deploy-request create your-db feature/add-shipping
```

## Schema Changes (Non-blocking)

PlanetScale supports non-blocking schema changes without table locks:

```sql
-- Run directly on a branch - no ALTER TABLE locks
ALTER TABLE orders ADD COLUMN shipping_address TEXT;
```

Changes are deployed via a deploy request once reviewed.

## Development

Connect to a PlanetScale branch locally:

```bash
pscale connect your-database main --port 3309
# Then connect with mysql2 to 127.0.0.1:3309
```

## Architecture Summary

```
Rakta.js page
  ↓ createRaktaHttp
Backend route (Gaman.js / NestJS)
  ↓ @planetscale/database HTTP driver
PlanetScale serverless MySQL (Vitess + sharding)
  ↓ query rows
JSON response
  ↓
Rakta.js UI
```
