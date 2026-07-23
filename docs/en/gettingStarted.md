# Getting started

## Overview

This page gets you from zero to a running Rakta.js app in a few minutes,
using the official generator, `create-rakta-app`.

## When to use this

Read this first if you have never run Rakta.js before. If you already
have a project and want to understand the folder structure, see
[`projectStructure` in `templates.md`](./templates.md) instead.

## Requirements

- [Bun](https://bun.sh) 1.3 or newer
- Node.js is not required - Rakta.js runs entirely on Bun

## Create a project

```bash
bun create rakta-app@latest my-app
```

You will be asked:
1. Project name
2. Project mode - **Frontend only** or **Fullstack**
3. CSS framework - Tailwind CSS v4 (default), Bootstrap, SASS, or none
4. Rendering mode - CSR, SSR, SSG, CSG, SPA, or Hybrid
5. *(Fullstack only)* Backend framework - Gaman.js, Express.js, Nest.js, or Adonis.js
6. *(Fullstack only)* Database - PostgreSQL, MySQL, MongoDB, Firebase, SQLite, MariaDB, Redis, PlanetScale, Neon, or Turso

Other package managers work too:
```bash
bunx create-rakta-app@latest my-app
npm create rakta-app@latest my-app
pnpm create rakta-app@latest my-app
```

## Run the dev server

```bash
cd my-app
bun install
bun run dev
```

Open `http://localhost:3000`. The frontend-only starter shows the Rakta.js
welcome screen with the **ShrimpRun** mini-game - click, tap, or press
Space to jump.

## Your first route

Every file at `app/<path>/page.tsx` becomes a route. Create
`app/about/page.tsx`:
```tsx
import { Click } from "rakta/components";

export default function AboutPage() {
  return (
    <main>
      <h1>About</h1>
      <click to="/">Back home</click>
    </main>
  );
}
```

Visit `/about` - no manual route registration needed. This is
**MendungWeave**, the file-based router. See [`routing.md`](./routing.md)
for the full guide.

## Common mistakes

- Running `bun dev` instead of `bun run dev` - the generated `package.json`
  defines `dev` as a script, not a direct Bun subcommand.
- Trying `npm create-rakta-app@latest my-app` - this is not valid npm
  syntax. Use `npm create rakta-app@latest my-app` (with a space).
- Expecting a `backend/` folder in frontend-only mode - by design, there
  is none.

## Related docs

- [`routing.md`](./routing.md) - MendungWeave file-based routing
- [`templates.md`](./templates.md) - what each generated template contains
- [`backendFrameworks.md`](./backendFrameworks.md) - fullstack backend choices