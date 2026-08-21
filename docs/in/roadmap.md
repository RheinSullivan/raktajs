# Roadmap Rakta.js

Ini adalah kontrak publik untuk pengembangan Rakta.js. Semua yang tercantum di sini adalah yang tim rencanakan untuk dibangun.

---

## Sudah Rilis

| Versi | Tanggal | Yang Dirilis |
|-------|---------|-------------|
| **v1.0.0** | 2026-07 | Rilis publik pertama. Modul lengkap: MegaWeave router, NorthCoastFlow rendering (CSR/SSR/SSG/SPA/Hybrid), NagaLimanWire RPC, RaktaStore, validasi schema, HTTP client PanturaFetch, SEO MegaSignal, PWA ShrimpHarbor, auto-import TrusmiThread, kernel DI RaktaKernel, pipeline middleware RaktaMiddleware, manifest layout, kontrak data strategy, tools DX JatiLens, benchmark performa, security helpers, operasi (cron/queue/event bus), paket testing, deployment adapters, plugin registry, manifest RaktaDocs. |
| **v1.0.1** | 2026-07 | Perbaikan lint Biome: indentasi di `plugin/official.ts`. |
| **v1.0.5** | 2026-07 | Tambah GSAP + ScrollTrigger, smooth scroll PanturaScroll (`<pantura>` / `<reborns>`), file lib/helper terpisah di template, hapus CSS dari `.tsx`, update bahasa dokumentasi. |
| **v1.0.6** | 2026-07 | Rakta Dev Indicator (panel browser floating, SVG Rakta.js, Performance/Diagnostics/Preferences), Rakta Dev Terminal (glyph ⩛, deteksi LAN, deteksi file env, timing request, flag slow-request, NO_COLOR), instrumentasi timing middleware, hook `useRaktaData`, shell HTML dengan `modulepreload`/`preload` untuk first paint lebih cepat, HTTP client timeout 10s + keepalive + retry. |
| **v1.0.7** | 2026-07 | Perbaikan API Gaman.js v2.x (`composeRouter` + `RouterBuilder`, hapus `app.get/post` langsung), auth generator (prompt JWT / Session / JWT+Session, session policy, OAuth provider), perlindungan CSRF, rate limiter, secure headers, `postcss.config.ts` di project yang di-generate, dev 1-perintah (`bun run dev` jalankan frontend + backend sekaligus), next-steps CLI menampilkan path yang benar `cd <project>/frontend`, versi dev terminal dibaca saat runtime. |
| **v1.1.1** | 2026-07 | Module loader + pipeline startup/shutdown (`RaktaModuleLoader`, `createStartupPipeline`), middleware composer dengan ordering + `routeMiddleware`, layout resolver (`resolveLayoutChain`), primitif data fetching (`cache`, `revalidate`, `isr`, `defer`, `lazy`, `prefetch`), ops layer (cookies, headers, `defineServerAction`), perintah CLI diperluas (`doctor`, `analyze`, `benchmark`, `inspect`, `generate`, `check`, `telemetry`), sistem plugin diperbarui (11 plugin resmi dengan lifecycle hooks), security CSP builder (`buildCsp`, `defaultCsp`, `generateCspNonce`), utilitas testing component/e2e, paket ecosystem (`@rakta/auth`, `@rakta/forms`, `@rakta/database`, `@rakta/storage`), REST API helpers, GraphQL adapter, generator OpenAPI 3.1, magic link auth, TOTP 2FA. |
| **v1.1.2** | 2026-08 | Template frontend dibangun ulang dengan UI bilingual Inggris/Indonesia dan toggle bahasa, deklarasi auto-import diperbaiki, wrapper kompatibilitas migration backend Gaman.js dipulihkan, data seeder testing ditambahkan, catatan rilis diperbarui, asset bersama dipindahkan ke root `public/`, dan template fullstack diperketat lint/type safety-nya. |
| **v1.1.8** | 2026-08 | Stabilisasi runtime core, penanganan signal HTTP/RPC (`panturaFetch`), pembatasan path traversal (`safePathJoin`), klasifikasi tepat 10 tag kustom resmi (`<click>`, `<picture>`, `<lazy>`, `<guard>`, `<seal>`, `<shelf>`, `<island>`, `<prefetch>`, `<route>`, `<resource>`) dengan tag kompatibilitas tetap (`<pantura>`, `<reborns>`, `<form>`, `<title>`), serta dokumentasi lengkap 15 backend adapter dan 12 mesin database dengan contoh integrasi end-to-end. |

---

## Direncanakan

### v1.1.x - Database Adapters

- Adapter SQLite, PostgreSQL, MySQL, MariaDB, dan edge KV
- Abstraksi repository bertipe dengan `createInMemoryRepository`
- Kontrak adapter ORM untuk Drizzle dan Prisma
- Pola query builder untuk SQL bertipe tanpa overhead ORM penuh
- Integrasi migration runner
- Manajemen connection pool

### v1.2.0 - Auth Providers

- Alur OAuth 2.0 dengan 7 provider bawaan (Google, GitHub, Apple, Microsoft, Discord, GitLab, Facebook)
- Alur verifikasi email
- Rotasi refresh token
- Rotasi session dan penegakan kebijakan multi-device
- Dukungan Passkey / WebAuthn

