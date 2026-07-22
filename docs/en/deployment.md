# Deployment

## Overview

Rakta projects are Bun-first and can be deployed as static frontend apps,
Bun servers, or platform builds for Vercel, Netlify, and Cloudflare.

Rakta also exposes a first-class deployment adapter API through
`rakta/deployment` and a CLI generator:

```bash
rakta generate deployment vercel
rakta generate deployment netlify
rakta generate deployment cloudflare-workers
rakta generate deployment docker
```

Generated files are intentionally small and platform-native. For example,
the Vercel adapter writes `vercel.json`, the Netlify adapter writes
`netlify.toml`, the Cloudflare adapter writes `wrangler.toml`, and the
Docker adapter writes `Dockerfile` plus `.dockerignore`.

## Adapter API

Use the adapter API when a plugin, template, or internal tool needs to
prepare deployment files without shelling out to the CLI:

```ts
import { createDeploymentAdapter } from "raktajs/deployment";

const adapter = createDeploymentAdapter("vercel", {
  appName: "my-rakta-app",
  outDir: "dist",
});

for (const file of adapter.files) {
  console.log(file.path, file.content);
}
```

Supported targets:

| Target | Runtime |
| --- | --- |
| `node` | Node-compatible server |
| `bun` | Bun server |
| `deno` | Deno server |
| `cloudflare-workers` | Edge worker |
| `cloudflare-pages` | Static edge hosting |
| `netlify` | Static or edge hosting |
| `vercel` | Static or edge hosting |
| `docker` | Containerized Bun app |
| `aws-lambda` | Serverless function |
| `fly` | Bun/Node service |
| `railway` | Bun/Node service |
| `render` | Bun/Node service |
| `firebase` | Static hosting |
| `github-pages` | Static hosting |
| `static` | Generic static export |

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
- [`docsSystem.md`](./docsSystem.md)
