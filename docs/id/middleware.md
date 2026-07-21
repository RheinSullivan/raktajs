# Middleware

## Gambaran umum

Middleware Rakta adalah pipeline request async untuk scope global, route,
nested, layout, API, dan edge. Middleware diekspor dari `rakta/middleware`.

Middleware bisa berjalan sebelum request sampai ke handler, setelah handler
mengembalikan response, atau menghentikan request dengan redirect, rewrite,
atau abort response.

## Mulai cepat

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

## Urutan

Middleware berjalan sesuai urutan array. Middleware `after()` menerima
response setelah handler berikutnya selesai.

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

## Praktik terbaik

- Buat middleware kecil dan fokus.
- Daftarkan authentication sebelum analytics atau logging yang membutuhkan state user.
- Gunakan `context.state` untuk data lokal per request.
- Kembalikan `redirect()`, `rewrite()`, atau `abort()` untuk control flow normal.

## Dokumen terkait

- [`kernel.md`](./kernel.md)
- [`templates.md`](./templates.md)
- [`routing.md`](./routing.md)
