# Flask Backend Integration

Flask is a lightweight Python micro-framework supported in the Rakta.js fullstack ecosystem.

## Overview
- **Architecture**: Minimalist with optional extensions for ORM, auth, and CORS.
- **Language**: Python 3.10+.
- **Rakta.js Compatibility**: JSON API endpoints served to Rakta.js frontend via Flask routes.

## Requirements
- Python v3.10 or higher
- pip or Poetry

## Installation
```bash
pip install flask flask-cors
```

## CLI Generation
```bash
bun create rakta my-app --fullstack --backend=flask
```

## Generated Project Structure
```text
backend/
├── app/
│   ├── __init__.py
│   ├── routes/
│   │   └── users.py
│   └── models/
│       └── user.py
├── run.py
└── requirements.txt
```

## Supported Databases
- PostgreSQL, MySQL, SQLite, MongoDB, MariaDB.

## Using Flask with Rakta.js

Complete end-to-end flow from a Rakta.js frontend component to a Flask API route and a PostgreSQL database:

### 1. Rakta.js Frontend Component (`frontend/app/users/page.tsx`)
```tsx
import { useEffect, useState } from "react";

export default function UsersPage() {
	const [users, setUsers] = useState<Array<{ id: number; name: string }>>([]);

	useEffect(() => {
		fetch("http://localhost:5000/api/users")
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

### 2. Flask Route (`backend/app/routes/users.py`)
```python
from flask import Blueprint, jsonify
import psycopg2
import os

users_bp = Blueprint("users", __name__)

@users_bp.route("/api/users")
def get_users():
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()
    cur.execute("SELECT id, name FROM users")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify([{"id": r[0], "name": r[1]} for r in rows])
```

## Development
```bash
flask run --port=5000
```

## Deployment
Supports Gunicorn + Nginx, Docker, Railway, Render, Heroku, and AWS Lambda.
