# Ruby on Rails Backend Integration

Ruby on Rails is a full-featured Ruby web framework supported in the Rakta.js fullstack ecosystem.

## Overview
- **Architecture**: MVC with ActiveRecord ORM, convention over configuration.
- **Language**: Ruby 3.1+.
- **Rakta.js Compatibility**: Rails API mode provides JSON endpoints for Rakta.js frontend.

## Requirements
- Ruby v3.1 or higher
- Rails v7.0 or higher
- Bundler

## Installation
```bash
rails new backend --api --database=postgresql
```

## CLI Generation
```bash
bun create rakta my-app --fullstack --backend=rails
```

## Generated Project Structure
```text
backend/
├── app/
│   ├── controllers/
│   │   └── api/
│   │       └── users_controller.rb
│   └── models/
│       └── user.rb
├── config/
│   └── routes.rb
├── db/
│   └── migrate/
├── Gemfile
└── config/database.yml
```

## Supported Databases
- PostgreSQL, MySQL, SQLite, MariaDB.

## Using Ruby on Rails with Rakta.js

Complete end-to-end flow from a Rakta.js frontend component to a Rails API controller and a PostgreSQL database:

### 1. Rakta.js Frontend Component (`frontend/app/users/page.tsx`)
```tsx
import { useEffect, useState } from "react";

export default function UsersPage() {
	const [users, setUsers] = useState<Array<{ id: number; name: string }>>([]);

	useEffect(() => {
		fetch("http://localhost:3001/api/users")
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

### 2. Rails Controller (`backend/app/controllers/api/users_controller.rb`)
```ruby
module Api
  class UsersController < ApplicationController
    def index
      users = User.select(:id, :name)
      render json: users
    end
  end
end
```

### 3. Rails Route (`backend/config/routes.rb`)
```ruby
Rails.application.routes.draw do
  namespace :api do
    resources :users, only: [:index]
  end
end
```

## Development
```bash
rails server -p 3001
```

## Deployment
Supports Docker, Heroku, Railway, Render, Fly.io, and AWS.
