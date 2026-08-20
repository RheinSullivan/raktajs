# Rakta.js Roadmap

This is the public contract for Rakta.js development. Everything listed here is what the team intends to build. Versions are grouped by focus area.

---

## Released

| Version | Date | What Shipped |
|---------|------|-------------|
| **v1.0.0** | 2026-07 | First public release. Full module set: MegaWeave router, NorthCoastFlow rendering (CSR/SSR/SSG/SPA/Hybrid), NagaLimanWire RPC, RaktaStore, schema validation, PanturaFetch HTTP client, MegaSignal SEO, ShrimpHarbor PWA, TrusmiThread auto-import, RaktaKernel DI container, RaktaMiddleware pipeline, layout manifest, data strategy contracts, JatiLens DX tools, performance benchmarks, security helpers, operations (cron/queue/event bus), testing package, deployment adapters, plugin registry, RaktaDocs manifest. |
| **v1.0.1** | 2026-07 | Biome lint fix: indentation in `plugin/official.ts`. |
| **v1.0.5** | 2026-07 | Add GSAP + ScrollTrigger, PanturaScroll smooth scroll (`<pantura>` / `<reborns>`), separate lib/helper files in templates, remove CSS from `.tsx` files, update documentation language. |
| **v1.0.6** | 2026-07 | Rakta Dev Indicator (floating browser panel, Rakta.js SVG, Performance/Diagnostics/Preferences, dev-only), Rakta Dev Terminal (⩛ glyph, LAN detection, env file detection, request timing, slow-request flag, NO_COLOR), middleware timing instrumentation, `useRaktaData` hook, HTML shell `modulepreload`/`preload` for faster first paint, HTTP client timeout 10s + keepalive + retry. |
| **v1.0.7** | 2026-07 | Fix Gaman.js v2.x API (`composeRouter` + `RouterBuilder`, removed `app.get/post` direct calls), auth generator (JWT / Session / JWT+Session prompts, session policy, OAuth provider prompt), CSRF protection, rate limiter, secure headers, `postcss.config.ts` in generated projects (replaces `.js`), 1-command fullstack dev (`bun run dev` starts both frontend + backend), CLI next-steps now shows correct `cd <project>/frontend` paths, dev terminal version read at runtime. |
| **v1.1.1** | 2026-07 | Module loader + startup/shutdown pipeline (`RaktaModuleLoader`, `createStartupPipeline`), middleware composer with ordering + `routeMiddleware`, layout resolver (`resolveLayoutChain`), data fetching primitives (`cache`, `revalidate`, `isr`, `defer`, `lazy`, `prefetch`), ops layer (cookies, headers, `defineServerAction`), CLI extended commands (`doctor`, `analyze`, `benchmark`, `inspect`, `generate`, `check`, `telemetry`), plugin system upgraded (all 11 official plugins with lifecycle hooks), security CSP builder (`buildCsp`, `defaultCsp`, `generateCspNonce`), testing component/e2e utilities, ecosystem packages (`@rakta/auth`, `@rakta/forms`, `@rakta/database`, `@rakta/storage`), REST API helpers, GraphQL adapter, OpenAPI 3.1 generator, magic link auth, TOTP 2FA. |
| **v1.1.2** | 2026-08 | Rebuilt frontend templates with bilingual English/Indonesian UI and language toggle, fixed auto-import declarations, restored Gaman.js backend migration compatibility wrapper, added database seeders for testing, refreshed release notes, moved shared assets to root `public/`, and tightened fullstack template lint/type safety. |
| **v1.1.8** | 2026-08 | Core runtime stabilization, HTTP/RPC signal cancellation (`panturaFetch`), path traversal hardening (`safePathJoin`), expansion to 10 official custom tag primitives (`<click>`, `<picture>`, `<pantura>`, `<reborns>`, `<lazy>`, `<guard>`, `<seal>`, `<form>`, `<title>`, `<shelf>`), and complete multi-language documentation for all 15 backend adapters and 12 database engines with end-to-end integration examples. |

---

## Planned

### v1.1.x - Database Adapters

- SQLite, PostgreSQL, MySQL, MariaDB, and edge KV adapters
- Typed repository abstraction with `createInMemoryRepository` (already in `rakta/ecosystem`)
- ORM adapter contracts for Drizzle and Prisma
- Query builder pattern for typed SQL without full ORM weight
- Migration runner integration
- Connection pool management

### v1.2.0 - Auth Providers

- OAuth 2.0 flow with all 7 built-in providers (Google, GitHub, Apple, Microsoft, Discord, GitLab, Facebook) wired to routing
- Email verification flow
- Refresh token rotation (already exists in generated templates, now promoted to framework level)
- Session rotation and multi-device policy enforcement
- Passkey / WebAuthn support

### v1.3.0 - Devtools UI

- Browser-based auto-import inspector (TrusmiThread visualization)
- Live route analyzer with render mode overlay
- Bundle analyzer with size treemap
- Performance profiler (startup, hydration, route transition timings)
- Error overlay with full stack trace mapping
- Source map support in dev terminal

### v1.4.0 - Build Compiler

- Incremental compilation - only rebuild what changed
- Persistent on-disk cache (`.rakta/cache/`)
- Chunk optimizer with prefetch manifest generation
- Parallel compilation using worker threads
- Tree-shaking verification report
- Build time: target 2× faster than current

