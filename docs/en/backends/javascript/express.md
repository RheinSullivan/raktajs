# Express.js Backend Integration

Express.js is the most popular web framework in the Node.js / JavaScript ecosystem.

## Overview
- **Architecture**: Minimalist and flexible with a middleware chain.
- **Language**: JavaScript / TypeScript.
- **Rakta.js Compatibility**: Unified API endpoint integration with Rakta.js frontend.

## Requirements
- Node.js v18.0.0 or higher
- TypeScript v5.0 or higher

## Installation
```bash
npm install express cors dotenv
npm install -D @types/express @types/cors typescript
```

## CLI Generation
```bash
bun create rakta my-app --fullstack --backend=express
```

## Generated Project Structure
```text
backend/
├── src/
│   ├── index.ts
│   ├── app.ts
│   ├── routes.ts
│   └── controllers/
│       ├── auth.controller.ts
│       └── user.controller.ts
├── package.json
└── tsconfig.json
```

## Configuration
Express is configured through `src/app.ts`:
```typescript
import express from "express";
import cors from "cors";

const app = express();
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

export default app;
```

## Supported Databases
- PostgreSQL, MySQL, SQLite, MongoDB, SawitDB, Oracle Database, MariaDB, Redis.

## Using Express.js with Rakta.js

Here is a complete end-to-end integration flow from a Rakta.js frontend component to an Express.js backend API and a PostgreSQL database:

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

### 2. Express.js Route & Controller (`backend/src/controllers/user.controller.ts`)
```typescript
import { Request, Response } from "express";
import { pool } from "../database/client";

export async function getUsers(req: Request, res: Response) {
	const result = await pool.query("SELECT id, name FROM users");
	res.json({ ok: true, users: result.rows });
}
```

### 3. API Router (`backend/src/routes.ts`)
```typescript
import { Router } from "express";
import { getUsers } from "./controllers/user.controller";

const router = Router();
router.get("/users", getUsers);

export default router;
```

## Development
```bash
bun run dev
```

## Production
```bash
npm run build
npm run start
```

## Deployment
Express.js supports deployment to Node.js servers, Docker, Vercel Serverless Functions, AWS Lambda, Railway, and Render.
