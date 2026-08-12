# Rakta.js Architecture

This document explains how the framework is structured internally. If you want to contribute, build plugins, or understand how requests flow through the system, this is the right starting point.

---

## Request Pipeline Overview

Rakta.js is a modular framework organized around a central kernel. Each module has a single responsibility and can be imported independently. The build system tree-shakes everything you don't import.

```mermaid
flowchart TD
    Start((Start))
    Start --> Req[Incoming HTTP Request]
    Req --> MWBefore[RaktaMiddleware
before Hooks / Edge]
    MWBefore --> ModeCheck{NorthCoastFlow
Render Mode?}

    ModeCheck -->|SSR| SSR[Server-Side Render
Fresh HTML per Request]
    ModeCheck -->|SSG| SSG[Static HTML
Serve from Build Cache]
    ModeCheck -->|CSR| CSR[Send Minimal Shell
Browser Renders]
    ModeCheck -->|Edge| Edge[Edge Runtime
Workers / CDN Node]

    SSR --> Router[MendungWeave Router
Manifest Matcher]
    SSG --> Router
    CSR --> Router
    Edge --> Router

    Router --> Handler[Route Handler
Page Component / API Endpoint]
    Handler --> RPC[CarubanWire RPC Call
Optional]
    RPC --> Handler
    Handler --> MWAfter[RaktaMiddleware
after Hooks]
    MWAfter --> Resp[HTTP Response Sent]
    Resp --> End((End))

    classDef startEnd fill:#e63946,stroke:#c1121f,color:#ffffff,font-weight:bold
    class Start,End startEnd
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

await kernel.start(); // run all lifecycle phases
```

### Plugin Lifecycle & Startup Pipeline

```mermaid
flowchart TD
    Boot((Kernel Start))
    Boot --> P1[Phase 1: Preload
Load environment & config]
    P1 --> P2[Phase 2: Configure
Register features, services, middleware]
    P2 --> P3[Phase 3: Start
Connect database, background tasks]
    P3 --> P4[Phase 4: Ready
Log readiness, run health checks]
    P4 --> Running[Application Running]

    Running --> ShutSignal{Shutdown
Signal Received?}
    ShutSignal -->|No| Running
    ShutSignal -->|Yes| S1[Shutdown Phase 4
Flush pending jobs]
    S1 --> S2[Shutdown Phase 3
Stop services]
    S2 --> S3[Shutdown Phase 2
Unbind plugins]
    S3 --> S4[Shutdown Phase 1
Cleanup & exit]
    S4 --> Done((End))

    classDef startEnd fill:#e63946,stroke:#c1121f,color:#ffffff,font-weight:bold
    class Boot,Done startEnd
```

| Phase | When | Purpose |
|-------|------|---------|
| `configure` | Kernel start | Register features, services, middleware |
| `start` | After all plugins configured | Connect to database, start background tasks |
| `ready` | Application fully ready | Log readiness, run health checks |
| `shutdown` | Application shutting down | Cleanup connections, flush queues |

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
```

### Middleware Scopes

| Scope | Execution Point |
|-------|-----------------|
| `global` | Every request |
| `route` | Specific route pattern |
| `api` | API endpoints only |
| `layout` | Layout boundaries |
| `edge` | Edge runtime only |

---

## NagaLimanWire - Type-Safe RPC

End-to-end type safety across the network boundary.

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

Powered by Bun + esbuild. Manages the dev server, production build, and subpath module exports.

---

*Rakta.js - Built by Rhein Sullivan (Muhammad Rizky Ramadhan) from Cirebon & South Jakarta, Indonesia. Vyagra Nexus. Free Palestine.*
