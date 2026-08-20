# Integrasi SQLite

SQLite adalah database SQL tersemat (embedded) tanpa perlu menginstal service server terpisah.

## Penggunaan CLI
```bash
bun create rakta aplikasi-saya --fullstack --database=sqlite
```

## Fitur Utama
- Zero-configuration, disimpan dalam satu berkas `.db` lokal, cocok untuk pengembangan cepat dan aplikasi desktop/edge.

## Contoh Penggunaan Bun Native SQLite
```typescript
import { Database } from "bun:sqlite";

const db = new Database("app.db");
db.query("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT)").run();
```
