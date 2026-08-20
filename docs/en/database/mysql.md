# MySQL

MySQL is one of the most widely deployed relational databases in the world. All Rakta.js backend adapters support MySQL through their standard ORM or database driver integrations.

## When to Use

Use MySQL when your stack includes:
- PHP backends (Laravel, CodeIgniter) where MySQL is the default
- Applications hosted on shared hosting with MySQL pre-installed
- Teams with existing MySQL experience
- Workloads requiring high read throughput on relational data

## Installation

### Node.js / Bun

```bash
bun add mysql2
# or with Drizzle ORM
bun add drizzle-orm mysql2
```

### PHP (Laravel)

Built-in via PDO MySQL. Configure in `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=rakta_db
DB_USERNAME=root
DB_PASSWORD=secret
```

### Python (Django)

```bash
pip install mysqlclient
```

### Go (Prabogo / Beego)

```bash
go get github.com/go-sql-driver/mysql
```

### Java (Spring Boot)

```xml
<dependency>
  <groupId>com.mysql</groupId>
  <artifactId>mysql-connector-j</artifactId>
  <scope>runtime</scope>
</dependency>
```

## Project Structure

```
project/
├── frontend/           # Rakta.js frontend
│   ├── app/
│   │   └── products/
│   │       └── page.tsx           # Fetches /api/products
│   └── services/
│       └── products.ts            # API client
├── backend/            # Node.js / Gaman.js or Laravel
│   ├── routes/
│   │   └── products.ts
│   ├── services/
│   │   └── productService.ts
│   └── db/
│       └── client.ts              # mysql2 connection pool
```

## Backend Integration

### Node.js + mysql2

```typescript
// backend/db/client.ts
import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: process.env.DB_HOST ?? "127.0.0.1",
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USERNAME ?? "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_DATABASE ?? "rakta_db",
  connectionLimit: 10,
});
```

```typescript
// backend/services/productService.ts
import { pool } from "../db/client";

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

export async function getProducts(): Promise<Product[]> {
  const [rows] = await pool.query<any[]>(
    "SELECT id, name, price, stock FROM products WHERE active = 1 ORDER BY created_at DESC"
  );
  return rows as Product[];
}
```

```typescript
// backend/routes/products.ts (Gaman.js)
import { defineRoute } from "gamanjs";
import { getProducts } from "../services/productService";

export default defineRoute({
  "GET /api/products": async (ctx) => {
    const products = await getProducts();
    return ctx.json({ products });
  },
});
```

### Laravel Backend Integration

```php
// routes/api.php
Route::get('/products', [ProductController::class, 'index']);

// app/Http/Controllers/ProductController.php
public function index(): JsonResponse
{
    $products = Product::where('active', 1)->latest()->get();
    return response()->json(['products' => $products]);
}
```

```php
// app/Models/Product.php
class Product extends Model
{
    protected $fillable = ['name', 'price', 'stock'];
}
```

## Rakta.js Frontend Integration

```typescript
// frontend/services/products.ts
import { createRaktaHttp } from "raktajs/http";

const api = createRaktaHttp({
  baseUrl: process.env.API_URL ?? "http://localhost:4000",
});

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

export async function fetchProducts(): Promise<Product[]> {
  const data = await api.get<{ products: Product[] }>("/api/products");
  return data.products;
}
```

```tsx
// frontend/app/products/page.tsx
export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  return (
    <main>
      <title>Products</title>
      <lazy fallback={<p>Loading products...</p>}>
        <guard isAllowed={!loading} fallback={<p>Loading...</p>}>
          <ul>
            {products.map((p) => (
              <li key={p.id}>
                <click to={`/products/${p.id}`}>
                  {p.name} — ${p.price}
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

## Migrations

### Node.js (Drizzle Kit)

```bash
bunx drizzle-kit generate
bunx drizzle-kit migrate
```

### Laravel

```bash
php artisan migrate
php artisan migrate:rollback
php artisan db:seed
```

## Development

Run MySQL locally with Docker:

```bash
docker run -d \
  --name mysql-dev \
  -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=secret \
  -e MYSQL_DATABASE=rakta_dev \
  mysql:8
```

## Production

- **PlanetScale** — serverless MySQL with branching workflow
- **AWS RDS MySQL** — managed, multi-AZ
- **DigitalOcean Managed MySQL** — simple cloud MySQL
- **Railway** — zero-config MySQL hosting

## Architecture Summary

```
Rakta.js page
  ↓ createRaktaHttp
Backend API route
  ↓ mysql2 / Eloquent / GORM
MySQL database
  ↓ query results
Service layer
  ↓ JSON
Rakta.js UI update
```
