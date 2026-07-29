# Rakta.js Architecture

This document explains how the framework is structured internally. If you want to contribute, build plugins, or understand how requests flow through the system, this is the right starting point.

---

## Overview

Rakta.js is a modular framework organized around a central kernel. Each module has a single responsibility and can be imported independently. The build system tree-shakes everything you don't import.

```
Request
  │
  ▼
RaktaMiddleware     ← before() hooks, edge middleware
  │
  ▼
NorthCoastFlow      ← resolve render mode (CSR/SSR/SSG/ISR/hybrid)
  │
  ▼
MegaWeave Router    ← match route to handler
  │
  ▼
Route Handler       ← page component or API endpoint
  │
  ▼
NagaLimanWire (RPC) ← optional type-safe procedure call
  │
  ▼
RaktaMiddleware     ← after() hooks
  │
  ▼
Response
```

---

## RaktaKernel - Dependency Injection Container

The kernel is the foundation. It manages services, environments, plugins, and the startup/shutdown lifecycle.

```typescript
import { createRaktaKernel } from "rakta/kernel";

const kernel = createRaktaKernel({
  environmentName: "production",
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
  },
});

// Register a service as a singleton
kernel.services.singleton("db", () => connectDatabase(
  kernel.environment.require("DATABASE_URL")
));

// Register a plugin
kernel.use({
  name: "my-plugin",
  async configure(context) {
    context.registerFeature({ name: "my-feature", enabled: true });
  },
  async ready() {
    console.log("Plugin ready.");
  },
});

await kernel.start(); // runs all lifecycle phases
```

### Plugin Lifecycle

| Phase | When | Purpose |
|-------|------|---------|
| `configure` | Kernel start | Register features, services, middleware |
| `start` | After all plugins configured | Connect to databases, start background tasks |
| `ready` | App fully initialized | Log readiness, run health checks |
| `shutdown` | App shutting down | Clean up connections, flush queues |

### Startup Pipeline

The `createStartupPipeline()` function provides an ordered, phase-based lifecycle:

```
preload → configure → start → ready
```

Each phase runs sequentially. Tasks within a phase run by priority order. Shutdown runs phases in reverse (LIFO).

### Module Loader

`createModuleLoader()` lazy-loads plugins from dynamic importers with error isolation:

```typescript
const loader = createModuleLoader();
const modules = await loader.loadMany([
  () => import("./plugins/analytics"),
  () => import("./plugins/auth"),
]);
```

---

## RaktaMiddleware - Request Pipeline

Middleware runs before and after route handlers. All middleware is async-first.

```typescript
import { defineMiddleware, compose } from "rakta/middleware";

const authMiddleware = defineMiddleware({
  name: "auth",
  async before({ request, next, redirect, abort }) {
    const token = request.headers.get("Authorization");
    if (!token) return redirect("/login");
    const user = await verifyToken(token);
    if (!user) return abort(401, "Unauthorized");
    return next({ user });
  },
});

const logMiddleware = defineMiddleware({
  name: "logger",
  async before({ request, next }) {
    console.log(`${request.method} ${request.url}`);
    return next();
  },
});

// Compose into a stack
export const apiMiddleware = compose(logMiddleware, authMiddleware);
```

### Middleware Scopes

| Scope | When it runs |
|-------|-------------|
| `global` | Every request |
| `route` | Specific route pattern |
| `api` | API endpoints only |
| `layout` | Layout boundaries |
| `edge` | Edge runtime only |

### Middleware Ordering

Use `createMiddlewareComposer()` for named middleware with priority-based ordering:

```typescript
const composer = createMiddlewareComposer();
composer.add({ name: "logger", middleware: logMiddleware, order: 10 });
composer.add({ name: "auth", middleware: authMiddleware, order: 20 });
const stack = composer.forScope("api"); // filtered + ordered
```

### Route Middleware

`routeMiddleware(pattern, middleware)` runs middleware only when the path matches:

```typescript
const adminOnly = routeMiddleware("/admin/**", requireAdminMiddleware);
```

---

## NorthCoastFlow - Rendering Layer

Controls which rendering strategy (CSR/SSR/SSG/ISR/hybrid) is used per route.

```typescript
import { defineConfig } from "rakta/config";

export default defineConfig({
  render: {
    defaultMode: "ssr",
    routes: {
      "/": "ssg",
      "/dashboard": "csr",
      "/blog/**": "ssg",
    },
  },
});
```

### Rendering Modes

