# Middleware Subsystem

Middleware Rakta.js adalah pipeline request async untuk scope global, route, nested, layout, API, dan edge. Middleware diekspor dari `rakta/middleware`.

---

## Alur Eksekusi Middleware Pipeline

```mermaid
flowchart TD
    Mulai((Mulai))
    Mulai --> Req[HTTP / Edge Request Diterima]
    Req --> Build[Bangun Middleware Stack\ncreateMiddlewareStack]
    Build --> GlobalBefore[Jalankan Global before Hook]
    GlobalBefore --> RouteBefore[Jalankan Route before Hook]
    RouteBefore --> Signal{Sinyal Kontrol?}

    Signal -->|redirect| Redir[Kembalikan 302 / 307\nRedirect Response]
    Signal -->|abort| AbortRes[Kembalikan 401 / 403\nAbort Response]
    Signal -->|rewrite| RewritePath[Terapkan x-rakta-rewrite\nPath Header]
    Signal -->|next| Handler[Jalankan Route Handler]

    Redir --> Selesai((Selesai))
    AbortRes --> Selesai

    RewritePath --> Handler
    Handler --> RouteAfter[Jalankan Route after Hook]
    RouteAfter --> GlobalAfter[Jalankan Global after Hook]
    GlobalAfter --> Final[Kembalikan Final HTTP Response]
    Final --> Selesai

    classDef startEnd fill:#e63946,stroke:#c1121f,color:#ffffff,font-weight:bold
    class Mulai,Selesai startEnd
```

---

## Mulai Cepat

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

## Referensi API

| API | Deskripsi |
| --- | --- |
| `createMiddlewareStack(middlewares)` | Membuat pipeline async yang berurutan |
| `defineMiddleware(fn)` | Memberikan bentuk type-safe untuk fungsi middleware |
| `before(fn)` | Menjalankan logic sebelum handler berikutnya |
| `after(fn)` | Menjalankan logic setelah response downstream selesai |
| `redirect(url, status)` | Mengembalikan redirect response |
| `rewrite(pathname)` | Mengembalikan instruksi rewrite dengan `x-rakta-rewrite` |
| `abort(status, body)` | Menghentikan request dengan response |

---

## Dokumen Terkait

- [`kernel.md`](./kernel.md)
- [`templates.md`](./templates.md)
- [`routing.md`](./routing.md)