### v1.3.0 - Devtools UI

- Inspektor auto-import berbasis browser (visualisasi TrusmiThread)
- Route analyzer live dengan overlay mode rendering
- Bundle analyzer dengan treemap ukuran
- Performance profiler (timing startup, hidratasi, transisi route)
- Error overlay dengan pemetaan stack trace lengkap
- Dukungan source map di dev terminal

### v1.4.0 - Build Compiler

- Kompilasi inkremental - hanya rebuild yang berubah
- Cache persisten di disk (`.rakta/cache/`)
- Chunk optimizer dengan pembuatan prefetch manifest
- Kompilasi paralel menggunakan worker threads
- Laporan verifikasi tree-shaking
- Target waktu build: 2× lebih cepat dari saat ini

### v1.5.0 - Content Layer

- Koleksi Markdown dengan schema frontmatter bertipe
- Jembatan plugin MDX (`@rakta/mdx`)
- Playground dokumentasi live
- Validasi schema konten menggunakan `rakta/schema`

### v2.0.0 - Pemisahan Ekosistem

Paket resmi yang dipisahkan dari core:

| Paket | Fungsi |
|-------|--------|
| `@rakta/auth` | Auth server, session store, OAuth, magic links, 2FA |
| `@rakta/database` | Adapter DB, pola repository, migration runner |
| `@rakta/storage` | S3-compatible, filesystem lokal, R2, in-memory |
| `@rakta/image` | Optimasi gambar, lazy loading, ukuran responsif |
| `@rakta/forms` | State form, validasi, server-side form actions |
| `@rakta/analytics` | Adapter analitik privacy-first |
| `@rakta/testing` | E2E client, component renderer, snapshot, coverage |
| `@rakta/config` | Config loading diperluas dengan validasi |

### v2.1.0 - Edge First

- Adapter Cloudflare Workers dengan streaming SSR
- Adapter Deno Deploy
- Runtime middleware edge (target overhead sub-1ms)
- Integrasi edge KV cache
- Plugin deployment `@rakta/cloudflare`, `@rakta/deno`

### v2.2.0 - React Server Components

- Pipeline rendering server component
- Server actions (sudah ada di ops layer, sekarang dengan integrasi RSC)
- Suspense streaming dengan hidratasi progresif
- Partial prerendering (PPR)
- Dukungan direktif `use server` / `use client`

### v2.3.0 - Internasionalisasi

- Routing i18n bawaan (`/en/about`, `/id/tentang`)
- Deteksi lokal dari header Accept-Language
- Katalog pesan dengan kunci bertipe
- Dukungan pluralisasi
- Helper layout RTL

### v2.4.0 - Native App Engine *(Fase Riset)*

**Visi:** Target kompilasi aplikasi native yang **10× lebih ringan dan cepat dari Ionic.js** dengan menghilangkan overhead bridge runtime dan menyediakan akses API device secara langsung.

**Arsitektur:**
- Native shell berbasis Rust atau Go - ukuran aplikasi dasar di bawah 5MB
- Web view khusus platform:
  - iOS: WKWebView
  - Android: WebView
  - macOS: WKWebView
  - Windows: WebView2
  - Linux: WebKitGTK
- Jembatan IPC zero-latency untuk API device - tanpa Capacitor, tanpa Cordova
- Target rendering 120 FPS dengan akselerasi hardware

**Dukungan API device via IPC langsung:**
- Kamera (pengambilan foto, rekam video, scan QR)
- Biometrik (Face ID, Touch ID, sidik jari)
- Push Notifications (FCM, APNs)
- Storage (filesystem native, SQLite, secure storage)
- Geolokasi (GPS, lokasi jaringan)
- Sensor (akselerometer, giroskop, kompas)
- Bluetooth (BLE)

**Platform yang didukung:** iOS, Android, macOS, Windows, Linux

**Target performa vs. Ionic.js:**
- Native shell 10× lebih kecil
- Cold start 5× lebih cepat
- Akses API langsung (0ms overhead bridge vs. ~16ms bridge Capacitor)
- 120 FPS vs. 60 FPS tipikal performa Ionic

### v3.0.0 - Multi-Runtime

- React, Preact, Solid, dan Vue sebagai runtime rendering yang bisa dipertukarkan via plugin API
- Deteksi runtime saat build time - tanpa overhead untuk runtime yang tidak digunakan
- Routing, RPC, dan data layer bersama di semua runtime

---

## Prinsip Arsitektur

Setiap versi harus mempertahankan:

1. **Keringanan** - setiap fitur bisa di-tree-shake. Import hanya yang kamu gunakan.
2. **Performa** - startup < 50ms, build 2× lebih cepat per siklus rilis.
3. **Type safety** - tidak ada `any` di API publik, inferensi TypeScript penuh.
4. **Developer experience** - satu perintah untuk mulai, satu paket untuk install.
5. **Identitas budaya** - semua nama fitur publik berasal dari warisan Cirebon dan Indonesia.

---

*Terakhir diperbarui: v1.1.8*

*Rakta.js dibuat oleh Rhein Sullivan (Muhammad Rizky Ramadhan) dari Cirebon & Jakarta Selatan, Indonesia - Vyagra Nexus™ 🇮🇩 · 🇵🇸 Free Palestine.*
