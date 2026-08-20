# Gaman.js Integration (Default / Powered Backend)

Gaman.js is the **primary, native, and default backend framework** for fullstack Rakta.js applications. Built specifically for the Bun runtime with high performance and separated modules, Gaman.js provides zero-friction integration with Rakta.js.

## Status
- **Role**: Default & Powered Rakta.js Backend
- **Implementation Status**: IMPLEMENTED
- **Ecosystem**: JavaScript / TypeScript

## Requirements
- Bun runtime v1.0.0 or higher
- Node.js v20.0.0 or higher (optional)
- TypeScript v5.0 or higher

## Installation
When creating a fullstack Rakta.js project, Gaman.js is automatically selected.
```bash
bun add gaman @gaman/core @gaman/michi @gaman/cors
```

## CLI Generation
```bash
bun create rakta my-app --fullstack --backend=gaman
```

## Generated Project Structure
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

## Configuration
Configured through `src/app.ts` and `src/routes/router.ts`.

## Environment Variables
```env
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://localhost:5432/db
JWT_SECRET=rakta_gaman_super_secret_key
REFRESH_TOKEN_SECRET=rakta_gaman_refresh_secret
```

## Routing
Uses Gaman.js radix-tree router:
```typescript
import { Router } from "./routes/router";

export const apiRouter = new Router();
apiRouter.get("/users", getUsersHandler);
```

## Middleware
The middleware pipeline handles request lifecycle, CORS, and authentication.

## Authentication
JWT token rotation and session management via `src/security/jwt.ts` and `src/auth/auth.service.ts`.

## Database
Supports PostgreSQL, MySQL, SQLite, and SawitDB native engine (`@wowoengine/sawitdb-ts`).

## Using Gaman.js with Rakta.js

Here is a complete end-to-end integration flow from a Rakta.js frontend component to a Gaman.js backend and SawitDB / PostgreSQL database:

### 1. Rakta.js Frontend Component (`frontend/app/users/page.tsx`)
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
			<h1 className="text-2xl font-bold">User List</h1>
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

## Development
```bash
bun run dev
```

## Production
```bash
bun run build
bun run start
```

## Testing
```bash
bun test
```

## Deployment
Supports Bun standalone binary, Docker, Cloudflare Workers, and Vercel.

## Known Limitations
- Requires Bun runtime for maximum native speed features.
