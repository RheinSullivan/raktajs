<p align="center">
  <img src="https://raw.githubusercontent.com/RheinSullivan/raktajs/main/docs/assets/raktajs_benner.png" alt="Rakta.js banner" width="100%" />
</p>

<h1 align="center">Rakta.js</h1>

<p align="center">
  <strong>A lightweight, composable fullstack framework built on Bun, React, and TypeScript.</strong><br />
  <strong>Framework fullstack ringan yang dibangun di atas Bun, React, dan TypeScript.</strong>
</p>

<p align="center">
  <em>Small in size. Fierce in speed. Alive in every route.</em><br />
  <em>Kecil ukuran. Ganas kecepatan. Hidup di setiap route.</em>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/raktajs"><img src="https://img.shields.io/npm/v/raktajs?style=flat&color=C60005&labelColor=555&label=raktajs" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/raktajs"><img src="https://img.shields.io/npm/dm/raktajs?style=flat&color=009688&labelColor=555&label=downloads/month" alt="monthly downloads" /></a>
  <a href="https://bun.sh"><img src="https://img.shields.io/badge/Bun-1.3.11-db2777?style=flat&logo=bun&logoColor=white&labelColor=555" alt="Bun" /></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=white&labelColor=555" alt="React 19" /></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-6-3178C6?style=flat&logo=typescript&logoColor=white&labelColor=555" alt="TypeScript" /></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-7CB342?style=flat&labelColor=555" alt="MIT License" /></a>
</p>

---

## Salam Pembuka / Opening Greetings

**Assalamu'alaikum Warahmatullahi Wabarakatuh** — Salam bagi umat Islam.  
**Shalom** — Salam bagi umat Protestan & Katolik.  
**Om Swastiastu** — Salam bagi umat Hindu.  
**Namo Buddhaya** — Salam bagi umat Buddha.  
**Salam Kebajikan / Wei De Dong Tian** — Salam bagi umat Konghucu.

---

## Table of Contents / Daftar Isi

