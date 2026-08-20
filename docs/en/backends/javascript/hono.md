# Hono.js Backend Integration

Hono is a web-standard, multi-runtime JavaScript backend framework supported in the Rakta.js fullstack ecosystem.

## Overview
- **Architecture**: Lightweight, fast, web-standard API with middleware support.
- **Language**: TypeScript / JavaScript.
- **Rakta.js Compatibility**: Runs on Bun, Deno, Cloudflare Workers, and Node.js. Shares the Web Standards fetch API model with Rakta.js.

## Requirements
- Bun v1.0.0 or higher, OR Node.js v18.0.0 or higher, OR Deno, OR Cloudflare Workers
- TypeScript v5.0 or higher

## Installation
```bash
bun add hono
```

## CLI Generation
```bash
bun create rakta my-app --fullstack --backend=hono
```

## Generated Project Structure
```text
backend/
├── src/
│   ├── index.ts
│   ├── routes/
│   │   └── users.ts
│   └── middleware/
│       └── cors.ts
├── package.json
└── tsconfig.json
```

## Supported Databases
- PostgreSQL, MySQL, SQLite, MongoDB, SawitDB, Redis, Turso, Neon, PlanetScale.

## Using Hono with Rakta.js

Complete end-to-end flow from a Rakta.js frontend component to a Hono backend route and a PostgreSQL database:

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
					<li key={user.id} className="p-3 bg-zinc-800 rounded-md">{user.name}</li>
				))}
			</ul>
		</div>
	);
}
```

### 2. Hono Route (`backend/src/routes/users.ts`)
```typescript
import { Hono } from "hono";
import { Pool } from "pg";

const app = new Hono();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.get("/api/users", async (c) => {
	const result = await pool.query("SELECT id, name FROM users");
	return c.json({ ok: true, users: result.rows });
});

export default app;
```

## Development
```bash
bun run dev
```

## Deployment
Supports Bun, Node.js, Deno, Cloudflare Workers, Cloudflare Pages, Vercel Edge Functions, AWS Lambda, and Netlify Edge.
