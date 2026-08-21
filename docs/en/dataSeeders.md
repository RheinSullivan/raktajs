# Data Seeders for Testing

Gaman.js fullstack templates include database seeders under `backend/src/database/seeders/`.
They populate mock users, CMS posts, and test records for local development and integration tests.

```bash
cd backend
bun run db:seed
```

You can also call the seeder runner from backend startup or a test setup file:

```ts
import { runDatabaseSeeders } from "./database/seeders/index";

await runDatabaseSeeders();
```

Seeders are template utilities. Keep production seed data separate from test seed data, and avoid committing real credentials or personal data.
