# Integrasi Backend Express.js

Express.js adalah framework web yang paling populer di ekosistem Node.js / JavaScript.

## Fitur Utama
- **Arsitektur**: Minimalis dan fleksibel dengan middleware chain.
- **Bahasa**: JavaScript / TypeScript.
- **Kompatibilitas Rakta.js**: Integrasi API endpoint terpadu untuk frontend Rakta.js.

## Penggunaan CLI
```bash
bun create rakta my-app --fullstack --backend=express
```

## Struktur Proyek Yang Dihasilkan
```text
backend/
├── src/
│   ├── index.ts
│   ├── routes.ts
│   └── controllers/
├── package.json
└── tsconfig.json
```

## Database Yang Didukung
- PostgreSQL, MySQL, SQLite, MongoDB, SawitDB (`sawitdb`), Oracle Database.
