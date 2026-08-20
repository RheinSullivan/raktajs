# Nest.js Backend Integration

Nest.js is an enterprise-grade Node.js / TypeScript framework supported in the Rakta.js fullstack ecosystem.

## Overview
- **Architecture**: Modular with Dependency Injection (DI), decorators, and modules.
- **Language**: TypeScript (first-class).
- **Rakta.js Compatibility**: Frontend auto-import, type-safe API communication, CORS integration.

## Requirements
- Node.js v18.0.0 or higher
- TypeScript v5.0 or higher

## Installation
```bash
npm install @nestjs/core @nestjs/common @nestjs/platform-express
npm install -D @nestjs/cli typescript
```

## CLI Generation
```bash
bun create rakta my-app --fullstack --backend=nestjs
```

## Generated Project Structure
```text
backend/
├── src/
│   ├── app.module.ts
│   ├── app.controller.ts
│   ├── app.service.ts
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   └── users.service.ts
│   └── main.ts
├── package.json
└── tsconfig.json
```

## Supported Databases
- PostgreSQL, MySQL, SQLite, MongoDB, SawitDB, Oracle Database, MariaDB.

## Using Nest.js with Rakta.js

Complete end-to-end flow from a Rakta.js frontend component to a Nest.js backend module and a PostgreSQL database:

### 1. Rakta.js Frontend Component (`frontend/app/users/page.tsx`)
```tsx
import { useEffect, useState } from "react";

export default function UsersPage() {
	const [users, setUsers] = useState<Array<{ id: number; name: string }>>([]);

	useEffect(() => {
		fetch("http://localhost:4000/api/users")
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

### 2. Nest.js Controller (`backend/src/users/users.controller.ts`)
```typescript
import { Controller, Get } from "@nestjs/common";
import { UsersService } from "./users.service";

@Controller("api/users")
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get()
	async findAll() {
		return this.usersService.findAll();
	}
}
```

### 3. Nest.js Service (`backend/src/users/users.service.ts`)
```typescript
import { Injectable } from "@nestjs/common";
import { Pool } from "pg";

@Injectable()
export class UsersService {
	private pool = new Pool({ connectionString: process.env.DATABASE_URL });

	async findAll() {
		const result = await this.pool.query("SELECT id, name FROM users");
		return result.rows;
	}
}
```

## Development
```bash
bun run dev
```

## Deployment
Supports Node.js servers, Docker, AWS Lambda, Vercel, Railway, and Render.
