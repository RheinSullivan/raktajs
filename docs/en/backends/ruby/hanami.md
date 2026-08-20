# Hanami Backend Integration

Hanami is a modern, lightweight Ruby web framework supported in the Rakta.js fullstack ecosystem.

## Overview
- **Architecture**: Clean architecture with separate slices, actions, and repositories.
- **Language**: Ruby 3.1+.
- **Rakta.js Compatibility**: JSON API slices served to Rakta.js frontend.

## Requirements
- Ruby v3.1 or higher
- Hanami v2.0 or higher
- Bundler

## Installation
```bash
gem install hanami
hanami new backend
```

## CLI Generation
```bash
bun create rakta my-app --fullstack --backend=hanami
```

## Generated Project Structure
```text
backend/
├── slices/
│   └── api/
│       └── actions/
│           └── users/
│               └── index.rb
├── app/
│   └── relations/
│       └── users.rb
├── config/
│   └── routes.rb
├── Gemfile
└── config/settings.rb
```

## Supported Databases
- PostgreSQL, MySQL, SQLite.

## Using Hanami with Rakta.js

Complete end-to-end flow from a Rakta.js frontend component to a Hanami action and a PostgreSQL database:

### 1. Rakta.js Frontend Component (`frontend/app/users/page.tsx`)
```tsx
import { useEffect, useState } from "react";

export default function UsersPage() {
	const [users, setUsers] = useState<Array<{ id: number; name: string }>>([]);

	useEffect(() => {
		fetch("http://localhost:2300/api/users")
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

### 2. Hanami Action (`backend/slices/api/actions/users/index.rb`)
```ruby
module API
  module Actions
    module Users
      class Index < API::Action
        def handle(request, response)
          users = request.env["app"].relations[:users].select(:id, :name).to_a
          response.body = users.to_json
          response.headers["Content-Type"] = "application/json"
        end
      end
    end
  end
end
```

### 3. Hanami Route (`backend/config/routes.rb`)
```ruby
module Backend
  class Routes < Hanami::Routes
    slice :api, at: "/api" do
      get "/users", to: "users.index"
    end
  end
end
```

## Development
```bash
hanami server --port=2300
```

## Deployment
Supports Docker, Heroku, Railway, and Render.
