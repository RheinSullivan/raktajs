# Middleware Subsystem

Rakta.js middleware is an async request pipeline for global, route, nested, layout, API, and edge scopes. Middleware is exported from `rakta/middleware`.

---

## Middleware Pipeline Execution Flow

```mermaid
flowchart TD
    Start((Start))
    Start --> Req[HTTP / Edge Request Received]
    Req --> Build[Build Middleware Stack\ncreateMiddlewareStack]
    Build --> GlobalBefore[Execute Global before Hook]
    GlobalBefore --> RouteBefore[Execute Route before Hook]
    RouteBefore --> Signal{Control Signal?}

    Signal -->|redirect| Redir[Return 302 / 307\nRedirect Response]
    Signal -->|abort| AbortRes[Return 401 / 403\nAbort Response]
    Signal -->|rewrite| RewritePath[Apply x-rakta-rewrite\nPath Header]
    Signal -->|next| Handler[Execute Route Handler]

    Redir --> End((End))
    AbortRes --> End

    RewritePath --> Handler
    Handler --> RouteAfter[Execute Route after Hook]
    RouteAfter --> GlobalAfter[Execute Global after Hook]
    GlobalAfter --> Final[Return Final HTTP Response]
    Final --> End

    classDef startEnd fill:#e63946,stroke:#c1121f,color:#ffffff,font-weight:bold
    class Start,End startEnd
```

---

## Quick Start

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

---

## API Reference

| API | Description |
| --- | --- |
| `createMiddlewareStack(middlewares)` | Creates a sequential async pipeline |
| `defineMiddleware(fn)` | Type-safe wrapper function for middleware |
| `before(fn)` | Executes logic prior to the downstream handler |
| `after(fn)` | Executes logic after downstream response generation |
| `redirect(url, status)` | Returns a redirect response |
| `rewrite(pathname)` | Returns a rewrite directive using `x-rakta-rewrite` |
| `abort(status, body)` | Terminates request with an immediate error response |

---

## Related Documentation

- [`kernel.md`](./kernel.md)
- [`templates.md`](./templates.md)
- [`routing.md`](./routing.md)
