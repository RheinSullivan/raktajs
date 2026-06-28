<p align="center">
  <img src="docs/assets//raktajs_benner.png" alt="Rakta.js banner" width="100%" />
</p>

<h1 align="center">React Framework</h1>

<p align="center">
  <strong>A lightweight, composable frontend framework built on Bun, React, and TypeScript.</strong>
</p>

<p align="center">
  <em>Small in size. Fierce in speed. Alive in every route.</em>
</p>

<p align="center">
  <a href="./LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-red.svg" alt="MIT License" />
  </a>
  <a href="https://www.npmjs.com/package/create-rakta-app">
    <img src="https://img.shields.io/badge/create--rakta--app-CLI-red.svg" alt="create rakta app CLI" />
  </a>
  <a href="https://bun.sh">
    <img src="https://img.shields.io/badge/runtime-Bun-ff69b4.svg" alt="Bun runtime" />
  </a>
  <a href="https://react.dev">
    <img src="https://img.shields.io/badge/React-19-149ECA.svg?logo=react&logoColor=white" alt="React 19" />
  </a>
  <a href="https://www.typescriptlang.org">
    <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6.svg?logo=typescript&logoColor=white" alt="TypeScript 5.x" />
  </a>
  <a href="https://github.com/RheinSullivan/raktajs">
    <img src="https://img.shields.io/badge/GitHub%20Stars-0-black.svg?logo=github&logoColor=white" alt="GitHub stars" />
  </a>
</p>

<p align="center">
  <strong>Bun in the engine. React at the core. Cirebon in the soul. Garuda in the heart.</strong>
</p>

---

## About

Rakta.js is a lightweight, composable frontend framework built on React, Bun, and TypeScript.

It provides file-based routing, flexible rendering modes, SEO tooling, PWA support, type-safe RPC patterns, state management, schema validation, an HTTP client, and a project generator that can create either frontend-only apps or fullstack apps.

The name **Rakta** comes from Sanskrit. It symbolizes red, life energy, courage, strength, identity, and movement. Inside this name, there is also a quiet reminder, when ordinary people carry heavy days in silence, every small tool should help them build something that belongs to them, not something that keeps them waiting at the gate.

The shrimp mascot represents Cirebon, a coastal city in West Java, Indonesia, known for its shrimp culture, cultural crafts, royal heritage, and the visual language of Mega Mendung and Trusmi batik. Rakta.js uses this identity as a subtle foundation for a modern developer framework.

Rakta.js is built for people who want speed without losing control, structure without unnecessary weight, and a framework identity that feels alive, local, and independent.

---

## Why Rakta.js?

| Problem                                              | Rakta.js approach                                                             |
| ---------------------------------------------------- | ----------------------------------------------------------------------------- |
| Frontend projects often start with too much setup    | `create-rakta-app` can generate a focused frontend-only app                   |
| Routing setup can become repetitive                  | **MegaWeave** provides file-based routing                                     |
| Image and navigation primitives usually feel generic | **ShrimpStep** and **TrusmiFrame** provide Rakta.js public component identity |
| SEO often needs extra configuration                  | **MegaSignal** is designed for metadata, sitemap, robots, RSS, and JSON-LD    |
| PWA support is usually an afterthought               | **ShrimpHarbor** is planned as the offline and installable app layer          |
| Build tooling can feel heavy                         | **CherbonsEngine** uses Bun-powered tooling                                   |
| Runtime strategy needs to stay flexible              | **NorthCoastFlow** handles request and rendering flow                         |
| Type-safe RPC can require extra libraries            | **NagaLimanWire** is Rakta.js type-safe RPC concept                           |
| Projects need diagnostics                            | **JatiLens** is the project health and diagnostics layer                      |

---

## Feature identity

Rakta.js uses its own framework language. The public naming avoids copying feature names from other frameworks.

| Feature            | Purpose                                      |
| ------------------ | -------------------------------------------- |
| **MegaWeave**      | File-based routing layer                     |
| **ShrimpStep**     | Navigation experience using `<click to="">`  |
| **TrusmiFrame**    | Picture experience using `<picture path="">` |
| **KasepuhanGate**  | File-based API endpoint concept              |
| **KanomanShield**  | Route protection layer                       |
| **SunyaragiCrown** | Metadata and head manager                    |
| **NagaLimanWire**  | Type-safe RPC concept                        |
| **TrusmiThread**   | Auto import system                           |
| **CherbonsEngine** | Build and dev engine                         |
| **NorthCoastFlow** | Runtime and rendering flow                   |
| **MegaSignal**     | SEO, sitemap, robots, and RSS layer          |
| **ShrimpHarbor**   | PWA and offline layer                        |
| **JatiLens**       | Diagnostics and project health               |

