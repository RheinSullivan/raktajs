# Laravel Backend Integration

Laravel is a PHP web framework with elegant syntax, supported in the Rakta.js fullstack ecosystem.

## Overview
- **Architecture**: MVC with Eloquent ORM, Blade templates, and Artisan CLI.
- **Language**: PHP 8.1+.
- **Rakta.js Compatibility**: REST API backend serving JSON to Rakta.js frontend via Laravel routes and controllers.

## Requirements
- PHP v8.1 or higher
- Composer v2.0 or higher

## Installation
```bash
composer create-project laravel/laravel backend
```

## CLI Generation
```bash
bun create rakta my-app --fullstack --backend=laravel
```

## Generated Project Structure
```text
backend/
├── app/
│   ├── Http/
│   │   └── Controllers/
│   │       └── UserController.php
│   └── Models/
│       └── User.php
├── routes/
│   └── api.php
├── database/
│   └── migrations/
├── composer.json
└── .env
```

## Supported Databases
- PostgreSQL, MySQL, SQLite, MariaDB, Oracle Database.

## Using Laravel with Rakta.js

Complete end-to-end flow from a Rakta.js frontend component to a Laravel API controller and a MySQL database:

### 1. Rakta.js Frontend Component (`frontend/app/users/page.tsx`)
```tsx
import { useEffect, useState } from "react";

export default function UsersPage() {
	const [users, setUsers] = useState<Array<{ id: number; name: string }>>([]);

	useEffect(() => {
		fetch("http://localhost:8000/api/users")
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

### 2. Laravel Controller (`backend/app/Http/Controllers/UserController.php`)
```php
<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    public function index(): JsonResponse
    {
        $users = User::select('id', 'name')->get();
        return response()->json($users);
    }
}
```

### 3. Laravel Route (`backend/routes/api.php`)
```php
<?php

use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/users', [UserController::class, 'index']);
```

## Development
```bash
php artisan serve --port=8000
```

## Deployment
Supports shared hosting, Docker, Laravel Forge, Vapor (AWS Lambda), Railway, and Render.
