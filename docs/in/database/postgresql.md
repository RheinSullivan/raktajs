# PostgreSQL

PostgreSQL adalah opsi database relasional terbuka yang paling direkomendasikan untuk aplikasi Rakta.js.

## Kapan Menggunakannya
PostgreSQL adalah pilihan serbaguna utama untuk hampir semua jenis aplikasi web, dari startup hingga sistem kompleks yang membutuhkan integritas data ACID, pencarian teks lengkap, dan manipulasi data JSONB.

## Instalasi
Pilih PostgreSQL saat membuat aplikasi baru dengan Rakta CLI:

```bash
bun create rakta aplikasi-saya --fullstack --database=postgresql
```

Atau instal driver ORM pilihan:
- **Node.js / Bun**: `bun add pg` atau `bun add drizzle-orm`
- **PHP**: Extension `pdo_pgsql`
- **Python**: `pip install psycopg2-binary`

## Konfigurasi
Atur string koneksi PostgreSQL pada file `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/app_db?schema=public"
```

## Contoh Penggunaan

### TypeScript (Node.js / Bun)
```typescript
import { Client } from "pg";

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});
await client.connect();

const res = await client.query("SELECT * FROM users WHERE active = $1", [true]);
```

## Integrasi dengan Rakta.js
PostgreSQL didukung oleh seluruh ORM populer di ekosistem Rakta.js seperti Prisma, Drizzle ORM, TypeORM, Kysely, Eloquent, SQLAlchemy, dan GORM.

## Development
Menjalankan PostgreSQL secara lokal lewat Docker:

```bash
docker run -d --name pg-dev -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:16
```

## Production
Untuk production, gunakan penyedia managed PostgreSQL seperti AWS RDS, DigitalOcean Managed Database, Supabase, atau Neon.

## Catatan
- Sangat efisien untuk query kompleks dan pemrosesan JSON native.
