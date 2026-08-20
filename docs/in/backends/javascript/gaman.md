# Integrasi Gaman.js (Default / Powered Backend)

Gaman.js adalah **framework backend utama, native, dan default** untuk aplikasi fullstack Rakta.js. Dibangun khusus untuk Bun runtime dengan performa tinggi dan modul terpisah, Gaman.js memberikan integrasi tanpa gesekan dengan Rakta.js.

## Status
- **Peran**: Default & Powered Rakta.js Backend
- **Status Implementasi**: IMPLEMENTED
- **Ekosistem**: JavaScript / TypeScript

## Persyaratan
- Bun runtime v1.0.0 atau lebih tinggi
- Node.js v20.0.0 atau lebih tinggi (opsional)
- TypeScript v5.0 atau lebih tinggi

## Instalasi
Saat membuat proyek fullstack Rakta.js, Gaman.js terpilih secara otomatis.
```bash
bun add gaman @gaman/core @gaman/michi @gaman/cors
```

## Generasi
```bash
bun create rakta my-app --fullstack --backend=gaman
```

## Struktur Hasil Generasi
```
backend/
├── package.json
├── tsconfig.json
├── .env.example
├── README.md
└── src/
    ├── index.ts
    ├── app.ts
    ├── auth/
    │   └── auth.service.ts
    ├── controllers/
    │   ├── auth.controller.ts
    │   ├── cms.controller.ts
    │   └── user.controller.ts
    ├── database/
    │   └── client.ts
    ├── routes/
    │   ├── api.ts
    │   └── router.ts
    └── security/
        └── jwt.ts
```

## Konfigurasi
Dikonfigurasi melalui `src/app.ts` dan `src/routes/router.ts`.

## Lingkungan / Environment
```env
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://localhost:5432/db
JWT_SECRET=rakta_gaman_super_secret_key
REFRESH_TOKEN_SECRET=rakta_gaman_refresh_secret
```

## Routing
Routing menggunakan Gaman.js radix-tree router:
```typescript
import { Router } from "./routes/router";

export const apiRouter = new Router();
apiRouter.get("/users", getUsersHandler);
```

## Middleware
Pipeline middleware menangani siklus request, CORS, dan autentikasi.

## Autentikasi
Manajemen rotasi token JWT dan sesi melalui `src/security/jwt.ts` dan `src/auth/auth.service.ts`.

## Database
Mendukung PostgreSQL, MySQL, SQLite, dan SawitDB native engine (`@wowoengine/sawitdb-ts`).

## Menggunakan Gaman.js dengan Rakta.js

Berikut adalah contoh alur integrasi lengkap dari komponen frontend Rakta.js ke backend Gaman.js dan database SawitDB / PostgreSQL:

### 1. Komponen Frontend Rakta.js (`frontend/app/users/page.tsx`)
```tsx
import { useEffect, useState } from "react";

export default function UsersPage() {
	const [users, setUsers] = useState<Array<{ id: number; name: string }>>([]);

	useEffect(() => {
		fetch("http://localhost:4000/api/users")
			.then((res) => res.json())
			.then((data) => setUsers(data.users));
	}, []);

	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold">Daftar Pengguna</h1>
			<ul className="mt-4 space-y-2">
				{users.map((user) => (
					<li key={user.id} className="p-3 bg-zinc-800 rounded-md">
						{user.name}
					</li>
				))}
			</ul>
		</div>
	);
}
```

### 2. Gaman.js Route & Controller (`backend/src/controllers/user.controller.ts`)
```typescript
import { databaseClient } from "../database/client";

export async function getUsersHandler(req: Request): Promise<Response> {
	const db = await databaseClient.connect();
	const users = await db.query("SELECT id, name FROM users");

	return Response.json({ ok: true, users });
}
```

## Pengembangan (Development)
```bash
bun run dev
```

## Produksi (Production)
```bash
bun run build
bun run start
```

## Pengujian (Testing)
```bash
bun test
```

## Penggelaran (Deployment)
Mendukung Bun standalone binary, Docker, Cloudflare Workers, dan Vercel.

## Batasan Yang Diketahui
- Membutuhkan Bun runtime untuk fitur kecepatan maksimal native.
