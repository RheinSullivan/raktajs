# RPC - CarubanWire

## Overview

**CarubanWire** is Rakta.js's type-safe RPC layer, inspired by tRPC but
implemented natively for Rakta.js without depending on it. You define
procedures once on the server; the client gets full type inference with
no code generation step.

## When to use this

Use CarubanWire when you want typed function calls between frontend and
backend instead of hand-writing `fetch` calls and manually typing the
response. For untyped or third-party REST APIs, use
[PanturaFetch](./http.md) instead.

## Architecture

- A **router** is a plain object whose values are procedures created with
  `publicProcedure`.
- A **procedure** is built fluently: `.input(schema)` attaches an optional
  Rakta Schema validator, then `.query(handler)` or `.mutation(handler)`
  finalizes it.
- The **client**, created with `createRaktaClient<AppRouter>()`, is a
  `Proxy` - calling `client.someProcedure.query(input)` sends a typed
  request and returns a typed response, fully inferred from the server's
  router type.
- Errors surface as `RaktaRpcError`, carrying a `code` and optional
  `details` for validation failures.

## Code example

Server:
```ts
// backend/src/rpc/router.ts
import { publicProcedure } from "rakta/rpc";
import { object, string } from "rakta/schema";

export const appRouter = {
  greet: publicProcedure
    .input(object({ name: string().min(1) }))
    .query(async ({ input }) => ({ message: `Hello, ${input.name}!` })),
};

export type AppRouter = typeof appRouter;
```

Client:
```ts
// frontend/lib/rpc.ts
import { createRaktaClient } from "rakta/rpc";
import type { AppRouter } from "../../backend/src/rpc/router";

export const rpc = createRaktaClient<AppRouter>({
  baseUrl: "http://localhost:4000/rpc",
});

const result = await rpc.greet.query({ name: "Rakta" });
// result.message: string - fully typed, no manual annotation
```

## Common mistakes

- Forgetting `await` on `.query()` / `.mutate()` - both return a `Promise`.
- Sharing the router type by re-exporting the whole backend module into
  the frontend bundle - instead, export only the `type AppRouter`, which
  is erased at build time and adds no runtime weight to the client.
- Catching errors with a generic `catch` block and ignoring `error.code` -
  `RaktaRpcError.code` lets you distinguish validation failures from other
  server errors.

## Related docs

- [`schema.md`](./schema.md) *(see package docs for `rakta/schema`)* - input validation used by `.input()`
- [`http.md`](./http.md) - PanturaFetch, for non-RPC HTTP calls
- [`backendFrameworks.md`](./backendFrameworks.md) - wiring CarubanWire into Gaman.js, Express.js, Nest.js, or Adonis.js