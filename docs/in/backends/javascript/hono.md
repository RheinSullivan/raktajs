# Integrasi Backend Hono.js

Hono.js adalah framework edge web ultra-cepat untuk Bun, Cloudflare Workers, Deno, dan Node.js.

## Fitur Utama
- **Arsitektur**: Ultrafast, ringan, edge-first router.
- **Bahasa**: JavaScript / TypeScript.
- **Kompatibilitas Rakta.js**: Komunikasi RPC type-safe dan deployment edge.

## Penggunaan CLI
```bash
bun create rakta my-app --fullstack --backend=hono
```

## Struktur Proyek Yang Dihasilkan
```text
backend/
├── src/
│   └── index.ts
├── package.json
└── tsconfig.json
```

## Database Yang Didukung
- SawitDB (`@wowoengine/sawitdb-ts`), PostgreSQL, MySQL, SQLite, Turso, Cloudflare D1.
