# Arsitektur Rakta.js

Dokumen ini menjelaskan bagaimana framework disusun secara internal. Jika kamu ingin berkontribusi, membangun plugin, atau memahami bagaimana request mengalir melalui sistem, ini adalah titik awal yang tepat.

---

## Gambaran Umum

Rakta.js adalah framework modular yang diorganisir di sekitar kernel terpusat. Setiap modul memiliki satu tanggung jawab dan bisa di-import secara independen. Sistem build men-tree-shake semua yang tidak kamu import.

```
Request
  │
  ▼
RaktaMiddleware     ← hook before(), edge middleware
  │
  ▼
NorthCoastFlow      ← resolusi mode render (CSR/SSR/SSG/ISR/hybrid)
  │
  ▼
MegaWeave Router    ← cocokkan route ke handler
  │
  ▼
Route Handler       ← komponen halaman atau endpoint API
  │
  ▼
NagaLimanWire (RPC) ← panggilan prosedur type-safe opsional
  │
  ▼
RaktaMiddleware     ← hook after()
  │
  ▼
Response
```

---

## RaktaKernel - Kontainer Dependency Injection

Kernel adalah fondasi. Mengelola services, environment, plugin, dan lifecycle startup/shutdown.

```typescript
import { createRaktaKernel } from "rakta/kernel";

const kernel = createRaktaKernel({
  environmentName: "production",
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
  },
});

// Daftarkan service sebagai singleton
kernel.services.singleton("db", () => connectDatabase(
  kernel.environment.require("DATABASE_URL")
));

// Daftarkan plugin
kernel.use({
  name: "my-plugin",
  async configure(context) {
    context.registerFeature({ name: "my-feature", enabled: true });
  },
  async ready() {
    console.log("Plugin siap.");
  },
});

await kernel.start(); // menjalankan semua fase lifecycle
```

### Lifecycle Plugin

| Fase | Kapan | Tujuan |
|------|-------|--------|
| `configure` | Kernel start | Daftarkan fitur, service, middleware |
| `start` | Setelah semua plugin dikonfigurasi | Koneksi ke database, mulai background task |
| `ready` | App sudah sepenuhnya siap | Log readiness, jalankan health check |
| `shutdown` | App akan ditutup | Bersihkan koneksi, flush queue |

### Pipeline Startup

Fungsi `createStartupPipeline()` menyediakan lifecycle berbasis fase yang terurut:

```
preload → configure → start → ready
```

Setiap fase berjalan berurutan. Task dalam satu fase berjalan berdasarkan urutan prioritas. Shutdown menjalankan fase secara terbalik (LIFO).

### Module Loader

`createModuleLoader()` me-lazy-load plugin dari dynamic importer dengan isolasi error:

```typescript
const loader = createModuleLoader();
const modules = await loader.loadMany([
  () => import("./plugins/analytics"),
  () => import("./plugins/auth"),
]);
```

---

## RaktaMiddleware - Pipeline Request

Middleware berjalan sebelum dan sesudah route handler. Semua middleware async-first.

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

### Scope Middleware

| Scope | Kapan Berjalan |
|-------|---------------|
| `global` | Setiap request |
| `route` | Pola route tertentu |
| `api` | Endpoint API saja |
| `layout` | Batas layout |
| `edge` | Runtime edge saja |

### Ordering Middleware

Gunakan `createMiddlewareComposer()` untuk middleware bernama dengan ordering berbasis prioritas:

```typescript
const composer = createMiddlewareComposer();
composer.add({ name: "logger", middleware: logMiddleware, order: 10 });
composer.add({ name: "auth", middleware: authMiddleware, order: 20 });
const stack = composer.forScope("api");
```

---

## NorthCoastFlow - Layer Rendering

Mengontrol strategi rendering (CSR/SSR/SSG/ISR/hybrid) yang digunakan per route.

| Mode | Deskripsi |
|------|-----------|
| `csr` | Rendering hanya di browser |
| `ssr` | Server merender per request |
| `ssg` | Generasi statis saat build time |
| `csg` | Statis yang bisa dikonfigurasi dengan hidrasi opsional |
| `spa` | SPA penuh, semua routing di browser |
| `hybrid` | Campur per route |

### ISR - Incremental Static Regeneration

```typescript
import { isr } from "rakta/data";

const { data, isStale } = await isr("blog-posts", fetchPosts, {
  revalidateAfterMs: 60_000, // 1 menit
  tags: ["blog"],
});
```

---

## MegaWeave - Router Berbasis File

Memindai direktori `app/` dan menghasilkan route manifest saat build time.

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

File khusus:
- `layout.tsx` - membungkus semua halaman dalam direktori
- `loading.tsx` - ditampilkan saat halaman loading
- `error.tsx` - ditampilkan saat error terjadi
- `not-found.tsx` - ditampilkan untuk 404

---

## NagaLimanWire - RPC Type-Safe

Type safety end-to-end melewati batas jaringan.

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

Ditenagai Bun + esbuild. Mengelola dev server, production build, dan sistem subpath modul.

### Subpath Exports

Setiap modul di Rakta.js bisa di-import secara independen:

```typescript
import { cache } from "rakta/data";            // hanya modul data
import { buildCsp } from "rakta/security";     // hanya modul security
import { createRaktaRouter } from "rakta/rpc"; // hanya modul RPC
```

---

## TrusmiThread - Auto Import

Memindai direktori yang dikonfigurasi dan menghasilkan deklarasi TypeScript agar kamu bisa menggunakan komponen tanpa pernyataan `import`.

```typescript
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

## Layer Security

Semua fitur security bisa di-tree-shake dan opsional.

| Fitur | Import |
|-------|--------|
| CSP builder | `buildCsp`, `defaultCsp`, `generateCspNonce` dari `rakta/security` |
| Token CSRF | `createCsrfToken`, `verifyCsrfToken` |
| Rate limiter | class `RateLimiter` |
| Secure headers | `createSecureHeaders` |
| Enkripsi cookie | `encryptCookieValue`, `decryptCookieValue` |
| Secret manager | class `SecretManager` |

---

## Layer Operasi

Cookie, header, server action, background job, event bus, cron - semua di `rakta/ops`.

```typescript
import { parseCookies, defineServerAction, RaktaEventBus } from "rakta/ops";

const cookies = parseCookies(request);

const createPost = defineServerAction(async (input: { title: string }) => {
  return await db.posts.create(input);
});

const bus = new RaktaEventBus();
bus.on("user.created", ({ payload }) => sendWelcomeEmail(payload.email));
bus.emit({ name: "user.created", payload: { email: "user@example.com" } });
```

---

## Modul API

Helper REST, adapter GraphQL, dan generasi OpenAPI 3.1 di `rakta/api`.

```typescript
import { jsonSuccess, NotFoundResponse, generateOpenApiSpec } from "rakta/api";

export async function GET(request: Request): Promise<Response> {
  const user = await db.users.findById("123");
  if (!user) return NotFoundResponse();
  return jsonSuccess(user);
}
```

---

*Rakta.js - jiwa Cirebon, siap produksi.*

*Dibuat oleh Rhein Sullivan (Muhammad Rizky Ramadhan) dari Cirebon & Jakarta Selatan, Indonesia - Vyagra Nexus™ 🇮🇩 · 🇵🇸 Free Palestine.*