### v1.5.0 - Content Layer

- Markdown collections with typed frontmatter schema
- MDX plugin bridge (`@rakta/mdx`)
- Live documentation playground
- Content schema validation using `rakta/schema`

### v2.0.0 - Ecosystem Split

Official packages extracted from the core:

| Package | Purpose |
|---------|---------|
| `@rakta/auth` | Auth server, session store, OAuth, magic links, 2FA |
| `@rakta/database` | DB adapters, repository pattern, migration runner |
| `@rakta/storage` | S3-compatible, local filesystem, R2, in-memory |
| `@rakta/image` | Image optimization, lazy loading, responsive sizes |
| `@rakta/forms` | Form state, validation, server-side form actions |
| `@rakta/analytics` | Privacy-first analytics adapter |
| `@rakta/testing` | E2E client, component renderer, snapshot, coverage |
| `@rakta/config` | Extended config loading with validation |

### v2.1.0 - Edge First

- Cloudflare Workers adapter with streaming SSR
- Deno Deploy adapter
- Edge middleware runtime (sub-1ms overhead target)
- Edge KV cache integration
- `@rakta/cloudflare`, `@rakta/deno` deployment plugins

### v2.2.0 - React Server Components

- Server component rendering pipeline
- Server actions (already in ops layer, now with RSC integration)
- Suspense streaming with progressive hydration
- Partial prerendering (PPR)
- `use server` / `use client` directive support

### v2.3.0 - Internationalization

- Built-in i18n routing (`/en/about`, `/id/tentang`)
- Locale detection from Accept-Language header
- Message catalog with typed keys
- Pluralization support
- RTL layout helpers

### v2.4.0 - Native App Engine *(Research Phase)*

**Vision:** A native app compilation target that is **10× lighter and faster than Ionic.js** by eliminating runtime bridge overhead and providing direct device API access.

**Architecture:**
- Rust or Go-based native shell - sub-5MB base application size
- Platform-specific web view:
  - iOS: WKWebView
  - Android: WebView
  - macOS: WKWebView
  - Windows: WebView2
  - Linux: WebKitGTK
- Zero-latency IPC bridge for device APIs - no Capacitor, no Cordova
- 120 FPS hardware-accelerated rendering target

**Device API support via direct IPC:**
- Camera (photo capture, video recording, QR scanning)
- Biometrics (Face ID, Touch ID, fingerprint)
- Push Notifications (FCM, APNs)
- Storage (native file system, SQLite, secure storage)
- Geolocation (GPS, network location)
- Sensors (accelerometer, gyroscope, compass)
- Bluetooth (BLE)

**Target platforms:** iOS, Android, macOS, Windows, Linux

**Performance targets vs. Ionic.js:**
- 10× smaller native shell
- 5× faster cold start
- Direct API access (0ms bridge overhead vs. ~16ms Capacitor bridge)
- 120 FPS vs. 60 FPS typical Ionic performance

### v3.0.0 - Multi-Runtime

- React, Preact, Solid, and Vue as interchangeable rendering runtimes via plugin API
- Runtime detection at build time - zero overhead for unused runtimes
- Shared routing, RPC, and data layers across all runtimes

---

## Architecture Principles

Every version must maintain:

1. **Lightness** - every feature is tree-shakeable. Import only what you use.
2. **Performance** - startup < 50ms, build 2× faster per release cycle.
3. **Type safety** - no `any` in public APIs, full TypeScript inference.
4. **Developer experience** - one command to start, one package to install.
5. **Cultural identity** - all public feature names derive from Cirebon and Indonesian heritage.

---

## Feature Identity Reference

| Feature Name | Module | Origin |
|---|---|---|
| MegaWeave | `rakta/router` | Mega Mendung pattern |
| ShrimpStep | `rakta/components` | Cirebon shrimp culture |
| TrusmiFrame | `rakta/components` | Trusmi batik village |
| PanturaScroll | `rakta/components` | Jalur Pantura highway |
| KasepuhanGate | `rakta/router` | Kasepuhan Palace |
| KanomanShield | `rakta/middleware` | Kanoman Palace |
| SunyaragiCrown | `rakta/seo` | Sunyaragi grotto |
| NagaLimanWire | `rakta/rpc` | Paksi Naga Liman creature |
| TrusmiThread | `rakta/autoImport` | Trusmi batik threads |
| CherbonsEngine | `rakta/forge` | Cirebon (Cheribon) |
| NorthCoastFlow | `rakta/render` | North coast Java |
| MegaSignal | `rakta/seo` | Mega Mendung clouds |
| ShrimpHarbor | `rakta/pwa` | Cirebon port |
| JatiLens | `rakta/developerExperience` | Jati (teak) clarity |
| RaktaKernel | `rakta/kernel` | Rakta = life force |
| RaktaMiddleware | `rakta/middleware` | Request pipeline |
| RaktaDocs | `rakta/docs` | Documentation layer |
| RaktaAlert | `rakta/components` | Alert component |
| RaktaToaster | `rakta/components` | Toast notifications |

---

*Last updated: v1.1.8*

*Rakta.js is built by Rhein Sullivan (Muhammad Rizky Ramadhan) from Cirebon & South Jakarta, Indonesia - Vyagra Nexus™ 🇮🇩 · 🇵🇸 Free Palestine.*