| Mode | Description |
|------|-------------|
| `csr` | Browser-only rendering |
| `ssr` | Server renders per request |
| `ssg` | Build-time static generation |
| `csg` | Configurable static with optional hydration |
| `spa` | Full SPA, all routing in browser |
| `hybrid` | Mix per route |

### ISR - Incremental Static Regeneration

```typescript
import { isr } from "rakta/data";

const { data, isStale } = await isr("blog-posts", fetchPosts, {
  revalidateAfterMs: 60_000, // 1 minute
  tags: ["blog"],
});
```

---

## MegaWeave - File-Based Router

Scans the `app/` directory and generates a route manifest at build time.

```
app/
├─ page.tsx           →  /
├─ about/
│  └─ page.tsx        →  /about
├─ blog/
│  ├─ page.tsx        →  /blog
│  └─ [slug]/
│     └─ page.tsx     →  /blog/:slug
└─ api/
   └─ users/
      └─ route.ts     →  GET /api/users
```

Special files:
- `layout.tsx` - wraps all pages in a directory
- `loading.tsx` - shown while the page loads
- `error.tsx` - shown when an error occurs
- `not-found.tsx` - shown for 404s

### Layout Resolver

`resolveLayoutChain(manifest, pathname)` returns the full layout chain for a path - from root outward to the nearest specific layout, including error/loading/not-found layouts and parallel slots.

---

## NagaLimanWire - Type-Safe RPC

End-to-end type safety across the network boundary. Define procedures on the server, call them from the client as if they were local functions.

```typescript
// Server
const appRouter = createRaktaRouter({
  getUser: publicProcedure
    .input(object({ id: string() }))
    .query(async ({ input }) => db.users.findById(input.id)),
});

// Client
const api = createRaktaClient<typeof appRouter>({ baseUrl: "/rpc" });
const user = await api.getUser.query({ id: "123" }); // fully typed
```

---

## CherbonsEngine - Build Engine

Powered by Bun + esbuild. Handles development server, production builds, and the module subpath system.

### Subpath Exports

Every module in Rakta.js is independently importable:

```typescript
import { cache } from "rakta/data";         // only data module
import { buildCsp } from "rakta/security";  // only security module
import { createRaktaRouter } from "rakta/rpc"; // only RPC module
```

This enables full tree-shaking - your bundle only includes what you import.

### Build Pipeline

1. `bun run build` - bundles all subpath modules + root index
2. `tsc --emitDeclarationOnly` - generates `.d.ts` type declarations
3. Output to `dist/` with source maps

---

## TrusmiThread - Auto Import

Scans configured directories and generates TypeScript declarations so you can use components without `import` statements.

```typescript
// rakta.config.ts
export default defineConfig({
  autoImport: {
    enabled: true,
    directories: ["app", "components", "lib"],
    outputDirectory: ".rakta",
    dts: true,
  },
});
```

---

## Security Layer

All security features are tree-shakeable and optional.

| Feature | Import |
|---------|--------|
| CSP builder | `buildCsp`, `defaultCsp`, `generateCspNonce` from `rakta/security` |
| CSRF tokens | `createCsrfToken`, `verifyCsrfToken` |
| Rate limiter | `RateLimiter` class |
| Secure headers | `createSecureHeaders` |
| Cookie encryption | `encryptCookieValue`, `decryptCookieValue` |
| Secret manager | `SecretManager` class |

---

## Operations Layer

Cookies, headers, server actions, background jobs, event bus, cron - all in `rakta/ops`.

```typescript
import { parseCookies, defineServerAction, RaktaEventBus } from "rakta/ops";

// Parse cookies from a Request
const cookies = parseCookies(request);

// Define a server action
const createPost = defineServerAction(async (input: { title: string }) => {
  return await db.posts.create(input);
});

// Event bus
const bus = new RaktaEventBus();
bus.on("user.created", ({ payload }) => sendWelcomeEmail(payload.email));
bus.emit({ name: "user.created", payload: { email: "user@example.com" } });
```

---

## API Module

REST helpers, GraphQL adapter, and OpenAPI 3.1 generation in `rakta/api`.

```typescript
import { jsonSuccess, NotFoundResponse, generateOpenApiSpec } from "rakta/api";

// REST helper
export async function GET(request: Request): Promise<Response> {
  const user = await db.users.findById("123");
  if (!user) return NotFoundResponse();
  return jsonSuccess(user);
}

// OpenAPI spec
const spec = generateOpenApiSpec(routes, {
  title: "My API",
  version: "1.0.0",
});
```

---

*Rakta.js - Cirebon soul, production ready.*
