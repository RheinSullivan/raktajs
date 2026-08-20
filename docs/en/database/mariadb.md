# MariaDB

MariaDB is a high-performance, drop-in replacement for MySQL maintained by the MariaDB Foundation. It is binary-compatible with MySQL clients and ORMs, meaning any MySQL integration guide applies directly.

## When to Use

Use MariaDB when:
- Your hosting provider offers MariaDB instead of MySQL (common on cPanel, shared hosting)
- You need MySQL compatibility with faster query execution (Aria storage engine, improved optimizer)
- You prefer the fully open-source governance of MariaDB over Oracle-maintained MySQL
- You use Galera Cluster for multi-master replication

## Installation

MariaDB uses the same client libraries as MySQL. Any MySQL driver works with MariaDB without modification.

### Node.js / Bun

```bash
bun add mysql2
```

### PHP (Laravel)

Set `DB_CONNECTION=mysql` in `.env` — Laravel treats MariaDB as MySQL internally.

### Python

```bash
pip install mysqlclient
```

## Configuration

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=rakta_db
DB_USERNAME=root
DB_PASSWORD=secret
DB_CHARSET=utf8mb4
```

> MariaDB and MySQL share the same connection string format. All ORM adapters (Drizzle, Prisma, Eloquent, SQLAlchemy) work without extra configuration.

## Project Structure

```
project/
├── frontend/               # Rakta.js frontend
│   ├── app/
│   │   └── inventory/
│   │       └── page.tsx
│   └── services/
│       └── inventory.ts
├── backend/                # Node.js / Gaman.js backend
│   ├── routes/
│   │   └── inventory.ts
│   └── db/
│       └── client.ts       # mysql2 pool (works with MariaDB)
```

## Backend Integration

```typescript
// backend/db/client.ts
import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: process.env.DB_HOST ?? "127.0.0.1",
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USERNAME ?? "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_DATABASE ?? "rakta_db",
  // MariaDB supports utf8mb4 out of the box
  charset: "utf8mb4",
  connectionLimit: 10,
});
```

```typescript
// backend/services/inventoryService.ts
import { pool } from "../db/client";

export interface InventoryItem {
  id: number;
  sku: string;
  name: string;
  quantity: number;
}

export async function getInventory(): Promise<InventoryItem[]> {
  const [rows] = await pool.query<any[]>(
    "SELECT id, sku, name, quantity FROM inventory WHERE quantity > 0 ORDER BY name"
  );
  return rows as InventoryItem[];
}

export async function adjustStock(sku: string, delta: number): Promise<void> {
  await pool.query(
    "UPDATE inventory SET quantity = quantity + ? WHERE sku = ?",
    [delta, sku]
  );
}
```

```typescript
// backend/routes/inventory.ts (Gaman.js)
import { defineRoute } from "gamanjs";
import { getInventory, adjustStock } from "../services/inventoryService";

export default defineRoute({
  "GET /api/inventory": async (ctx) => {
    const items = await getInventory();
    return ctx.json({ items });
  },
  "PATCH /api/inventory/:sku/adjust": async (ctx) => {
    const { delta } = await ctx.json();
    await adjustStock(ctx.params.sku, delta);
    return ctx.json({ ok: true });
  },
});
```

## Rakta.js Frontend Integration

```typescript
// frontend/services/inventory.ts
import { createRaktaHttp } from "raktajs/http";

const api = createRaktaHttp({ baseUrl: process.env.API_URL ?? "http://localhost:4000" });

export async function fetchInventory() {
  const data = await api.get<{ items: InventoryItem[] }>("/api/inventory");
  return data.items;
}

export async function adjustStock(sku: string, delta: number) {
  return api.patch(`/api/inventory/${sku}/adjust`, { delta });
}
```

```tsx
// frontend/app/inventory/page.tsx
export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);

  useEffect(() => {
    fetchInventory().then(setItems);
  }, []);

  return (
    <main>
      <title>Inventory</title>
      <guard isAllowed={items.length > 0} fallback={<p>Loading inventory...</p>}>
        <table>
          <thead>
            <tr><th>SKU</th><th>Name</th><th>Qty</th></tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.sku}</td>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </guard>
    </main>
  );
}
```

## Migrations

MariaDB uses the same SQL DDL as MySQL. The `mysql2` driver executes migrations the same way.

```sql
-- migrations/001_create_inventory.sql
CREATE TABLE IF NOT EXISTS inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sku VARCHAR(64) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Using Drizzle Kit

```bash
bunx drizzle-kit generate
bunx drizzle-kit migrate
```

## Development

Run MariaDB locally with Docker:

```bash
docker run -d \
  --name mariadb-dev \
  -p 3306:3306 \
  -e MARIADB_ROOT_PASSWORD=secret \
  -e MARIADB_DATABASE=rakta_dev \
  mariadb:11
```

## Production

- Any MySQL hosting also accepts MariaDB connections
- **DigitalOcean Managed MySQL** (MariaDB-compatible)
- **AWS RDS MariaDB**
- Self-hosted on VPS with Galera Cluster for high availability

## Architecture Summary

```
Rakta.js page
  ↓ createRaktaHttp
Backend API route (Gaman.js / Laravel / Django)
  ↓ mysql2 pool (MariaDB-compatible)
MariaDB database
  ↓ query result rows
JSON response
  ↓
Rakta.js UI
```
