# Data Seeder untuk Pengujian

Template fullstack Gaman.js menyertakan seeder database di `backend/src/database/seeders/`.
Seeder mengisi mock user, post CMS, dan record pengujian untuk development lokal serta integration test.

```bash
cd backend
bun run db:seed
```

Seeder juga bisa dipanggil dari startup backend atau setup test:

```ts
import { runDatabaseSeeders } from "./database/seeders/index";

await runDatabaseSeeders();
```

Seeder adalah utilitas template. Pisahkan data seed produksi dari data test, dan jangan commit kredensial atau data pribadi asli.
