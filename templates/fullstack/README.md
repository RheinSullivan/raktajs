# Rakta.js fullstack template

The fullstack template creates a workspace with:

```txt
my-app/
├─ frontend/
├─ backend/
├─ shared/
├─ package.json
├─ tsconfig.base.json
└─ README.md
```

## What it includes

- Rakta.js frontend with the same visual starter system as `templates/frontendOnly`
- Auth screens for login, register, forgot password OTP, and reset password
- Dashboard template with CRUD-oriented admin surface
- Gaman.js backend structured like Laravel and Adonis: routes, controllers, services, models, validation, middleware, and resources
- Database config for PostgreSQL, MySQL, MongoDB, Firebase, SQLite, MariaDB, Redis, PlanetScale, Neon, or Turso
- JWT auth, HTTP-only session cookie auth, single-session mode, OTP password reset, role-based user CRUD, and CMS post CRUD endpoints
- Shared TypeScript contracts
- Deployment-ready environment variables

## Run

```bash
bun install
bun run dev:frontend
bun run dev:backend
```

## Deploy

Deploy `frontend/` as a web/static project and `backend/` as a Bun service.
See `docs/en/deployment.md` and `docs/id/deployment.md`.
