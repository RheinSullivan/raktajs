# Beego Backend Integration

Beego is a full-featured Go web framework supported in the Rakta.js fullstack ecosystem.

## Overview
- **Architecture**: MVC with built-in ORM, session management, and task scheduler.
- **Language**: Go 1.21+.
- **Rakta.js Compatibility**: JSON API controllers served to Rakta.js frontend.

## Requirements
- Go v1.21 or higher

## Installation
```bash
go install github.com/beego/bee/v2@latest
bee new backend
```

## CLI Generation
```bash
bun create rakta my-app --fullstack --backend=beego
```

## Generated Project Structure
```text
backend/
├── controllers/
│   └── user.go
├── models/
│   └── user.go
├── routers/
│   └── router.go
├── main.go
├── go.mod
└── go.sum
```

## Supported Databases
- PostgreSQL, MySQL, SQLite, MongoDB.

## Using Beego with Rakta.js

Complete end-to-end flow from a Rakta.js frontend component to a Beego controller and a PostgreSQL database:

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

### 2. Beego Controller (`backend/controllers/user.go`)
```go
package controllers

import (
	"github.com/beego/beego/v2/server/web"
	"backend/models"
)

type UserController struct {
	web.Controller
}

func (c *UserController) GetAll() {
	users, err := models.GetAllUsers()
	if err != nil {
		c.Ctx.Output.SetStatus(500)
		c.Data["json"] = map[string]string{"error": err.Error()}
	} else {
		c.Data["json"] = users
	}
	c.ServeJSON()
}
```

### 3. Beego Router (`backend/routers/router.go`)
```go
package routers

import (
	"github.com/beego/beego/v2/server/web"
	"backend/controllers"
)

func init() {
	web.Router("/api/users", &controllers.UserController{}, "get:GetAll")
}
```

## Development
```bash
bee run
```

## Deployment
Supports standalone binary, Docker, AWS, Railway, and Render.
