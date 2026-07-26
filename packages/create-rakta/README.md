# create-rakta-app

Assalamu'alaikum Warahmatullahi Wabarakatuh · Shalom · Om Swastiastu · Namo Buddhaya · Wei De Dong Tian

Official scaffolding CLI for Rakta.js.

[![npm version](https://img.shields.io/npm/v/create-rakta-app?style=flat&label=create-rakta-app&color=C60005&labelColor=555)](https://www.npmjs.com/package/create-rakta-app)
[![downloads](https://img.shields.io/npm/dm/create-rakta-app?style=flat&label=downloads/month&color=009688&labelColor=555)](https://www.npmjs.com/package/create-rakta-app)
[![license](https://img.shields.io/badge/license-MIT-7CB342?style=flat&labelColor=555)](../../LICENSE)

---

## Usage

```bash
# Bun (recommended)
bun create rakta-app@latest my-app

# npm
npm create rakta-app@latest my-app

# pnpm
pnpm create rakta-app@latest my-app

# yarn
yarn create rakta-app@latest my-app
```

---

## Interactive Prompts

The CLI asks:

1. Project name
2. Project mode - `Frontend Only` or `Fullstack`
3. CSS framework - `Tailwind CSS v4`, `Bootstrap`, `SASS`, `None`
4. Rendering mode - `CSR`, `SSR`, `SSG`, `CSG`, `SPA`, `Hybrid`
5. *(Fullstack only)* Backend - `Gaman.js`, `Express.js`, `Nest.js`, `Adonis.js`
6. *(Fullstack only)* Database - `PostgreSQL`, `MySQL`, `SQLite`, `MongoDB`, `Redis`, `Firebase`, `MariaDB`, `PlanetScale`, `Neon`, `Turso`

---

## Project Modes

### Frontend Only

A standalone Rakta.js React frontend. Includes the ShrimpRun demo game, component showcase, deployment guide, language toggle, and aesthetic switcher. No backend, no database.

### Fullstack

A monorepo with a Rakta.js frontend and a backend of your choice. Includes auth system (register, login, OTP, JWT, sessions), CMS scaffold, database integration, shared types, and a dashboard.

---

## What's Included

**Frontend Only**

- Rakta.js framework - all features enabled
- ShrimpRun mini game (SVG shrimp, obstacle system, scoring, audio)
- Component showcase, docs modal, deployment guide modal
- Language toggle (Bahasa Indonesia / English)
- Aesthetic mode switcher (LENIS-MODERN, RETRO-CYBER, NEO-BRUTALIST)
- GSAP + ScrollTrigger pre-configured
- Tailwind CSS v4 (or chosen framework)
- PWA-ready with favicon set and web manifest
- Auto-import declarations generated
- TypeScript strict mode

**Fullstack (additional)**

- Auth: register, login, logout, forgot password, OTP reset
- JWT + session management, bcrypt password hashing
- CMS scaffold with post CRUD
- User management, mail provider, storage provider scaffolds
- Database migrations scaffold
- Shared types between frontend and backend
- Dashboard page with auth guard
- Environment variable validation

---

## Project Structure

**Frontend Only**

```
my-app/
├─ app/
│  ├─ layout.tsx
│  ├─ page.tsx
│  ├─ components/
│  ├─ hooks/
│  ├─ lib/
│  └─ utils/
├─ public/
├─ styles/
├─ rakta.config.ts
├─ rakta-env.d.ts
└─ package.json
```

**Fullstack**

```
my-app/
├─ frontend/          Rakta.js frontend + auth pages + dashboard
├─ backend/           API server (Gaman.js / Express / Nest / Adonis)
├─ shared/            Shared TypeScript types
└─ package.json       Monorepo root
```

---

## After Generation

```bash
# Frontend Only
cd my-app
bun install
bun run dev

# Fullstack
cd my-app && bun install
cd frontend && bun run dev   # terminal 1
cd backend  && bun run dev   # terminal 2
```

---

## CSS Options

| Option | Notes |
|---|---|
| Tailwind CSS v4 | Default. Utility-first, latest v4 syntax. |
| Bootstrap | Component-based, pre-built classes. |
| SASS | CSS preprocessor with variables and nesting. |
| None | Vanilla CSS only. |

---

## Rendering Modes

| Mode | Best For |
|---|---|
| CSR | Dashboards, apps requiring auth |
| SSR | Dynamic pages, personalized content |
| SSG | Blogs, docs, marketing pages |
| CSG | Static shell + client hydration |
| SPA | All navigation client-side |
| Hybrid | Mixed requirements per route |

---

## Backend Options

*(Fullstack only)*

| Framework | Notes |
|---|---|
| Gaman.js | Lightweight Bun-native HTTP. Co-developed with Rakta.js. |
| Express.js | Battle-tested, massive ecosystem. |
| Nest.js | Structured, TypeScript-first, decorators + DI. |
| Adonis.js | Full MVC with ORM and auth out of the box. |

---

## Database Options

*(Fullstack only)*

`PostgreSQL` `MySQL` `SQLite` `MariaDB` `MongoDB` `Redis` `Firebase` `PlanetScale` `Neon` `Turso`

---

## License

MIT - [Rhein Sullivan](https://github.com/RheinSullivan) | Vyagra Nexus™

🇮🇩 Made from Cirebon & South Jakarta, Nusantara, Indonesia. 🇵🇸 Free Palestine.
