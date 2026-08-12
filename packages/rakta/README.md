# raktajs

Assalamu'alaikum Warahmatullahi Wabarakatuh · Shalom · Om Swastiastu · Namo Buddhaya · Wei De Dong Tian

A fullstack React framework built on Bun, TypeScript, and a Cirebon soul.

[![npm version](https://img.shields.io/npm/v/raktajs?style=flat&label=raktajs&color=C60005&labelColor=555)](https://www.npmjs.com/package/raktajs)
[![downloads](https://img.shields.io/npm/dm/raktajs?style=flat&label=downloads/month&color=009688&labelColor=555)](https://www.npmjs.com/package/raktajs)
[![license](https://img.shields.io/badge/license-MIT-7CB342?style=flat&labelColor=555)](../../LICENSE)

---

## Installation

```bash
bun add raktajs
```

## Quick Start

```bash
bun create rakta-app@latest my-app
cd my-app && bun install && bun run dev
```

---

## What is Rakta.js?

Rakta.js is a React framework powered by Bun. It handles routing, rendering, SEO, components, RPC, schema validation, HTTP, PWA, middleware, and more - all from a single package with no fragmentation.

Every feature is named after the cultural heritage of **Cirebon, West Java, Indonesia**.

---

## Features

### Routing

File-based routing from `app/`. Special files: `layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx`, `notFound.tsx`.

```
app/
├─ layout.tsx
├─ page.tsx
├─ about/
│  └─ page.tsx
├─ blog/
│  ├─ layout.tsx
│  ├─ page.tsx
│  └─ [slug]/page.tsx
├─ (auth)/
│  ├─ login/page.tsx
│  └─ register/page.tsx
└─ api/
   └─ hello/route.ts
```

### Rendering Modes

| Mode | Description |
|---|---|
| `csr` | Client-Side Rendering |
| `ssr` | Server-Side Rendering |
| `ssg` | Static Site Generation |
| `csg` | Client-Side Generation |
| `spa` | Single Page Application |
| `hybrid` | Per-route mixed strategy |

### Configuration

```ts
// rakta.config.ts
import { defineRaktaConfig } from "raktajs";

export default defineRaktaConfig({
  appName: "My App",
  render: { defaultMode: "csr" },
  server: { port: 3000 },
});
```

### Components

```tsx
// ShrimpStep - SPA navigation
<click to="/about">About</click>

// TrusmiFrame - optimized image
<picture path="/hero.jpg" alt="Hero" />

// PanturaScroll - smooth scroll trigger
<pantura to="features" offset={80}>See Features</pantura>

// Reborns - scroll target marker
<reborns id="features"><h2>Features</h2></reborns>
```

### PanturaScroll Hook

```ts
import { usePantura } from "raktajs/components";

const scrollTo = usePantura({ offset: 80 });
scrollTo("features");
```

### Alert & Toast

```tsx
import { Alert, toast, Toaster } from "raktajs/components";

<Toaster position="top-right" />
<Alert type="success">Saved.</Alert>

toast.success("Uploaded.");
toast.error("Failed.");
```

### Hooks

All React hooks re-exported with Cirebon names. Standard names also work.

```ts
import {
  lengkoState,       // useState
  empalEffect,       // useEffect
  kanomanMemo,       // useMemo
  kasepuhanCallback, // useCallback
  megamendungRef,    // useRef
  usePantura,        // smooth scroll
} from "raktajs/hooks";
```

### RPC

```ts
// server
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

### Schema Validation

```ts
import { string, number, object, array } from "raktajs/schema";

const User = object({
  name: string().min(2).max(50),
  age:  number().min(0).max(120),
  tags: array(string()),
});

const result = User.parse(data);
if (result.ok) console.log(result.value);
```

### HTTP Client

```ts
import { createRaktaHttp } from "raktajs/http";

const http = createRaktaHttp({ baseUrl: "https://api.example.com", timeout: 10_000 });
const users = await http.get<User[]>("/users");
```

### State Store

```ts
import { createRaktaStore } from "raktajs/store";

const useCounter = createRaktaStore({ count: 0 });

function Counter() {
  const { count } = useCounter();
  return <button onClick={() => useCounter.setState({ count: count + 1 })}>
    {count}
  </button>;
}
```

### Data Fetching - useRaktaData

```ts
import { useRaktaData } from "raktajs";

function ReportPage() {
  const { data, loading, error, refetch } = useRaktaData(
    (signal) => fetch("/api/report", { signal }).then(r => r.json()),
    [],       // deps - refetch when these change
    "report"  // optional dedup key
  );

  if (loading) return <p>Loading...</p>;
  if (error)   return <p>Error: {error.message}</p>;
  return <pre>{JSON.stringify(data)}</pre>;
}
```

Features: lifecycle (idle→loading→success|error), in-memory deduplication, AbortController cancellation on unmount, manual refetch.

### Dev Tools - Experimental

Development-only. Not in production builds.

**Rakta Dev Terminal** - output when `bun run dev`:

```
  ⩛ Rakta.js 1.1.5 (CherbonsEngine)

  Local:         http://localhost:3000
  Network:       http://192.168.1.8:3000
  Environments:  .env.local
  Mode:          development

  ✓ Ready in 421ms

  ✓ GET  /                  200  24ms
  ✓ GET  /api/report        200  17ms
  ⚠ GET  /api/slow          200  1.4s  [slow]
  ✗ GET  /missing           404   2ms
```

**Rakta Dev Indicator** - floating panel in browser (bottom-left, Rakta.js SVG logo). Shows route, render mode, bundler, real Performance API measurements, and diagnostics for the "response done but UI slow" case.

See [docs/en/devtools.md](../../docs/en/devtools.md) and [docs/en/performance.md](../../docs/en/performance.md).

### SEO

```tsx
import { RaktaHead, defineSeo } from "raktajs/seo";

export const metadata = defineSeo({
  title: "My Page",
  description: "Built with Rakta.js",
  openGraph: { title: "My Page", image: "/og.png" },
});
```

### Security

```ts
import { createSecureHeaders, createCsrfToken, RateLimiter } from "raktajs/security";

const headers = createSecureHeaders({ contentSecurityPolicy: true });
const csrf   = await createCsrfToken(secret);
const limit  = new RateLimiter({ max: 100, windowMs: 60_000 });
```

---

## Package Exports

```
raktajs               core re-exports
raktajs/components    Pantura, Reborns, Click, Picture, Alert, Toaster
raktajs/hooks         all React hooks (Cirebon-named + standard)
raktajs/router        route scanning, manifest, matching
raktajs/render        rendering modes and renderer
raktajs/config        defineRaktaConfig, loadConfig
raktajs/seo           RaktaHead, defineSeo, sitemap, robots
raktajs/pwa           manifest, service worker, cache strategies
raktajs/rpc           createRaktaRouter, publicProcedure, createRaktaClient
raktajs/schema        string, number, boolean, object, array
raktajs/http          createRaktaHttp
raktajs/store         createRaktaStore
raktajs/autoImport    scanForExports, generateAutoImports
raktajs/forge         buildProject, startDevServer, inspectBuild
raktajs/tide          runtime adapter, request context
raktajs/kernel        createRaktaKernel, createServiceContainer
raktajs/middleware    defineMiddleware, createMiddlewareStack
raktajs/security      createSecureHeaders, CSRF, RateLimiter, SecretManager
raktajs/data          createDataCache, defineRouteDataStrategy, useRaktaData
raktajs/layout        createLayoutManifest, matchLayouts
raktajs/deployment    createDeploymentAdapter, listDeploymentTargets
raktajs/testing       runRaktaTests, createMockServer
raktajs/performance   benchmark, createBundleSizeReport
raktajs/plugin        createPluginRegistry, createOfficialPlugins
raktajs/developerExperience analyzeBundle, analyzeRoutes, createDependencyGraph, DevTerminal, DevIndicator
raktajs/docs          scanMarkdownDocs, createVitePressConfig
raktajs/ops           RaktaQueue, RaktaEventBus, runCronTask
raktajs/motion        definePageTransition, useSharedElement, useMagnetic, useTilt, useParallax, useDrag, useSpotlight, useCursorFollower, splitText, animateText
raktajs/scene         createMegaScape, useMegaScapeScene, useScrollScene, loadGLTF, loadTexture
raktajs/vector        createStateMachine, useTrusmiVector, useMascot, useImageZoom, useTrusmiGallery
```

---

## CLI

```bash
rakta dev
rakta build
rakta start
rakta routes
rakta make page <name>
rakta make layout <name>
rakta make api <name>
rakta imports:generate
rakta rpc:types
rakta seo:generate
rakta doctor
```

---

## Cultural Identity

Rakta.js names its features after the heritage of Cirebon, West Java, Indonesia - landmarks, arts, culinary traditions, and history. Not decoration. A real foundation from the developer who built it.

| Name | Origin | Role |
|---|---|---|
| MegaWeave | Mega Mendung batik motif | File-based router |
| ShrimpStep | Cirebon shrimp culture | SPA navigation |
| TrusmiFrame | Batik Trusmi village | Image component |
| PanturaScroll | Jalur Pantai Utara highway | Smooth scroll |
| KasepuhanGate | Keraton Kasepuhan palace | API routes |
| KanomanShield | Keraton Kanoman palace | Auth guard |
| SunyaragiCrown | Taman Sari Gua Sunyaragi | SEO & metadata |
| NagaLimanWire | Paksi Naga Liman creature | Type-safe RPC |
| CherbonsEngine | Cirebon's old name | Build & dev engine |

---

## License

MIT - [Rhein Sullivan](https://github.com/RheinSullivan) | Vyagra Nexus™

🇮🇩 Made from Cirebon & South Jakarta, Indonesia, Indonesia. 🇵🇸 Free Palestine.
