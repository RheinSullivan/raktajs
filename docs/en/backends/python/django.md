# Django Backend Integration

Django is a high-level Python web framework supported in the Rakta.js fullstack ecosystem.

## Overview
- **Architecture**: MTV (Model-Template-View) with built-in admin, ORM, and migrations.
- **Language**: Python 3.10+.
- **Rakta.js Compatibility**: Django REST Framework (DRF) provides JSON API for Rakta.js frontend.

## Requirements
- Python v3.10 or higher
- pip or Poetry

## Installation
```bash
pip install django djangorestframework django-cors-headers
django-admin startproject backend
```

## CLI Generation
```bash
bun create rakta my-app --fullstack --backend=django
```

## Generated Project Structure
```text
backend/
├── backend/
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── users/
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   └── urls.py
├── manage.py
└── requirements.txt
```

## Supported Databases
- PostgreSQL, MySQL, SQLite, MariaDB, Oracle Database.

## Using Django with Rakta.js

Complete end-to-end flow from a Rakta.js frontend component to a Django REST API view and a PostgreSQL database:

### 1. Rakta.js Frontend Component (`frontend/app/users/page.tsx`)
```tsx
import { useEffect, useState } from "react";

export default function UsersPage() {
	const [users, setUsers] = useState<Array<{ id: number; name: string }>>([]);

	useEffect(() => {
		fetch("http://localhost:8000/api/users/")
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

### 2. Django View (`backend/users/views.py`)
```python
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import User
from .serializers import UserSerializer

@api_view(["GET"])
def user_list(request):
    users = User.objects.values("id", "name")
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)
```

### 3. Django URL (`backend/users/urls.py`)
```python
from django.urls import path
from . import views

urlpatterns = [
    path("api/users/", views.user_list),
]
```

## Development
```bash
python manage.py runserver
```

## Deployment
Supports Gunicorn + Nginx, Docker, Railway, Render, Heroku, and AWS.