- [What is Rakta.js?](#what-is-raktajs)
- [Quick Start](#quick-start--mulai-cepat)
- [Features](#features--fitur)
- [Cultural Identity](#cultural-identity--identitas-budaya)
- [CLI](#cli)
- [Configuration](#configuration--konfigurasi)
- [Routing](#routing--routing)
- [Components](#components--komponen)
- [Hooks](#hooks--hooks)
- [Rendering Modes](#rendering-modes--mode-render)
- [Package Exports](#package-exports)
- [Support & Donation](#support--donasi-kemanusiaan-)

---

## What is Rakta.js?

**English**

Rakta.js is a modern React framework powered by Bun. It provides file-based routing, multiple rendering modes (CSR, SSR, SSG, CSG, SPA, Hybrid), a type-safe RPC layer, schema validation, a built-in HTTP client, PWA support, a middleware system, a framework kernel with dependency injection, and a rich set of Cirebon-culture-named components and hooks — all in a single package.

**Bahasa Indonesia**

Rakta.js adalah framework React modern yang ditenagai oleh Bun. Framework ini menyediakan routing berbasis file, berbagai mode render (CSR, SSR, SSG, CSG, SPA, Hybrid), layer RPC type-safe, validasi schema, HTTP client bawaan, dukungan PWA, sistem middleware, kernel framework dengan dependency injection, dan kumpulan komponen serta hooks yang dinamai dari budaya Cirebon — semuanya dalam satu paket.

---

## Quick Start / Mulai Cepat

```bash
bun create rakta-app@latest my-app
cd my-app
bun install
bun run dev
```

```bash
# Other package managers / Package manager lain
npm create rakta-app@latest my-app
pnpm create rakta-app@latest my-app
```

---

## Features / Fitur

### Core Framework / Inti Framework

| Feature / Fitur | Description (EN) | Deskripsi (ID) |
|---|---|---|
| **MegaWeave Router** | File-based routing from `app/` with nested layouts, route groups, and parallel routes | Routing berbasis file dari `app/` dengan nested layout, route group, dan parallel route |
| **CherbonsEngine** | Bun + Vite + esbuild dev/build engine with HMR, fast refresh, and source maps | Engine dev/build Bun + Vite + esbuild dengan HMR, fast refresh, dan source map |
| **NorthCoastFlow** | Runtime rendering flow: CSR, SSR, SSG, CSG, SPA, Hybrid, Edge | Alur render runtime: CSR, SSR, SSG, CSG, SPA, Hybrid, Edge |
| **RaktaKernel** | Framework kernel with DI container, plugin registry, lifecycle hooks, and environment manager | Kernel framework dengan DI container, plugin registry, lifecycle hook, dan environment manager |
| **RaktaMiddleware** | Global, route, layout, API, and edge middleware with `before()`, `after()`, `redirect()`, `rewrite()`, `abort()` | Middleware global, route, layout, API, dan edge dengan `before()`, `after()`, `redirect()`, `rewrite()`, `abort()` |

### Components / Komponen

| Component / Komponen | Tag Syntax | Description (EN) | Deskripsi (ID) |
|---|---|---|---|
| **ShrimpStep** | `<click to="/path">` | SPA navigation without full page reload | Navigasi SPA tanpa reload halaman |
| **TrusmiFrame** | `<picture path="">` | Optimized image with lazy loading | Gambar teroptimasi dengan lazy loading |
| **PanturaScroll** | `<pantura to="">` | Smooth scroll trigger powered by GSAP | Trigger smooth scroll bertenaga GSAP |
| **PanturaReborns** | `<reborns id="">` | Scroll target section marker | Penanda target section scroll |
| **RaktaAlert** | `<Alert>` | Accessible alert component (info/success/warning/error) | Komponen alert aksesibel |
| **RaktaToast** | `<Toaster>` | Toast notification system | Sistem notifikasi toast |

### SEO & PWA

| Feature / Fitur | Description (EN) | Deskripsi (ID) |
|---|---|---|
| **SunyaragiCrown** | Full metadata manager: title, description, Open Graph, Twitter Card, JSON-LD, canonical, sitemap, robots.txt | Manajer metadata lengkap: sitemap, robots.txt, OG, Twitter Card, JSON-LD |
| **ShrimpHarbor** | PWA layer: service worker, web manifest, cache strategies, install prompt | Layer PWA: service worker, web manifest, strategi cache |

### Data & Backend / Data & Backend

| Feature / Fitur | Description (EN) | Deskripsi (ID) |
|---|---|---|
| **NagaLimanWire** | Type-safe RPC connecting frontend to backend with `publicProcedure` and `createRaktaRouter` | RPC type-safe menghubungkan frontend ke backend |
| **PanturaFetch** | Typed HTTP client with interceptors, timeout, and error types | HTTP client bertype dengan interceptor, timeout, dan tipe error |
| **KasepuhanGate** | File-based API routes from `app/api/` | Route API berbasis file dari `app/api/` |
| **KanomanShield** | Route protection and auth guard | Proteksi route dan auth guard |
| **MegaSignal** | Full SEO layer with sitemap, robots.txt, RSS, JSON-LD | Layer SEO lengkap dengan sitemap, robots.txt, RSS, JSON-LD |

### Developer Experience / Pengalaman Developer

| Feature / Fitur | Description (EN) | Deskripsi (ID) |
|---|---|---|
| **TrusmiThread** | Auto-import scanner — generates typed global declarations for all components and utilities | Scanner auto-import — menghasilkan deklarasi global bertype |
| **JatiLens** | Bundle analyzer, route analyzer, dependency graph, profiler | Analyzer bundle, route, dependency graph, profiler |
| **Schema Validation** | Built-in type-safe schema: `string()`, `number()`, `boolean()`, `object()`, `array()` | Validasi schema bawaan yang type-safe |
| **MegaStore** | Lightweight reactive state store with `createRaktaStore` | State store reaktif ringan |
| **Security** | CSP, CSRF, rate limiter, secure headers, cookie encryption, secret manager | CSP, CSRF, rate limiter, secure headers |

---

## Cultural Identity / Identitas Budaya

**English**

Every core feature in Rakta.js carries a name from the rich cultural heritage of **Cirebon, West Java, Indonesia** and the wider Nusantara archipelago — honoring local landmarks, traditional arts, culinary traditions, and historical figures.

**Bahasa Indonesia**

Setiap fitur inti Rakta.js membawa nama dari kekayaan budaya **Cirebon, Jawa Barat, Indonesia** dan kepulauan Nusantara yang lebih luas — menghormati landmark lokal, seni tradisional, tradisi kuliner, dan tokoh sejarah.

| Name / Nama | Origin / Asal | Role / Peran |
|---|---|---|
| MegaWeave | Mega Mendung batik motif | File-based router |
| ShrimpStep | Udang, Cirebon seafood icon | SPA navigation component |
| TrusmiFrame | Batik Trusmi village | Image component |
| PanturaScroll | Jalur Pantai Utara highway | Smooth scroll trigger |
| KasepuhanGate | Keraton Kasepuhan palace | API route system |
| KanomanShield | Keraton Kanoman palace | Auth guard |
| SunyaragiCrown | Taman Sari Gua Sunyaragi | SEO & metadata |
| NagaLimanWire | Paksi Naga Liman creature | Type-safe RPC |
| TrusmiThread | Batik Trusmi weaving thread | Auto-import scanner |
| CherbonsEngine | Cherbons (Cirebon's old name) | Build & dev engine |
| NorthCoastFlow | Jalur Pantura / North Coast | Rendering flow manager |
| ShrimpHarbor | Pelabuhan udang Cirebon | PWA & service worker |
| MegaSignal | Mega Mendung signal | Full SEO layer |

---

## CLI

```bash
rakta dev              # Start development server / Mulai dev server
rakta build            # Production build / Build produksi
rakta start            # Start production server / Jalankan server produksi
rakta routes           # List all routes / Tampilkan semua route

rakta make page <name>     # Generate page file / Buat file halaman
rakta make layout <name>   # Generate layout file / Buat file layout
rakta make api <name>      # Generate API route / Buat route API

rakta imports:generate     # Regenerate auto-import declarations / Buat ulang auto-import
rakta rpc:types            # Generate RPC type stubs / Buat tipe RPC
rakta seo:generate         # Generate sitemap & robots.txt / Buat sitemap & robots
rakta doctor               # Diagnose project issues / Diagnosis masalah proyek
```

---

## Configuration / Konfigurasi

```ts
// rakta.config.ts
import { defineRaktaConfig } from "raktajs";

export default defineRaktaConfig({
  appName: "My App",

  seo: {
    defaultTitle: "My App | Rakta.js",
    defaultDescription: "Built with Rakta.js",
  },

  render: {
    defaultMode: "csr",
    routes: {
      "/": "csr",
      "/blog": "ssg",
      "/dashboard": "csr",
      "/api/*": "ssr",
    },
  },

  server: {
    port: 3000,
    hostname: "localhost",
  },

  cors: {
    origin: "*",
  },
});
```

---

## Routing / Routing

**English** — Routes are discovered automatically from the `app/` directory. Special files: `layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx`, `notFound.tsx`.

**Bahasa Indonesia** — Route ditemukan otomatis dari direktori `app/`. File khusus: `layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx`, `notFound.tsx`.

```txt
app/
├─ layout.tsx          ← Root layout
├─ page.tsx            ← Home page  /
├─ loading.tsx         ← Loading UI
├─ error.tsx           ← Error boundary
├─ notFound.tsx        ← 404 page
├─ about/
│  └─ page.tsx         ← /about
├─ blog/
│  ├─ layout.tsx       ← Nested layout
│  ├─ page.tsx         ← /blog
│  └─ [slug]/
│     └─ page.tsx      ← /blog/:slug
├─ (auth)/             ← Route group (no URL segment)
│  ├─ login/page.tsx   ← /login
│  └─ register/page.tsx
└─ api/
   └─ hello/
      └─ route.ts      ← GET/POST /api/hello
```

---

## Components / Komponen

### ShrimpStep — SPA Navigation / Navigasi SPA

```tsx
// EN: Use <click> instead of <a> for client-side routing
// ID: Gunakan <click> bukan <a> untuk routing client-side
<click to="/about">About Us</click>
<click to="/blog/hello-world">Read Post</click>
```

### TrusmiFrame — Optimized Image / Gambar Teroptimasi

```tsx
// EN: Use <picture> instead of <img> for built-in lazy loading
// ID: Gunakan <picture> bukan <img> untuk lazy loading bawaan
<picture path="/hero.jpg" alt="Hero image" />
<picture path="/banner.png" alt="Banner" width={800} height={400} />
```

### PanturaScroll — Smooth Scroll

```tsx
// EN: Trigger — scroll to a section
// ID: Trigger — scroll ke section
<pantura to="features" offset={80} duration={600}>
  See Features
</pantura>

// EN: Target — mark the destination section
// ID: Target — tandai section tujuan
<reborns id="features">
  <h2>Features</h2>
</reborns>
```

### usePantura — Programmatic Scroll Hook

```ts
import { usePantura } from "raktajs/components";

function Navbar() {
  const scrollTo = usePantura({ offset: 80 });
  return (
    <button onClick={() => scrollTo("features")}>
      Jump to Features
    </button>
  );
}
```

### RaktaAlert & RaktaToast

```tsx
import { Alert, toast, Toaster } from "raktajs/components";

// Alert
<Alert type="success" title="Saved!">Your changes have been saved.</Alert>
<Alert type="error">Something went wrong.</Alert>

// Toast (add Toaster to layout, then call toast anywhere)
<Toaster position="top-right" />
toast.success("File uploaded!");
toast.error("Upload failed.");
```

---

## Hooks / Hooks

**English** — All React hooks are available as Cirebon-named re-exports for cultural expressiveness. Standard names also work.

**Bahasa Indonesia** — Semua React hook tersedia sebagai re-export dengan nama Cirebon untuk ekspresi budaya. Nama standar juga bisa digunakan.

```ts
import {
  // State
  lengkoState,       // useState
  tarlingReducer,    // useReducer
  // Effect
  empalEffect,       // useEffect
  tajugLayoutEffect, // useLayoutEffect
  // Memo & Callback
  kanomanMemo,       // useMemo
  kasepuhanCallback, // useCallback
  // Ref
  megamendungRef,    // useRef
  // Context
  sunanContext,      // useContext
  // Scroll
  usePantura,        // smooth scroll hook
} from "raktajs/hooks";
```

---

## Rendering Modes / Mode Render

| Mode | Description (EN) | Deskripsi (ID) |
|---|---|---|
| `csr` | Client-Side Rendering — rendered in the browser | Render di browser |
| `ssr` | Server-Side Rendering — rendered per request | Render per request di server |
| `ssg` | Static Site Generation — pre-rendered at build time | Pre-render saat build |
| `csg` | Client-Side Generation — static shell + client hydration | Shell statis + hidrasi client |
| `spa` | Single Page Application — one shell, all navigation client-side | Satu shell, semua navigasi client-side |
| `hybrid` | Per-route mixed strategy | Strategi campuran per route |

---

## Schema Validation / Validasi Schema

```ts
import { string, number, boolean, object, array } from "raktajs/schema";

const UserSchema = object({
  name: string().min(2).max(50),
  age: number().min(0).max(120),
  email: string().email(),
  active: boolean(),
  tags: array(string()),
});

const result = UserSchema.parse(data);
if (result.ok) {
  console.log(result.value); // typed User
} else {
  console.log(result.errors); // ValidationError[]
}
```

---

## RPC — NagaLimanWire

```ts
// server: app/api/rpc/route.ts
import { createRaktaRouter, publicProcedure, createRpcHandler } from "raktajs/rpc";
import { object, string } from "raktajs/schema";

const router = createRaktaRouter({
  hello: publicProcedure
    .input(object({ name: string() }))
    .query(({ input }) => `Hello, ${input.name}!`),
});

export const GET = createRpcHandler(router);
export const POST = createRpcHandler(router);

// client
import { createRaktaClient } from "raktajs/rpc";
const client = createRaktaClient<typeof router>({ baseUrl: "/api/rpc" });
const msg = await client.hello.query({ name: "Cirebon" });
```

---

## HTTP Client / HTTP Client — PanturaFetch

```ts
import { createRaktaHttp } from "raktajs/http";

const http = createRaktaHttp({
  baseUrl: "https://api.example.com",
  timeout: 10_000,
});

const users = await http.get<User[]>("/users");
const created = await http.post<User>("/users", { name: "Rhein" });
```

---

## State Store / State Store — MegaStore

```ts
import { createRaktaStore } from "raktajs/store";

const useCounter = createRaktaStore({ count: 0 });

function Counter() {
  const { count } = useCounter();
  const set = useCounter.setState;
  return (
    <button onClick={() => set({ count: count + 1 })}>
      Count: {count}
    </button>
  );
}
```

---

## PWA — ShrimpHarbor

```ts
import { defineRaktaConfig } from "raktajs";

export default defineRaktaConfig({
  pwa: {
    name: "My App",
    shortName: "App",
    themeColor: "#C60005",
    backgroundColor: "#0a0a0a",
    display: "standalone",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
});
```

---

## Security / Keamanan

```ts
import {
  createSecureHeaders,
  createCsrfToken,
  verifyCsrfToken,
  RateLimiter,
  SecretManager,
  encryptCookieValue,
  decryptCookieValue,
} from "raktajs/security";

// Secure headers
const headers = createSecureHeaders({ contentSecurityPolicy: true });

// CSRF
const token = await createCsrfToken(secret);
const valid = await verifyCsrfToken(token, secret);

// Rate limiting
const limiter = new RateLimiter({ max: 100, windowMs: 60_000 });
```

---

## Package Exports

```txt
raktajs               ← Core re-exports
raktajs/components    ← Click, Picture, Pantura, Reborns, Alert, Toast
raktajs/hooks         ← All React hooks (Cirebon-named + standard)
raktajs/router        ← Route scanning, manifest, matching
raktajs/render        ← Rendering modes and renderer
raktajs/config        ← defineRaktaConfig, loadConfig
raktajs/seo           ← RaktaHead, mergeMetadata, sitemap, robots
raktajs/pwa           ← Manifest, service worker, cache strategies
raktajs/rpc           ← createRaktaRouter, publicProcedure, createRaktaClient
raktajs/schema        ← string, number, boolean, object, array
raktajs/http          ← createRaktaHttp, error types
raktajs/store         ← createRaktaStore
raktajs/auto-import   ← scanForExports, generateAutoImports
raktajs/forge         ← buildProject, startDevServer, inspectBuild
raktajs/tide          ← Runtime adapter (Bun/Node), request context
raktajs/kernel        ← createRaktaKernel, createServiceContainer
raktajs/middleware    ← defineMiddleware, createMiddlewareStack
raktajs/security      ← createSecureHeaders, CSRF, RateLimiter, SecretManager
raktajs/data          ← createDataCache, defineRouteDataStrategy
raktajs/layout        ← createLayoutManifest, matchLayouts
raktajs/deployment    ← createDeploymentAdapter, listDeploymentTargets
raktajs/testing       ← runRaktaTests, createMockServer, createSnapshot
raktajs/performance   ← benchmark, createBundleSizeReport
raktajs/plugin        ← createPluginRegistry, createOfficialPlugins
raktajs/dx            ← analyzeBundle, analyzeRoutes, createDependencyGraph
raktajs/docs          ← scanMarkdownDocs, createVitePressConfig
raktajs/ops           ← RaktaQueue, RaktaEventBus, createRequestContext, runCronTask
```

---

## Public Assets / Aset Publik

**English** — Place static files in `public/`. Rakta.js automatically serves them and emits favicon links.

**Bahasa Indonesia** — Letakkan file statis di `public/`. Rakta.js otomatis menyajikan dan mengemit link favicon.

```txt
public/
├─ favicon.ico
├─ favicon-32x32.png
├─ favicon-16x16.png
├─ apple-touch-icon.png
├─ android-chrome-192x192.png
├─ android-chrome-512x512.png
└─ site.webmanifest
```

---

## Deployment / Deployment

**English** — Rakta.js generates deployment adapters for major platforms.

**Bahasa Indonesia** — Rakta.js menghasilkan adapter deployment untuk platform utama.

```ts
import { listDeploymentTargets, createDeploymentAdapter } from "raktajs/deployment";

// Available targets / Target yang tersedia:
// node, bun, deno, cloudflare-workers, cloudflare-pages,
// netlify, vercel, docker, aws-lambda, flyio, railway,
// render, firebase, github-pages, static
```

---

## Support & Donasi Kemanusiaan 🇵🇸

**English**

Your support keeps the servers running, funds the domain, and is distributed to **the underprivileged, orphans, elderly homes, and humanitarian causes including 🇵🇸 Free Palestine**.

**Bahasa Indonesia**

Dukungan Anda membantu pemeliharaan server, domain, infrastruktur, serta disalurkan untuk **kaum dhuafa, anak yatim/piatu, panti asuhan, panti jompo, dan bantuan kemanusiaan 🇵🇸 Free Palestine**.

- 💖 **Donasi Resmi / Official Donation:** [buymeacoffee.com/rheinsullivan](https://buymeacoffee.com/rheinsullivan)
- 🤝 **Kemitraan Lembaga / Institution Partnership:** Terbuka bagi yayasan dan panti asuhan resmi.

---

## License / Lisensi

**MIT** — [Rhein Sullivan](https://github.com/RheinSullivan) | [Vyagra Nexus™](https://github.com/RheinSullivan)

> *Made with ❤️ from Cirebon & South Jakarta, Nusantara, Indonesia.*  
> *Dibuat dengan ❤️ dari Cirebon & Jakarta Selatan, Nusantara, Indonesia.*
