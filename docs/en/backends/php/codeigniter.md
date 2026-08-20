# CodeIgniter Backend Integration

CodeIgniter is a lightweight PHP framework supported in the Rakta.js fullstack ecosystem.

## Overview
- **Architecture**: MVC with simple configuration and small footprint.
- **Language**: PHP 8.1+.
- **Rakta.js Compatibility**: REST API backend serving JSON to Rakta.js frontend.

## Requirements
- PHP v8.1 or higher
- Composer v2.0 or higher

## Installation
```bash
composer create-project codeigniter4/appstarter backend
```

## CLI Generation
```bash
bun create rakta my-app --fullstack --backend=codeigniter
```

## Generated Project Structure
```text
backend/
├── app/
│   ├── Controllers/
│   │   └── UserController.php
│   ├── Models/
│   │   └── UserModel.php
│   └── Config/
│       └── Routes.php
├── composer.json
└── .env
```

## Supported Databases
- PostgreSQL, MySQL, SQLite, MariaDB, Oracle Database.

## Using CodeIgniter with Rakta.js

Complete end-to-end flow from a Rakta.js frontend component to a CodeIgniter API controller and a MySQL database:

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

### 2. CodeIgniter Controller (`backend/app/Controllers/UserController.php`)
```php
<?php

namespace App\Controllers;

use App\Models\UserModel;
use CodeIgniter\RESTful\ResourceController;

class UserController extends ResourceController
{
    public function index()
    {
        $model = new UserModel();
        $users = $model->select('id, name')->findAll();
        return $this->respond($users);
    }
}
```

### 3. CodeIgniter Route (`backend/app/Config/Routes.php`)
```php
$routes->get('api/users', 'UserController::index');
```

## Development
```bash
php spark serve --port=8080
```

## Deployment
Supports shared hosting, Docker, cPanel, and cloud servers.
