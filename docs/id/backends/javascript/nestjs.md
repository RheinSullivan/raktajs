# Integrasi Backend Nest.js

Nest.js adalah framework Node.js / TypeScript berarsitektur enterprise yang didukung dalam ekosistem fullstack Rakta.js.

## Fitur Utama
- **Arsitektur**: Modular dengan Dependency Injection (DI).
- **Bahasa**: JavaScript / TypeScript.
- **Kompatibilitas Rakta.js**: Auto import frontend, komunikasi API type-safe, integrasi CORS.

## Penggunaan CLI
```bash
bun create rakta my-app --fullstack --backend=nestjs
```

## Struktur Proyek Yang Dihasilkan
```text
backend/
├── src/
│   ├── app.module.ts
│   ├── app.controller.ts
│   ├── app.service.ts
│   └── main.ts
├── package.json
└── tsconfig.json
```

## Database Yang Didukung
- PostgreSQL, MySQL, SQLite, MongoDB, SawitDB (`sawitdb`), Oracle Database.