---

## Installation

Create a new Rakta.js app:

```bash
bun create-rakta-app@latest my-app
````

Move into the project:

```bash
cd my-app
bun install
bun run dev
```

Other package manager entry points:

```bash
bunx create-rakta-app@latest my-app
npm create rakta-app@latest my-app
pnpm create rakta-app@latest my-app
yarn create rakta-app my-app
```

---

## Create app modes

Rakta.js is frontend-first, but it can also generate a fullstack structure when needed.

### Frontend only

```bash
bun create-rakta-app@latest my-frontend
```

Choose:

```txt
Frontend only
```

Generated structure:

```txt
my-frontend/
├─ app/
│  ├─ page.tsx
│  ├─ layout.tsx
│  ├─ loading.tsx
│  ├─ error.tsx
│  └─ not-found.tsx
├─ components/
├─ lib/
├─ public/
├─ styles/
├─ docs/
├─ rakta.config.ts
├─ package.json
└─ tsconfig.json
```

Frontend-only mode does not generate:

```txt
backend/
database/
schema/
prisma/
shared/
server-only files
```

The project root itself is the frontend app.

### Fullstack app

```bash
bun create-rakta-app@latest my-fullstack
```

Choose:

```txt
Fullstack app
```

Generated structure:

```txt
my-fullstack/
├─ frontend/
│  ├─ app/
│  ├─ components/
│  ├─ lib/
│  ├─ public/
│  ├─ styles/
│  └─ rakta.config.ts
├─ backend/
│  ├─ src/
│  └─ package.json
├─ shared/
├─ docs/
├─ package.json
└─ tsconfig.base.json
```

---

## Rendering modes

Rakta.js supports multiple rendering strategies through configuration.

| Mode     | Purpose                        |
| -------- | ------------------------------ |
| `csr`    | Client side rendering          |
| `ssr`    | Server side rendering          |
| `ssg`    | Static site generation         |
| `csg`    | Configurable static generation |
| `spa`    | Single page application mode   |
| `hybrid` | Route level mixed rendering    |

Example:

```ts
import { defineConfig } from "rakta/config";

export default defineConfig({
  appName: "My Rakta App",
  render: {
    defaultMode: "ssr",
    routes: {
      "/": "ssg",
      "/dashboard": "csr",
      "/docs/**": "ssg",
    },
  },
});
```

---

## Public component identity

Rakta.js keeps public UI primitives simple and memorable.

### Navigation

```tsx
<click to="/docs">
  Documentation
</click>
```

### Picture

```tsx
<picture path="/shrimp.png" alt="Rakta shrimp mascot"></picture>
```

The internal implementation can be React-based, but the public framework identity stays Rakta.js-owned.

---

## Schema validation

Rakta.js includes a small schema layer for validating data.

```ts
import { object, string, number } from "rakta/schema";

const userSchema = object({
  name: string().min(1),
  age: number().int().positive(),
});

const result = userSchema.safeParse({
  name: "Rhein",
  age: 22,
});

if (result.kind === "success") {
  console.log(result.data.name);
}
```

---

## Type-safe RPC

Rakta.js includes a type-safe RPC concept through **NagaLimanWire**.

```ts
import { createRaktaRouter, publicProcedure } from "rakta/rpc";
import { object, string } from "rakta/schema";

export const appRouter = createRaktaRouter({
  hello: publicProcedure
    .input(
      object({
        name: string().min(1),
      })
    )
    .query(async ({ input }) => {
      return {
        message: `Hello ${input.name}`,
      };
    }),
});

export type AppRouter = typeof appRouter;
```

Client usage:

```ts
import { createRaktaClient } from "rakta/rpc";
import type { AppRouter } from "./router";

const api = createRaktaClient<AppRouter>({
  baseUrl: "http://localhost:3000/rpc",
});

