# AdonisJS Backend Integration

AdonisJS is a TypeScript-first, full-featured Node.js backend framework supported in the Rakta.js fullstack ecosystem.

## Overview
- **Architecture**: MVC with built-in ORM (Lucid), authentication, and validation.
- **Language**: TypeScript (first-class).
- **Rakta.js Compatibility**: Structured API controllers, CORS, and session-based or token-based auth.

## Requirements
- Node.js v20.0.0 or higher
- TypeScript v5.0 or higher

## Installation
```bash
npm init adonisjs@latest backend
```

## CLI Generation
```bash
bun create rakta my-app --fullstack --backend=adonis
```

## Generated Project Structure
```text
backend/
├── app/
│   ├── controllers/
│   │   └── users_controller.ts
│   ├── models/
│   │   └── user.ts
│   └── middleware/
├── config/
│   ├── cors.ts
│   └── database.ts
├── start/
│   └── routes.ts
├── package.json
└── tsconfig.json
```

## Supported Databases
- PostgreSQL, MySQL, SQLite, MariaDB, SawitDB.

## Using AdonisJS with Rakta.js

Complete end-to-end flow from a Rakta.js frontend component to an AdonisJS backend controller and a PostgreSQL database:

### 1. Rakta.js Frontend Component (`frontend/app/users/page.tsx`)
```tsx
import { useEffect, useState } from "react";

export default function UsersPage() {
	const [users, setUsers] = useState<Array<{ id: number; name: string }>>([]);

	useEffect(() => {
		fetch("http://localhost:3333/api/users")
			.then((res) => res.json())
			.then((data) => setUsers(data));
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

### 2. AdonisJS Controller (`backend/app/controllers/users_controller.ts`)
```typescript
import type { HttpContext } from "@adonisjs/core/http";
import User from "#models/user";

export default class UsersController {
	async index({ response }: HttpContext) {
		const users = await User.query().select("id", "name");
		return response.json(users);
	}
}
```

### 3. AdonisJS Route (`backend/start/routes.ts`)
```typescript
import router from "@adonisjs/core/services/router";
const UsersController = () => import("#controllers/users_controller");

router.get("/api/users", [UsersController, "index"]);
```

## Development
```bash
node ace serve --watch
```

## Deployment
Supports Node.js servers, Docker, Cleavr, Railway, and Render.
