# Authentication

## Overview

The fullstack generator includes a working authentication starter with
JWT, HTTP-only session cookies, and single-session mode.

The starter uses Bun password hashing, Web Crypto HMAC signatures, and a
request middleware that can protect API routes.

## Generated endpoints

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/api/auth/register` | `POST` | Creates a user |
| `/api/auth/login` | `POST` | Returns a JWT and sets `rakta_session` |
| `/api/auth/me` | `GET` | Returns the authenticated user |
| `/api/auth/logout` | `POST` | Revokes the current session |
| `/api/auth/forgot-password` | `POST` | Creates a password reset OTP |
| `/api/auth/reset-password` | `POST` | Resets the password using the OTP |
| `/api/users` | `GET` / `POST` | Lists or creates users |
| `/api/users/:id` | `PATCH` / `DELETE` | Updates or deletes a user |
| `/api/cms/posts` | `GET` / `POST` | Lists or creates CMS posts |
| `/api/cms/posts/:id` | `PATCH` / `DELETE` | Updates or deletes a CMS post |

## Login example

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@rakta.local","password":"rakta-password"}'
```

## Session modes

Set `SESSION_MODE=single` to revoke the previous session whenever the same
user logs in again. Set `SESSION_MODE=multi` to allow multiple active
sessions.

## Security notes

- Set a unique `AUTH_SECRET` in every deployed environment.
- Use HTTPS in production so session cookies are protected in transit.
- Replace the generated demo user with your database-backed user table.

## Fullstack template

The physical `templates/fullStack` starter includes the same frontend
visual system as `templates/frontendOnly`, plus login, register, forgot
password OTP, reset password, dashboard, auth routes, and CRUD-style user
controllers. Its default backend is Gaman.js and follows a
Laravel/Adonis-like structure with routes, controllers, services, models,
middleware, validation, role-based user CRUD, and CMS post CRUD.

## Related docs

- [`templates.md`](./templates.md)
- [`middleware.md`](./middleware.md)
- [`deployment.md`](./deployment.md)