const result = await api.hello.query({
  name: "Rakta",
});
```

---

## SEO

Rakta.js is designed to include SEO primitives through **MegaSignal** and metadata management through **SunyaragiCrown**.

Planned SEO tools:

```txt
metadata
canonical
alternate languages
sitemap.xml
sitemap index
robots.txt
RSS feed
JSON-LD
Open Graph
Twitter card
```

Example metadata:

```ts
export const metadata = {
  title: "Rakta.js",
  description: "A lightweight, composable frontend framework on Bun.",
  openGraph: {
    title: "Rakta.js",
    description: "Small in size. Fierce in speed. Alive in every route.",
    type: "website",
  },
};
```

---

## PWA

**ShrimpHarbor** is the Rakta.js PWA and offline layer.

Planned PWA features:

```txt
web manifest
service worker
offline fallback
install prompt
icons
theme color
cache strategy helpers
```

---

## Repository layout

The Rakta.js repository should not only contain `packages/`. It should be organized like a real framework repository.

Recommended root structure:

```txt
raktajs/
├─ .github/
│  ├─ workflows/
│  └─ ISSUE_TEMPLATE/
├─ assets/
│  └─ brand/
├─ docs/
│  ├─ en/
│  └─ id/
├─ examples/
│  ├─ frontend-only/
│  ├─ fullstack/
│  ├─ docs-site/
│  ├─ dashboard/
│  └─ pwa-offline/
├─ packages/
│  ├─ rakta/
│  └─ create-rakta/
├─ playground/
├─ scripts/
├─ website/
├─ .gitignore
├─ bunfig.toml
├─ package.json
├─ README.md
├─ CONTRIBUTING.md
├─ LICENSE
└─ tsconfig.base.json
```

---

## Enterprise architecture

Rakta.js can be used for bigger systems with a clean enterprise-style layout.

```txt
enterprise-app/
├─ apps/
│  ├─ web/
│  ├─ admin/
│  ├─ docs/
│  └─ portal/
├─ packages/
│  ├─ ui/
│  ├─ config/
│  ├─ contracts/
│  ├─ validators/
│  └─ services/
├─ backend/
│  ├─ src/
│  └─ package.json
├─ infrastructure/
│  ├─ docker/
│  └─ deploy/
├─ docs/
├─ package.json
└─ tsconfig.base.json
```

Recommended enterprise separation:

| Area                  | Purpose                           |
| --------------------- | --------------------------------- |
| `apps/web`            | Public website                    |
| `apps/admin`          | Internal dashboard                |
| `apps/docs`           | Documentation site                |
| `packages/ui`         | Shared UI primitives              |
| `packages/contracts`  | Shared request and response types |
| `packages/validators` | Shared schema validation          |
| `backend`             | Backend service                   |
| `infrastructure`      | Deployment and ops files          |

---

## Scripts

Root scripts:

```bash
bun run dev
bun run build
bun run typecheck
bun run test
bun run lint
bun run format
```

Package scripts:

```bash
bun run typecheck:rakta
bun run typecheck:create-rakta
bun run build:rakta
bun run build:create-rakta
```

---

## Package exports

Rakta.js is designed with modular exports:

```txt
rakta
rakta/components
rakta/router
rakta/render
rakta/config
rakta/seo
rakta/pwa
rakta/rpc
rakta/schema
rakta/http
rakta/store
rakta/auto-import
rakta/forge
rakta/tide
```

---

## Roadmap

### v0.1.0

* Core config
* CLI starter
* File-based routing scanner
* Rendering mode types
* Schema validation
* RPC prototype
* Tide runtime layer
* Forge dev server layer
* README, contributing, and license

### v0.2.0

* HMR
* Stable route manifest
* Layout rendering
* Error and loading conventions
* Better dev overlay
* Docs website foundation

### v0.3.0

* MegaSignal SEO layer
* ShrimpHarbor PWA layer
* TrusmiThread auto imports
* JatiLens diagnostics
* Official examples

### v1.0.0

* Stable frontend-only app mode
* Stable fullstack app mode
* Production build pipeline
* Official docs
* API reference
* Plugin system

---

## Contributing

Rakta.js is open for contributions.

Start locally:

```bash
git clone https://github.com/RheinSullivan/raktajs.git
cd raktajs
bun install
bun run typecheck
bun run build
```

Create a branch:

```bash
git checkout -b feat/your-feature-name
```

Commit style:

```bash
feat(rakta): add new framework feature
fix(schema): correct validation error typing
docs(readme): improve framework documentation
chore(repo): update repository structure
```

---

## Author

Created by **Rhein Sullivan**.

Built with a Cirebon soul, a red identity, and a frontend-first mindset.

---

## License

MIT License.

Copyright © Rhein Sullivan.
