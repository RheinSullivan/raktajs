# Integrasi Backend Adonis.js

Adonis.js adalah framework Node.js / TypeScript berarsitektur MVC penuh (batteries-included).

## Fitur Utama
- **Arsitektur**: Fullstack MVC dengan Lucid ORM, Auth, dan Validation bawaan.
- **Bahasa**: JavaScript / TypeScript.
- **Kompatibilitas Rakta.js**: Generasi starter backend terintegrasi dengan frontend Rakta.js.

## Penggunaan CLI
```bash
bun create rakta my-app --fullstack --backend=adonis
```

## Struktur Proyek Yang Dihasilkan
```text
backend/
├── start/
│   └── routes.ts
├── app/
│   └── controllers/
├── package.json
└── adonisrc.ts
```

## Database Yang Didukung
- PostgreSQL, MySQL, SQLite, SawitDB (`sawitdb`), Oracle Database.
