# Data Fetching

## Overview

The `rakta/data` module provides a lightweight data cache, route data strategy contracts, and helpers for identifying ISR, streaming, and prefetch routes. These primitives are used by the Forge build engine, the Tide runtime, and custom renderers to decide how each route is fetched, cached, and re-rendered.

## When to use this

Use this module when you need:
- A request-scoped cache that deduplicates parallel calls to the same loader.
- Per-route rendering strategy annotations (server vs. client, prerender vs. dynamic, streaming, prefetch).
- ISR / revalidation logic that determines whether a cached page is stale.

## Cache API

`createDataCache()` returns a cache instance for one request lifecycle. Entries are stored by a string key and invalidated by tag.

```ts
import { createDataCache } from "raktajs/data";

const cache = createDataCache();

// Cache a loader result for 60 seconds, tagged as "cms"
const posts = await cache.cache("cms:posts", () => fetchPostsFromDB(), {
  ttl: 60_000,
  tags: ["cms"],
});

// Invalidate everything tagged "cms"
cache.revalidate("cms");

// Invalidate a single key
cache.revalidate("cms:posts");
```

### Cache options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `ttl` | `number` | `0` (never expires) | Time-to-live in milliseconds |
| `tags` | `string[]` | `[]` | Tags for grouped invalidation |

## Route data strategy

`defineRouteDataStrategy` annotates a route with its rendering and data contract. The Forge build engine reads these annotations to decide how to emit the route.

```ts
import { defineRouteDataStrategy, isIncrementalRoute, shouldStreamRoute, shouldPrefetchRoute } from "raktajs/data";

const dashboardStrategy = defineRouteDataStrategy({
  routePattern: "/dashboard",
  runtime: "server",     // "server" | "client" | "edge"
  prerender: false,       // true = SSG / ISR at build time
  stream: true,           // true = enable streaming response
  prefetch: true,         // true = prefetch on hover
  revalidate: 60,         // ISR revalidation interval in seconds (only when prerender: true)
});

const blogStrategy = defineRouteDataStrategy({
  routePattern: "/blog/:slug",
  runtime: "server",
  prerender: true,        // pre-render at build time
  stream: false,
  prefetch: true,
  revalidate: 3600,       // re-generate every hour
});

// Check helpers
isIncrementalRoute(dashboardStrategy); // false - prerender is false
isIncrementalRoute(blogStrategy);      // true  - prerender + revalidate
shouldStreamRoute(dashboardStrategy);  // true
shouldPrefetchRoute(dashboardStrategy); // true
```

### Strategy options

| Option | Type | Description |
| --- | --- | --- |
| `routePattern` | `string` | The URL pattern this strategy applies to |
| `runtime` | `"server" \| "client" \| "edge"` | Where the route runs |
| `prerender` | `boolean` | Generate a static file at build time |
| `stream` | `boolean` | Stream the response as it renders |
| `prefetch` | `boolean` | Pre-load this route on hover or mount |
| `revalidate` | `number` | Seconds before ISR re-generates (requires `prerender: true`) |

## Rendering strategy per route

Strategy helpers let you inspect a route's contract programmatically:

```ts
import {
  isIncrementalRoute,
  shouldStreamRoute,
  shouldPrefetchRoute,
} from "raktajs/data";

const myRoute = defineRouteDataStrategy({
  routePattern: "/product/:id",
  runtime: "server",
  prerender: true,
  revalidate: 300,
  stream: false,
  prefetch: true,
});

console.log(isIncrementalRoute(myRoute));   // true  - prerender + revalidate > 0
console.log(shouldStreamRoute(myRoute));    // false
console.log(shouldPrefetchRoute(myRoute));  // true
```

## Runtime registry

The cache pairs with the Tide runtime adapter for per-request isolation:

```ts
import { createDataCache } from "raktajs/data";
import { createRuntimeContext } from "raktajs/tide";

// In a Bun fetch handler
const ctx = createRuntimeContext(request);
const cache = createDataCache(); // isolated per request

const user = await cache.cache(`user:${ctx.params.id}`, () => getUser(ctx.params.id), {
  ttl: 5_000,
});
```

## Common mistakes

- Sharing a cache instance across requests in a server handler - each request must create its own `createDataCache()` instance.
- Setting `revalidate` without setting `prerender: true` - ISR only applies to pre-rendered routes.
- Using `stream: true` on a route with a slow database query without a `<Suspense>` boundary - the stream will still block until the query resolves.

## Related docs

- [`routing.md`](./routing.md) - file-based routing and route kinds
- [`layout.md`](./layout.md) - layout system with loading states
- [`rpc.md`](./rpc.md) - type-safe API calls instead of raw fetch
