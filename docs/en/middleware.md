# Middleware

## Overview

Rakta middleware is an async request pipeline for global, route, nested,
layout, API, and edge scopes. It is exported from `rakta/middleware`.

Middleware can run before a request reaches a handler, after the handler
returns a response, or stop the request with a redirect, rewrite, or abort
response.

## Quick start

```ts
import { before, createMiddlewareStack, redirect } from "rakta/middleware";

const stack = createMiddlewareStack([
  before((context) => {
    const isPrivateRoute = context.pathname.startsWith("/dashboard");
    const hasSession = context.request.headers.get("cookie")?.includes("rakta_session=");

    if (isPrivateRoute && !hasSession) {
      return redirect("/login");
    }
  }),
]);

const response = await stack.handle(request, () => new Response("OK"));
```

## API reference

| API | Description |
| --- | --- |
| `createMiddlewareStack(middlewares)` | Creates an ordered async pipeline |
| `defineMiddleware(fn)` | Gives a middleware function a stable typed shape |
| `before(fn)` | Runs logic before the next handler |
| `after(fn)` | Runs logic after the downstream response |
| `redirect(url, status)` | Returns a redirect response |
| `rewrite(pathname)` | Returns a rewrite instruction with `x-rakta-rewrite` |
| `abort(status, body)` | Stops the request with a response |

## Ordering

Middleware runs in array order. `after()` middleware receives the response
after downstream handlers finish.

```ts
const stack = createMiddlewareStack([
  before(() => console.log("before")),
  after((_context, response) => {
    const headers = new Headers(response.headers);
    headers.set("x-rakta", "1");
    return new Response(response.body, { status: response.status, headers });
  }),
]);
```

## Best practices

- Keep middleware small and focused.
- Register authentication before analytics or logging that depends on user state.
- Use `context.state` for request-local data.
- Return `redirect()`, `rewrite()`, or `abort()` instead of throwing for normal control flow.

## Related docs

- [`kernel.md`](./kernel.md)
- [`templates.md`](./templates.md)
- [`routing.md`](./routing.md)
