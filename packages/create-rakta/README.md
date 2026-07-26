<p align="center">
  <img src="https://raw.githubusercontent.com/RheinSullivan/raktajs/main/docs/assets/raktajs_benner.png" alt="Rakta.js banner" width="100%" />
</p>

<h1 align="center">create-rakta-app</h1>

<p align="center">
  <strong>The official project scaffolding CLI for Rakta.js.</strong><br />
  <strong>CLI scaffolding proyek resmi untuk Rakta.js.</strong>
</p>

<p align="center">
  <em>Small in size. Fierce in speed. Alive in every route.</em><br />
  <em>Kecil ukuran. Ganas kecepatan. Hidup di setiap route.</em>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/create-rakta-app"><img src="https://img.shields.io/npm/v/create-rakta-app?style=flat&color=C60005&labelColor=555&label=create-rakta-app" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/create-rakta-app"><img src="https://img.shields.io/npm/dm/create-rakta-app?style=flat&color=009688&labelColor=555&label=downloads/month" alt="monthly downloads" /></a>
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

- [What is create-rakta-app?](#what-is-create-rakta-app)
- [Quick Start](#quick-start--mulai-cepat)
- [Usage & Package Managers](#usage--package-managers)
- [Interactive Prompts](#interactive-prompts--pertanyaan-interaktif)
- [Project Modes](#project-modes--mode-proyek)
- [Frontend-Only Template](#frontend-only-template)
- [Fullstack Template](#fullstack-template)
- [CSS Frameworks](#css-frameworks--framework-css)
- [Rendering Modes](#rendering-modes--mode-render)
- [Backend Frameworks](#backend-frameworks--framework-backend)
- [Database Options](#database-options--pilihan-database)
- [After Generation](#after-generation--setelah-generate)
- [Generated File Structure](#generated-file-structure--struktur-file-yang-dihasilkan)
- [What's Included](#whats-included--apa-yang-disertakan)
- [Support & Donation](#support--donasi-kemanusiaan-)

---

## What is create-rakta-app?

**English**

`create-rakta-app` is the official CLI tool for scaffolding new Rakta.js projects. It guides you through an interactive prompt to select your project mode, CSS framework, rendering strategy, and (for fullstack projects) backend framework and database — then generates a fully configured, production-ready project in seconds.

**Bahasa Indonesia**

`create-rakta-app` adalah CLI resmi untuk membuat proyek Rakta.js baru. Tool ini memandu Anda melalui prompt interaktif untuk memilih mode proyek, framework CSS, strategi render, dan (untuk proyek fullstack) framework backend dan database — lalu menghasilkan proyek yang sudah dikonfigurasi penuh dan siap produksi dalam hitungan detik.

---

## Quick Start / Mulai Cepat

```bash
bun create rakta-app@latest my-app
cd my-app
bun install
bun run dev
```

---

## Usage & Package Managers

**English** — Use any package manager you prefer. All commands below create a new Rakta.js project.

**Bahasa Indonesia** — Gunakan package manager apapun yang Anda inginkan. Semua perintah di bawah membuat proyek Rakta.js baru.

```bash
# Bun (recommended / direkomendasikan)
bun create rakta-app@latest my-app
bunx create-rakta-app@latest my-app

# npm
npm create rakta-app@latest my-app
npm exec create-rakta-app@latest my-app
npx create-rakta-app@latest my-app

# pnpm
pnpm create rakta-app@latest my-app
pnpm dlx create-rakta-app@latest my-app

# yarn
yarn create rakta-app@latest my-app
```

> **Note / Catatan:**  
> `npm create-rakta-app@latest` (tanpa spasi sebelum `rakta-app`) **tidak valid**.  
> Bentuk yang benar adalah `npm create rakta-app@latest my-app` — perintah `create` npm selalu mengharapkan nama paket sebagai argumen terpisah setelah menghapus awalan `create-`.

---

## Interactive Prompts / Pertanyaan Interaktif

**English** — After running the command, you will be asked the following questions:

**Bahasa Indonesia** — Setelah menjalankan perintah, Anda akan ditanya pertanyaan berikut:

| Step / Langkah | Prompt (EN) | Prompt (ID) | Options / Pilihan |
|---|---|---|---|
| 1 | Project name | Nama proyek | Any valid directory name |
| 2 | Project mode | Mode proyek | `Frontend Only`, `Fullstack` |
| 3 | CSS framework | Framework CSS | `Tailwind CSS v4`, `Bootstrap`, `SASS`, `None` |
| 4 | Rendering mode | Mode render | `CSR`, `SSR`, `SSG`, `CSG`, `SPA`, `Hybrid` |
| 5 *(Fullstack)* | Backend framework | Framework backend | `Gaman.js`, `Express.js`, `Nest.js`, `Adonis.js` |
| 6 *(Fullstack)* | Database | Database | `PostgreSQL`, `MySQL`, `MongoDB`, `Firebase`, `SQLite`, `MariaDB`, `Redis`, `PlanetScale`, `Neon`, `Turso` |

---

## Project Modes / Mode Proyek

### Frontend Only

**English** — A standalone React frontend powered by Rakta.js. Includes the full ShrimpRun demo game, component showcase, and deployment guide. No backend, no database, no auth — just a clean frontend starter.

**Bahasa Indonesia** — Frontend React mandiri yang ditenagai Rakta.js. Termasuk demo game ShrimpRun lengkap, showcase komponen, dan panduan deployment. Tanpa backend, tanpa database, tanpa auth — hanya starter frontend yang bersih.

### Fullstack

**English** — A monorepo with a Rakta.js frontend and a backend in your chosen framework (Gaman.js, Express.js, Nest.js, or Adonis.js). Includes auth system, CMS scaffold, database integration, JWT, session management, and a shared types layer.

**Bahasa Indonesia** — Monorepo dengan frontend Rakta.js dan backend dengan framework pilihan Anda (Gaman.js, Express.js, Nest.js, atau Adonis.js). Termasuk sistem auth, scaffold CMS, integrasi database, JWT, manajemen session, dan layer tipe bersama.

---

## Frontend-Only Template

**English** — What you get with the frontend-only template.

**Bahasa Indonesia** — Apa yang Anda dapatkan dengan template frontend-only.

```txt
my-app/
├─ app/
│  ├─ layout.tsx               ← Root layout with metadata & fonts
│  ├─ page.tsx                 ← Landing page with demo game
│  ├─ loading.tsx              ← Global loading UI
│  ├─ error.tsx                ← Global error boundary
│  ├─ notFound.tsx             ← 404 page
│  ├─ components/
│  │  ├─ Header.tsx            ← Navbar with language & aesthetic toggle
│  │  ├─ HeroSection.tsx       ← Hero with CTA buttons
│  │  ├─ FeatureGrid.tsx       ← Feature showcase grid
│  │  ├─ Footer.tsx            ← Footer with links
│  │  ├─ ShrimpRunGame.tsx     ← Mini game (ShrimpRun)
│  │  ├─ ShrimpCharacter.tsx   ← SVG shrimp mascot
│  │  ├─ CoralObstacle.tsx     ← SVG coral obstacle
│  │  ├─ BubbleLayer.tsx       ← Animated bubble background
│  │  ├─ SeaweedGrass.tsx      ← Animated seaweed
│  │  ├─ BackgroundFish.tsx    ← Animated background fish
│  │  ├─ DocsModal.tsx         ← Documentation modal
│  │  ├─ ComponentsModal.tsx   ← Components showcase modal
│  │  └─ DeployModal.tsx       ← Deployment guide modal
│  ├─ hooks/
│  │  └─ useShrimpRun.ts       ← Game state & physics hook
│  ├─ lib/
│  │  ├─ featureData.ts        ← Feature list data
│  │  ├─ componentData.ts      ← Component demo data
│  │  ├─ docsData.ts           ← Documentation content
│  │  ├─ deployData.ts         ← Deployment guide data
│  │  ├─ gameData.ts           ← Game configuration data
│  │  ├─ gameUtils.ts          ← Game utility functions
│  │  ├─ fishData.ts           ← Fish animation data
│  │  └─ heroCopy.ts           ← Hero section copy
│  ├─ utils/
│  │  └─ audio.ts              ← Game audio helpers
│  └─ types/
│     └─ page.ts               ← Page-level type definitions
├─ public/
│  ├─ favicon.ico
│  ├─ favicon-16x16.png
│  ├─ favicon-32x32.png
│  ├─ apple-touch-icon.png
│  ├─ android-chrome-192x192.png
│  ├─ android-chrome-512x512.png
│  ├─ site.webmanifest
│  └─ rakta-logo.svg
├─ styles/
│  └─ globals.css              ← Global styles + CSS variables
├─ rakta.config.ts             ← Rakta.js configuration
├─ rakta-env.d.ts              ← Auto-import type declarations
├─ tsconfig.json
└─ package.json
```

---

## Fullstack Template

**English** — What you get with the fullstack template.

**Bahasa Indonesia** — Apa yang Anda dapatkan dengan template fullstack.

```txt
my-app/
├─ frontend/                   ← Rakta.js frontend (same as frontend-only + auth pages)
│  ├─ app/
│  │  ├─ auth/
│  │  │  ├─ login/page.tsx
│  │  │  ├─ register/page.tsx
│  │  │  ├─ forgot-password/page.tsx
│  │  │  ├─ reset-password/page.tsx
│  │  │  ├─ layout.tsx
│  │  │  └─ AuthShell.tsx
│  │  └─ dashboard/
│  │     ├─ layout.tsx
│  │     └─ page.tsx
│  ├─ lib/
│  │  ├─ auth.ts               ← Auth API calls (login, register, OTP)
│  │  └─ http.ts               ← HTTP client config
│  └─ ...
├─ backend/                    ← Backend (structure depends on chosen framework)
│  └─ src/
│     ├─ app.ts                ← App entry point
│     ├─ routes/api.ts         ← API route definitions
│     ├─ controllers/          ← Auth, CMS, user controllers
│     ├─ services/             ← Auth, CMS, user, OTP services
│     ├─ models/               ← User, CMS post models
│     ├─ auth/                 ← Auth service & session store
│     ├─ security/             ← JWT, password hashing
│     ├─ database/             ← DB client, migrations, repository
│     ├─ middlewares/          ← Auth middleware
│     ├─ mail/                 ← Mail provider
│     ├─ storage/              ← Storage provider
│     └─ env.ts                ← Environment validation
├─ shared/
│  └─ types/index.ts           ← Shared types between frontend & backend
├─ package.json                ← Monorepo root
└─ tsconfig.base.json
```

---

## CSS Frameworks / Framework CSS

| Option / Pilihan | Description (EN) | Deskripsi (ID) |
|---|---|---|
| **Tailwind CSS v4** *(default)* | Utility-first CSS framework, latest v4 syntax | Framework CSS utility-first, sintaks v4 terbaru |
| **Bootstrap** | Component-based CSS framework with pre-built classes | Framework CSS berbasis komponen dengan kelas siap pakai |
| **SASS** | CSS preprocessor with variables, nesting, and mixins | Preprocessor CSS dengan variabel, nesting, dan mixin |
| **None** | Vanilla CSS only, minimal setup | Hanya CSS vanilla, setup minimal |

---

## Rendering Modes / Mode Render

| Mode | Description (EN) | Deskripsi (ID) | Best For / Terbaik Untuk |
|---|---|---|---|
| **CSR** | Client-Side Rendering | Render di sisi klien | Dashboards, SPAs, apps requiring auth |
| **SSR** | Server-Side Rendering | Render di sisi server | Dynamic pages, personalized content |
| **SSG** | Static Site Generation | Generasi situs statis | Blogs, docs, marketing pages |
| **CSG** | Client-Side Generation | Generasi sisi klien | Hybrid static shell + client hydration |
| **SPA** | Single Page Application | Aplikasi halaman tunggal | Apps where all navigation is client-side |
| **Hybrid** | Per-route mixed strategy | Strategi campuran per route | Complex apps with mixed requirements |

---

## Backend Frameworks / Framework Backend

*(Fullstack mode only / Hanya mode fullstack)*

| Framework | Description (EN) | Deskripsi (ID) |
|---|---|---|
| **Gaman.js** *(default)* | Lightweight Bun-native HTTP framework, co-developed with Rakta.js | Framework HTTP ringan native Bun, dikembangkan bersama Rakta.js |
| **Express.js** | Battle-tested Node.js framework, massive ecosystem | Framework Node.js teruji, ekosistem besar |
| **Nest.js** | Structured, TypeScript-first framework with decorators & DI | Framework terstruktur TypeScript-first dengan decorator & DI |
| **Adonis.js** | Full-featured MVC framework with ORM and auth out of the box | Framework MVC lengkap dengan ORM dan auth bawaan |

---

## Database Options / Pilihan Database

*(Fullstack mode only / Hanya mode fullstack)*

| Database | Type / Tipe | Description (EN) | Deskripsi (ID) |
|---|---|---|---|
| **PostgreSQL** | Relational / Relasional | Powerful open-source SQL database | Database SQL open-source yang powerful |
| **MySQL** | Relational / Relasional | Widely used SQL database | Database SQL yang banyak digunakan |
| **SQLite** | Relational / Relasional | Serverless embedded SQL, great for local/edge | SQL embedded tanpa server, cocok untuk local/edge |
| **MariaDB** | Relational / Relasional | MySQL-compatible with extra features | Kompatibel MySQL dengan fitur tambahan |
| **MongoDB** | Document / Dokumen | Flexible NoSQL document database | Database dokumen NoSQL yang fleksibel |
| **Redis** | Key-Value | In-memory data store, great for caching & queues | Penyimpanan data in-memory, cocok untuk cache & queue |
| **Firebase** | Cloud / Cloud | Google's realtime NoSQL cloud platform | Platform cloud NoSQL realtime dari Google |
| **PlanetScale** | Cloud SQL | Serverless MySQL-compatible, branch-based schema | MySQL serverless dengan schema berbasis branch |
| **Neon** | Cloud SQL | Serverless PostgreSQL with branching | PostgreSQL serverless dengan branching |
| **Turso** | Edge SQL | SQLite for the edge, globally distributed | SQLite untuk edge, terdistribusi global |

---

## After Generation / Setelah Generate

### Frontend Only

```bash
cd my-app
bun install
bun run dev      # http://localhost:3000
bun run build    # Production build
bun run start    # Start production server
```

### Fullstack

```bash
cd my-app

# Install all workspace dependencies
bun install

# Run frontend dev server
cd frontend && bun run dev

# Run backend dev server (separate terminal)
cd backend && bun run dev

# Or run both with a root script (if configured)
bun run dev
```

---

## Generated File Structure / Struktur File yang Dihasilkan

### Key Files / File Penting

| File | Description (EN) | Deskripsi (ID) |
|---|---|---|
| `rakta.config.ts` | Rakta.js project configuration | Konfigurasi proyek Rakta.js |
| `rakta-env.d.ts` | Auto-generated type declarations for all globals | Deklarasi tipe auto-generate untuk semua global |
| `app/layout.tsx` | Root layout with metadata, fonts, and providers | Root layout dengan metadata, font, dan provider |
| `app/page.tsx` | Home page / landing page | Halaman utama |
| `app/loading.tsx` | Global loading UI | UI loading global |
| `app/error.tsx` | Global error boundary | Error boundary global |
| `app/notFound.tsx` | 404 not found page | Halaman 404 |
| `public/` | Static assets served at root | Aset statis yang disajikan di root |
| `styles/globals.css` | Global CSS with design tokens | CSS global dengan design token |

---

## What's Included / Apa yang Disertakan

### Frontend-Only Starter

**English**

- ✅ Full Rakta.js framework with all features enabled
- ✅ **ShrimpRun** — an underwater-themed mini game with SVG shrimp mascot, obstacle system, scoring, speed scaling, and audio
- ✅ Feature showcase grid with all Rakta.js capabilities
- ✅ Docs modal with integrated documentation
- ✅ Component demo modal
- ✅ Deployment guide modal (Vercel, Netlify, Cloudflare, Docker, and more)
- ✅ Multi-language toggle (Bahasa Indonesia / English)
- ✅ Aesthetic mode switcher (LENIS-MODERN, RETRO-CYBER, NEO-BRUTALIST)
- ✅ Dark mode by default
- ✅ PWA-ready with favicon set and web manifest
- ✅ GSAP + ScrollTrigger pre-configured
- ✅ Auto-import declarations for all components and hooks
- ✅ Tailwind CSS v4 (or chosen framework)
- ✅ TypeScript strict mode

**Bahasa Indonesia**

- ✅ Framework Rakta.js lengkap dengan semua fitur aktif
- ✅ **ShrimpRun** — mini game bertema bawah laut dengan maskot udang SVG, sistem rintangan, skor, skala kecepatan, dan audio
- ✅ Grid showcase fitur semua kemampuan Rakta.js
- ✅ Modal dokumentasi terintegrasi
- ✅ Modal demo komponen
- ✅ Modal panduan deployment (Vercel, Netlify, Cloudflare, Docker, dan lainnya)
- ✅ Toggle bahasa (Bahasa Indonesia / English)
- ✅ Switcher mode estetika (LENIS-MODERN, RETRO-CYBER, NEO-BRUTALIST)
- ✅ Dark mode sebagai default
- ✅ Siap PWA dengan set favicon dan web manifest
- ✅ GSAP + ScrollTrigger sudah dikonfigurasi
- ✅ Deklarasi auto-import untuk semua komponen dan hooks
- ✅ Tailwind CSS v4 (atau framework pilihan)
- ✅ TypeScript strict mode

### Fullstack Starter (tambahan / additional)

**English**

- ✅ All frontend-only features
- ✅ Auth system: register, login, logout, forgot password, OTP reset
- ✅ JWT + session management
- ✅ Password hashing (bcrypt)
- ✅ CMS scaffold with post CRUD
- ✅ User management endpoints
- ✅ Database migrations scaffold
- ✅ Mail provider scaffold
- ✅ Storage provider scaffold
- ✅ Shared types between frontend & backend
- ✅ Dashboard page with auth guard
- ✅ Environment variable validation

**Bahasa Indonesia**

- ✅ Semua fitur frontend-only
- ✅ Sistem auth: register, login, logout, lupa password, reset OTP
- ✅ Manajemen JWT + session
- ✅ Hashing password (bcrypt)
- ✅ Scaffold CMS dengan CRUD post
- ✅ Endpoint manajemen user
- ✅ Scaffold migrasi database
- ✅ Scaffold mail provider
- ✅ Scaffold storage provider
- ✅ Tipe bersama antara frontend & backend
- ✅ Halaman dashboard dengan auth guard
- ✅ Validasi environment variable

---

## Documentation / Dokumentasi

| Doc / Dokumentasi | Link |
|---|---|
| Templates (EN) | [`docs/en/templates.md`](../../docs/en/templates.md) |
| Templates (ID) | [`docs/id/templates.md`](../../docs/id/templates.md) |
| Getting Started (EN) | [`docs/en/gettingStarted.md`](../../docs/en/gettingStarted.md) |
| Mulai (ID) | [`docs/id/mulai.md`](../../docs/id/mulai.md) |
| Backend Frameworks (EN) | [`docs/en/backendFrameworks.md`](../../docs/en/backendFrameworks.md) |
| Framework Backend (ID) | [`docs/id/backendFramework.md`](../../docs/id/backendFramework.md) |
| Routing (EN) | [`docs/en/routing.md`](../../docs/en/routing.md) |
| Deployment (EN) | [`docs/en/deployment.md`](../../docs/en/deployment.md) |

---

## Support & Donasi Kemanusiaan 🇵🇸

**English**

Your support keeps the servers running, funds the domain, and is distributed to **the underprivileged, orphans, elderly homes, and humanitarian causes including 🇵🇸 Free Palestine**.

**Bahasa Indonesia**

Dukungan Anda membantu pemeliharaan server, domain, infrastruktur, serta disalurkan untuk **kaum dhuafa, anak yatim/piatu, panti asuhan, panti jompo, dan bantuan kemanusiaan 🇵🇸 Free Palestine**.

- 💖 **Donasi Resmi / Official Donation:** [buymeacoffee.com/rheinsullivan](https://buymeacoffee.com/rheinsullivan)
- 🤝 **Kemitraan Lembaga / Institution Partnership:** Terbuka bagi yayasan dan panti asuhan resmi — lihat [`docs/id/donasi.md`](../../docs/id/donasi.md).

---

## License / Lisensi

**MIT** — [Rhein Sullivan](https://github.com/RheinSullivan) | [Vyagra Nexus™](https://github.com/RheinSullivan)

> *Made with ❤️ from Cirebon & South Jakarta, Nusantara, Indonesia.*  
> *Dibuat dengan ❤️ dari Cirebon & Jakarta Selatan, Nusantara, Indonesia.*
