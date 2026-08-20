# Prabogo Backend Integration

Prabogo is a Go web framework supported in the Rakta.js fullstack ecosystem.

## Overview
- **Architecture**: Modular Go HTTP router with middleware support.
- **Language**: Go 1.21+.
- **Rakta.js Compatibility**: JSON API handlers served to Rakta.js frontend.

## Requirements
- Go v1.21 or higher

## Installation
```bash
go mod init backend
go get github.com/prabogo/prabogo
```

## CLI Generation
```bash
bun create rakta my-app --fullstack --backend=prabogo
```

## Generated Project Structure
```text
backend/
├── main.go
├── handlers/
│   └── users.go
├── models/
│   └── user.go
├── go.mod
└── go.sum
```

## Supported Databases
- PostgreSQL, MySQL, SQLite, MongoDB, Redis.

## Using Prabogo with Rakta.js

Complete end-to-end flow from a Rakta.js frontend component to a Prabogo Go handler and a PostgreSQL database:

### 1. Rakta.js Frontend Component (`frontend/app/users/page.tsx`)
```tsx
import { useEffect, useState } from "react";

export default function UsersPage() {
	const [users, setUsers] = useState<Array<{ id: number; name: string }>>([]);

	useEffect(() => {
		fetch("http://localhost:8080/api/users")
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

### 2. Prabogo Handler (`backend/handlers/users.go`)
```go
package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
)

type User struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

func GetUsers(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		rows, err := db.Query("SELECT id, name FROM users")
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		defer rows.Close()

		var users []User
		for rows.Next() {
			var u User
			rows.Scan(&u.ID, &u.Name)
			users = append(users, u)
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(users)
	}
}
```

## Development
```bash
go run main.go
```

## Deployment
Supports standalone binary, Docker, AWS Lambda, Railway, Fly.io, and Render.
