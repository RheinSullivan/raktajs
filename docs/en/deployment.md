# Deployment

## Overview

Rakta projects are Bun-first and can be deployed as static frontend apps,
Bun servers, or platform builds for Vercel, Netlify, and Cloudflare.

## Static frontend

Use static export for SSG or SPA deployments:

```bash
bun run build
```

Upload the generated frontend output to any static host.

## Vercel

Use a project-level build command:

```bash
bun run build
```

For fullstack apps, deploy `frontend/` as the web project and deploy
`backend/` separately as a Bun-compatible service.

## Netlify

Set the build command to:

```bash
bun run build
```

Set the publish directory to the frontend build output configured in
`rakta.config.ts`.

## Cloudflare

For static sites, deploy the frontend build output to Cloudflare Pages.
For Workers, keep handlers Fetch API compatible and avoid Node-only APIs
inside request handlers.

## Docker

Fullstack apps can run with Bun in a small container:

```dockerfile
FROM oven/bun:1
WORKDIR /app
COPY . .
RUN bun install --frozen-lockfile
RUN bun run build
CMD ["bun", "run", "start"]
```

## Environment variables

Common fullstack variables:

| Variable | Purpose |
| --- | --- |
| `PORT` | Backend server port |
| `CORS_ORIGIN` | Frontend origin allowed by the API |
| `DATABASE_URL` | Database connection string |
| `AUTH_SECRET` | JWT signing secret, at least 32 characters |
| `SESSION_MODE` | `single` or `multi` session behavior |

## Related docs

- [`templates.md`](./templates.md)
- [`kernel.md`](./kernel.md)
- [`middleware.md`](./middleware.md)
